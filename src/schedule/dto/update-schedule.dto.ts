import { IsDateString, IsIn, IsMongoId, IsOptional } from 'class-validator';
import {
  scheduleStatusValues,
  type ScheduleStatus,
} from './create-schedule.dto';

export class UpdateScheduleDto {
  @IsOptional()
  @IsMongoId()
  artistId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsIn(scheduleStatusValues)
  status?: ScheduleStatus;
}
