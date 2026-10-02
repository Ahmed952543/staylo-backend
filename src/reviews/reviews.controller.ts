import { Controller, Get, Post, Param, Body, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import type { ListingReviews } from './reviews.service.js';
import { Review } from './entities/review.entity.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/jwt-payload.js';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    return this.reviewsService.create(request.user.sub, createReviewDto);
  }

  @Get('listing/:listingId')
  findForListing(@Param('listingId', ParseIntPipe) listingId: number): Promise<ListingReviews> {
    return this.reviewsService.findForListing(listingId);
  }
}