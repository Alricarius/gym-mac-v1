import { IsUUID, IsOptional, IsInt, Min, IsString } from 'class-validator';

export class CreateLoanDto {
  @IsUUID()
  memberId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
