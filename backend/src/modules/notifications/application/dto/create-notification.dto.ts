import { IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { NotificationChannel } from '../../domain/enums/notification-channel.enum';

export class CreateNotificationDto {
  @IsUUID()
  @IsOptional()
  memberId?: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsString()
  subject: string;

  @IsString()
  body: string;
}
