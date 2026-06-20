import {
  IsUUID, IsOptional, IsNumber, IsString, IsEnum, Min, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../domain/entities/payment.entity';

export class CreatePaymentDto {
  @IsUUID()
  subscriptionId: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}
