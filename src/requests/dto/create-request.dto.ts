import { IsDateString, IsMongoId, IsOptional, IsString } from 'class-validator';
export class CreateRequestDto {
  @IsMongoId() userId: string;
  @IsMongoId() artistId: string;
  @IsMongoId() serviceId: string;
  @IsDateString() eventDate: string;
  @IsString() location: string;
  @IsOptional() @IsString() details?: string;
}
