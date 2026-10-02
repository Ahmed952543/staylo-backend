import {IsOptional,IsString,Length,IsUrl } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @Length(1, 100)
    fullName?: string;

    
    @IsOptional()
    @IsUrl()
    avatarUrl?: string;


}