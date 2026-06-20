import { IsString, MinLength, IsOptional, IsInt, Min, IsUUID } from 'class-validator';

export class CreateInventoryItemDto {
  @IsUUID()
  branchId: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalQuantity?: number;
}
