import { IsIn } from 'class-validator';
export class UpdateRequestStatusDto {
  @IsIn(['accepted', 'rejected', 'completed', 'cancelled'])
  status: 'accepted' | 'rejected' | 'completed' | 'cancelled';
}
