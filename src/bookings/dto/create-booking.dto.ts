import { IsInt, Min, Max, IsDateString, Matches } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  @Min(1)
  listingId!: number;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkIn must be in YYYY-MM-DD format' })
  checkIn!: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'checkOut must be in YYYY-MM-DD format' })
  checkOut!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  guestsCount!: number;
}