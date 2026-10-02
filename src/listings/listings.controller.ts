import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ListingsService } from './listings.service.js';
import { Listing } from './entities/listing.entity.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
import { UpdateListingDto } from './dto/update-listing.dto.js';
import { ListingQueryDto } from './dto/listing-query.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/jwt-payload.js';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  findAll(@Query() query: ListingQueryDto): Promise<Listing[]> {
    return this.listingsService.findAll(query);
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  findMine(@Req() request: AuthenticatedRequest): Promise<Listing[]> {
    return this.listingsService.findByHost(request.user.sub);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Listing> {
    return this.listingsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createListingDto: CreateListingDto,
  ): Promise<Listing> {
    return this.listingsService.create(request.user.sub, createListingDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
    @Body() updateListingDto: UpdateListingDto,
  ): Promise<Listing> {
    return this.listingsService.update(id, request.user.sub, updateListingDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  deactivate(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    return this.listingsService.deactivate(id, request.user.sub);
  }
}