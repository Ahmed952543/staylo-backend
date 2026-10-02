import { IsIn } from 'class-validator';

export class UpdateBookingDto {
  @IsIn(['confirmed', 'cancelled'])
  status!: 'confirmed' | 'cancelled';
}