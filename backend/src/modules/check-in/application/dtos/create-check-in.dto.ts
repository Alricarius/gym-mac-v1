import { IsString, IsUUID, IsEnum } from 'class-validator';
import { CheckInType } from '../../domain/entities/check-in.entity';

export class CreateCheckInDto {
  @IsUUID()
  memberId: string;

  @IsEnum(CheckInType)
  type: CheckInType;
}
