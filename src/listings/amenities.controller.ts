import { Controller, Get } from '@nestjs/common';
import { ListingsService } from './listings.service.js';
import { Amenity } from './entities/amenity.entity.js';

@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  findAll(): Promise<Amenity[]> {
    return this.listingsService.findAllAmenities();
  }
}