import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}
