import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { BookingsService } from '../bookings/bookings.service.js';
import { getPostgresErrorCode, UNIQUE_VIOLATION } from '../common/postgres-errors.js';

export interface ListingReviews {
  averageRating: number | null;
  reviewCount: number;
  reviews: Review[];
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    private readonly bookingsService: BookingsService,
  ) {}

  async create(userId: number, createReviewDto: CreateReviewDto): Promise<Review> {
    const booking = await this.bookingsService.findOne(createReviewDto.bookingId, userId);

    if (booking.guestId !== userId) {
      throw new ForbiddenException('Only the guest who stayed can review this booking');
    }

    if (booking.status !== 'confirmed') {
      throw new BadRequestException('Only confirmed bookings can be reviewed');
    }

    const today = new Date().toISOString().slice(0, 10);
    if (booking.checkOut > today) {
      throw new BadRequestException('You can review a stay only after check-out');
    }

    const newReview = this.reviewsRepository.create({
      bookingId: booking.id,
      listingId: booking.listingId,
      guestId: userId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment ?? null,
    });

    let savedReview: Review;
    try {
      savedReview = await this.reviewsRepository.save(newReview);
    } catch (error) {
      if (getPostgresErrorCode(error) === UNIQUE_VIOLATION) {
        throw new ConflictException('You have already reviewed this stay');
      }
      throw error;
    }

    return this.findOne(savedReview.id);
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoin('review.guest', 'guest')
      .addSelect(['guest.id', 'guest.fullName', 'guest.avatarUrl'])
      .where('review.id = :id', { id: id })
      .getOne();

    if (review === null) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }

    return review;
  }

  async findForListing(listingId: number): Promise<ListingReviews> {
    const reviews = await this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoin('review.guest', 'guest')
      .addSelect(['guest.id', 'guest.fullName', 'guest.avatarUrl'])
      .where('review.listingId = :listingId', { listingId: listingId })
      .orderBy('review.createdAt', 'DESC')
      .getMany();

    const summary = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('ROUND(AVG(review.rating), 1)', 'averageRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('review.listingId = :listingId', { listingId: listingId })
      .getRawOne<{ averageRating: string | null; reviewCount: string }>();

    let averageRating: number | null = null;
    let reviewCount = 0;

    if (summary !== undefined) {
      if (summary.averageRating !== null) {
        averageRating = Number(summary.averageRating);
      }
      reviewCount = Number(summary.reviewCount);
    }

    return {
      averageRating: averageRating,
      reviewCount: reviewCount,
      reviews: reviews,
    };
  }
}