import { IsUUID, IsOptional, IsDateString, IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../payments/domain/entities/payment.entity';

export class CreateSubscriptionDto {
  @IsUUID()
  memberId: string;

  @IsUUID()
  planId: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  paymentAmount?: number;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  paymentNotes?: string;
}
