import { IsString, MinLength, IsOptional, IsObject, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateGymConfigDto {
  @IsString()
  @MinLength(2)
  gymName: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsObject()
  openingHours?: Record<string, string>;

  @IsOptional()
  @IsString()
  cancellationPolicy?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  graceDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxRate?: number;

  @IsOptional()
  @IsString()
  timezone?: string;
}
