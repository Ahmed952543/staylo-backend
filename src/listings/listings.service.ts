import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Listing } from './entities/listing.entity.js';
import { ListingImage } from './entities/listing-image.entity.js';
import { Amenity } from './entities/amenity.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
import { UpdateListingDto } from './dto/update-listing.dto.js';
import { ListingQueryDto } from './dto/listing-query.dto.js';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingsRepository: Repository<Listing>,
    @InjectRepository(ListingImage)
    private readonly imagesRepository: Repository<ListingImage>,
    @InjectRepository(Amenity)
    private readonly amenitiesRepository: Repository<Amenity>,
  ) {}

  async findAll(query: ListingQueryDto): Promise<Listing[]> {
    const queryBuilder = this.listingsRepository
      .createQueryBuilder('listing')
      .leftJoin('listing.host', 'host')
      .addSelect(['host.id', 'host.fullName', 'host.avatarUrl'])
      .leftJoinAndSelect('listing.images', 'image')
      .where('listing.isActive = :isActive', { isActive: true });

    if (query.city !== undefined) {
      queryBuilder.andWhere('listing.city ILIKE :city', { city: `%${query.city}%` });
    }

    if (query.guests !== undefined) {
      queryBuilder.andWhere('listing.maxGuests >= :guests', { guests: query.guests });
    }

    if (query.minPrice !== undefined) {
      queryBuilder.andWhere('listing.pricePerNight >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice !== undefined) {
      queryBuilder.andWhere('listing.pricePerNight <= :maxPrice', { maxPrice: query.maxPrice });
    }

    queryBuilder.orderBy('listing.id', 'ASC').addOrderBy('image.position', 'ASC');

    const listings = await queryBuilder.getMany();
    return listings;
  }

  async findOne(id: number): Promise<Listing> {
    const listing = await this.listingsRepository
      .createQueryBuilder('listing')
      .leftJoin('listing.host', 'host')
      .addSelect(['host.id', 'host.fullName', 'host.avatarUrl'])
      .leftJoinAndSelect('listing.images', 'image')
      .leftJoinAndSelect('listing.amenities', 'amenity')
      .where('listing.id = :id', { id: id })
      .orderBy('image.position', 'ASC')
      .addOrderBy('amenity.name', 'ASC')
      .getOne();

    if (listing === null) {
      throw new NotFoundException(`Listing with id ${id} not found`);
    }

    return listing;
  }

  async findByHost(hostId: number): Promise<Listing[]> {
    const listings = await this.listingsRepository.find({
      where: { hostId: hostId },
      relations: { images: true },
      order: { id: 'ASC', images: { position: 'ASC' } },
    });
    return listings;
  }

  async findAllAmenities(): Promise<Amenity[]> {
    const amenities = await this.amenitiesRepository.find({
      order: { name: 'ASC' },
    });
    return amenities;
  }

  async create(hostId: number, createListingDto: CreateListingDto): Promise<Listing> {
    const amenities = await this.findAmenitiesByIds(createListingDto.amenityIds ?? []);

    const images: ListingImage[] = [];
    const imageUrls = createListingDto.imageUrls ?? [];
    imageUrls.forEach((url, index) => {
      const image = this.imagesRepository.create({ url: url, position: index });
      images.push(image);
    });

    const newListing = this.listingsRepository.create({
      hostId: hostId,
      title: createListingDto.title,
      description: createListingDto.description,
      propertyType: createListingDto.propertyType,
      city: createListingDto.city,
      country: createListingDto.country,
      address: createListingDto.address,
      pricePerNight: createListingDto.pricePerNight,
      maxGuests: createListingDto.maxGuests,
      bedrooms: createListingDto.bedrooms,
      beds: createListingDto.beds,
      bathrooms: createListingDto.bathrooms,
      images: images,
      amenities: amenities,
    });

    const savedListing = await this.listingsRepository.save(newListing);

    await this.listingsRepository.manager.update(User, hostId, { isHost: true });

    return this.findOne(savedListing.id);
  }

  async update(id: number, userId: number, updateListingDto: UpdateListingDto): Promise<Listing> {
    const listing = await this.findOwnedListing(id, userId);

    if (updateListingDto.title !== undefined) {
      listing.title = updateListingDto.title;
    }
    if (updateListingDto.description !== undefined) {
      listing.description = updateListingDto.description;
    }
    if (updateListingDto.propertyType !== undefined) {
      listing.propertyType = updateListingDto.propertyType;
    }
    if (updateListingDto.city !== undefined) {
      listing.city = updateListingDto.city;
    }
    if (updateListingDto.country !== undefined) {
      listing.country = updateListingDto.country;
    }
    if (updateListingDto.address !== undefined) {
      listing.address = updateListingDto.address;
    }
    if (updateListingDto.pricePerNight !== undefined) {
      listing.pricePerNight = updateListingDto.pricePerNight;
    }
    if (updateListingDto.maxGuests !== undefined) {
      listing.maxGuests = updateListingDto.maxGuests;
    }
    if (updateListingDto.bedrooms !== undefined) {
      listing.bedrooms = updateListingDto.bedrooms;
    }
    if (updateListingDto.beds !== undefined) {
      listing.beds = updateListingDto.beds;
    }
    if (updateListingDto.bathrooms !== undefined) {
      listing.bathrooms = updateListingDto.bathrooms;
    }
    if (updateListingDto.isActive !== undefined) {
      listing.isActive = updateListingDto.isActive;
    }
    if (updateListingDto.amenityIds !== undefined) {
      listing.amenities = await this.findAmenitiesByIds(updateListingDto.amenityIds);
    }

    await this.listingsRepository.save(listing);

    if (updateListingDto.imageUrls !== undefined) {
      await this.imagesRepository.delete({ listingId: id });

      const newImages: ListingImage[] = [];
      updateListingDto.imageUrls.forEach((url, index) => {
        const image = this.imagesRepository.create({ listingId: id, url: url, position: index });
        newImages.push(image);
      });

      await this.imagesRepository.save(newImages);
    }

    return this.findOne(id);
  }

  async deactivate(id: number, userId: number): Promise<{ message: string }> {
    const listing = await this.findOwnedListing(id, userId);

    listing.isActive = false;
    await this.listingsRepository.save(listing);

    return { message: `Listing ${id} is now hidden` };
  }

  private async findOwnedListing(id: number, userId: number): Promise<Listing> {
    const listing = await this.listingsRepository.findOne({
      where: { id: id },
      relations: { amenities: true },
    });

    if (listing === null) {
      throw new NotFoundException(`Listing with id ${id} not found`);
    }

    if (listing.hostId !== userId) {
      throw new ForbiddenException('You can only change your own listings');
    }

    return listing;
  }

  private async findAmenitiesByIds(amenityIds: number[]): Promise<Amenity[]> {
    if (amenityIds.length === 0) {
      return [];
    }

    const amenities = await this.amenitiesRepository.findBy({ id: In(amenityIds) });

    if (amenities.length !== amenityIds.length) {
      throw new BadRequestException('One or more amenity ids do not exist');
    }

    return amenities;
  }
}