import {
  IsString,
  Length,
  MinLength,
  IsIn,
  IsNumber,
  IsPositive,
  Max,
  IsInt,
  Min,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  ArrayUnique,
  IsUrl,
} from 'class-validator';
import { PROPERTY_TYPES } from '../entities/listing.entity.js';
import type { PropertyType } from '../entities/listing.entity.js';

export class CreateListingDto {
  @IsString()
  @Length(3, 150)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsIn(PROPERTY_TYPES)
  propertyType!: PropertyType;

  @IsString()
  @Length(2, 100)
  city!: string;

  @IsString()
  @Length(2, 100)
  country!: string;

  @IsString()
  @Length(3, 255)
  address!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99999999.99)
  pricePerNight!: number;

  @IsInt()
  @Min(1)
  @Max(100)
  maxGuests!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  beds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  bathrooms?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUrl({}, { each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  amenityIds?: number[];
}