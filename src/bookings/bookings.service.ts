import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, SelectQueryBuilder } from 'typeorm';
import { Booking } from './entities/booking.entitiy.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { ListingsService } from '../listings/listings.service.js';

const EXCLUSION_VIOLATION = '23P01';
const CHECK_VIOLATION = '23514';
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    private readonly listingsService: ListingsService,
  ) {}

  async create(guestId: number, createBookingDto: CreateBookingDto): Promise<Booking> {
    const listing = await this.listingsService.findOne(createBookingDto.listingId);

    if (listing.isActive === false) {
      throw new BadRequestException('This listing is not available');
    }

    if (listing.hostId === guestId) {
      throw new BadRequestException('You cannot book your own listing');
    }

    if (createBookingDto.guestsCount > listing.maxGuests) {
      throw new BadRequestException(`This listing allows at most ${listing.maxGuests} guests`);
    }

    const today = this.getTodayAsString();
    if (createBookingDto.checkIn < today) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    const nights = this.countNights(createBookingDto.checkIn, createBookingDto.checkOut);
    if (nights < 1) {
      throw new BadRequestException('Check-out must be at least one day after check-in');
    }

    const totalPrice = Math.round(nights * listing.pricePerNight * 100) / 100;

    const newBooking = this.bookingsRepository.create({
      listingId: listing.id,
      guestId: guestId,
      checkIn: createBookingDto.checkIn,
      checkOut: createBookingDto.checkOut,
      guestsCount: createBookingDto.guestsCount,
      totalPrice: totalPrice,
    });

    let savedBooking: Booking;
    try {
      savedBooking = await this.bookingsRepository.save(newBooking);
    } catch (error) {
      const errorCode = this.getPostgresErrorCode(error);

      if (errorCode === EXCLUSION_VIOLATION) {
        throw new ConflictException('These dates are already booked for this listing');
      }
      if (errorCode === CHECK_VIOLATION) {
        throw new BadRequestException('The booking data breaks a database rule');
      }
      throw error;
    }

    return this.findOne(savedBooking.id, guestId);
  }

  async findMyTrips(guestId: number): Promise<Booking[]> {
    const bookings = await this.buildBookingQuery()
      .where('booking.guestId = :guestId', { guestId: guestId })
      .orderBy('booking.checkIn', 'DESC')
      .addOrderBy('image.position', 'ASC')
      .getMany();

    return bookings;
  }

  async findForMyListings(hostId: number): Promise<Booking[]> {
    const bookings = await this.buildBookingQuery()
      .where('listing.hostId = :hostId', { hostId: hostId })
      .orderBy('booking.checkIn', 'DESC')
      .addOrderBy('image.position', 'ASC')
      .getMany();

    return bookings;
  }

  async findOne(id: number, userId: number): Promise<Booking> {
    const booking = await this.buildBookingQuery()
      .where('booking.id = :id', { id: id })
      .orderBy('image.position', 'ASC')
      .getOne();

    if (booking === null) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    const isGuest = booking.guestId === userId;
    const isHost = booking.listing.hostId === userId;

    if (isGuest === false && isHost === false) {
      throw new ForbiddenException('You can only view your own bookings');
    }

    return booking;
  }

  async updateStatus(
    id: number,
    userId: number,
    updateBookingStatusDto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: id },
      relations: { listing: true },
    });

    if (booking === null) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    const isGuest = booking.guestId === userId;
    const isHost = booking.listing.hostId === userId;

    if (isGuest === false && isHost === false) {
      throw new ForbiddenException('You can only change your own bookings');
    }

    if (booking.status === 'cancelled') {
      throw new BadRequestException('This booking is already cancelled');
    }

    const newStatus = updateBookingStatusDto.status;

    if (newStatus === 'confirmed') {
      if (isHost === false) {
        throw new ForbiddenException('Only the host can confirm a booking');
      }
      if (booking.status !== 'pending') {
        throw new BadRequestException('Only pending bookings can be confirmed');
      }
    }

    if (newStatus === 'cancelled') {
      const today = this.getTodayAsString();
      if (booking.checkIn <= today) {
        throw new BadRequestException('A booking that has already started cannot be cancelled');
      }
    }

    booking.status = newStatus;
    await this.bookingsRepository.save(booking);

    return this.findOne(id, userId);
  }

  private buildBookingQuery(): SelectQueryBuilder<Booking> {
    return this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.listing', 'listing')
      .leftJoinAndSelect('listing.images', 'image')
      .leftJoin('booking.guest', 'guest')
      .addSelect(['guest.id', 'guest.fullName', 'guest.avatarUrl']);
  }

  private getTodayAsString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private countNights(checkIn: string, checkOut: string): number {
    const checkInTime = new Date(`${checkIn}T00:00:00Z`).getTime();
    const checkOutTime = new Date(`${checkOut}T00:00:00Z`).getTime();
    return Math.round((checkOutTime - checkInTime) / MILLISECONDS_PER_DAY);
  }

  private getPostgresErrorCode(error: unknown): string | undefined {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string };
      return driverError.code;
    }
    return undefined;
  }
}