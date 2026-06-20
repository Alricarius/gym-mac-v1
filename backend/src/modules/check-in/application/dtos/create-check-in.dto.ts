import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { CheckInType } from '../../domain/entities/check-in.entity';

export class CreateCheckInDto {
  @IsUUID()
  memberId: string;

  @IsEnum(CheckInType)
  type: CheckInType;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}
