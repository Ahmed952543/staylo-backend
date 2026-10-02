import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { Booking } from './entities/booking.entitiy.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/jwt-payload.js';

@Controller('bookings')
@UseGuards(AuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    return this.bookingsService.create(request.user.sub, createBookingDto);
  }

  @Get('mine')
  findMyTrips(@Req() request: AuthenticatedRequest): Promise<Booking[]> {
    return this.bookingsService.findMyTrips(request.user.sub);
  }

  @Get('hosting')
  findForMyListings(@Req() request: AuthenticatedRequest): Promise<Booking[]> {
    return this.bookingsService.findForMyListings(request.user.sub);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<Booking> {
    return this.bookingsService.findOne(id, request.user.sub);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
    @Body() updateBookingStatusDto: UpdateBookingDto,
  ): Promise<Booking> {
    return this.bookingsService.updateStatus(id, request.user.sub, updateBookingStatusDto);
  }
}