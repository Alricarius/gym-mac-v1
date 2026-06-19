import { IsUUID, IsOptional, IsDateString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  memberId: string;

  @IsUUID()
  planId: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;
}
