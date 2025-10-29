import { IsDateString, IsIn, IsMongoId } from 'class-validator';

export const scheduleStatusValues = [
  'available',
  'unavailable',
  'booked',
] as const;

export type ScheduleStatus = (typeof scheduleStatusValues)[number];

export class CreateScheduleDto {
  @IsMongoId()
  artistId: string;

  @IsDateString()
  date: string;

  @IsIn(scheduleStatusValues)
  status: ScheduleStatus;
}
