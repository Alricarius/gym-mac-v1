import { IsUUID, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  scheduleId: string;

  @IsUUID()
  memberId: string;

  @IsDateString()
  bookingDate: string;
}
