import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateListingDto } from './create-listing.dto.js';

export class UpdateListingDto extends PartialType(CreateListingDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}