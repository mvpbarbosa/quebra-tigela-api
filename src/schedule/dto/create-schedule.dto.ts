import { IsDateString, IsIn, IsMongoId } from 'class-validator';
export class CreateScheduleDto {
  @IsMongoId() artistId: string;
  @IsDateString() date: string;
  @IsIn(['available', 'unavailable']) status: 'available' | 'unavailable';
}
