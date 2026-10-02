import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from './entities/listing.entity.js';
import { ListingImage } from './entities/listing-image.entity.js';
import { Amenity } from './entities/amenity.entity.js';
import { ListingsService } from './listings.service.js';
import { ListingsController } from './listings.controller.js';
import { AmenitiesController } from './amenities.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, ListingImage, Amenity])],
  controllers: [ListingsController, AmenitiesController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}