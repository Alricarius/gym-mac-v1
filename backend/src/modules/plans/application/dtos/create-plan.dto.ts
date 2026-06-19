import {
  IsString, MinLength, MaxLength, IsInt, Min,
  IsNumber, IsOptional, IsBoolean,
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @IsInt()
  @Min(1)
  duration: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  classCount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
