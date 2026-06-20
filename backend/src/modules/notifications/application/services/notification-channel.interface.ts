import { NotificationType } from '../../domain/enums/notification-type.enum';

export interface SendNotificationInput {
  to: string;
  subject: string;
  body: string;
  type: NotificationType;
}

export interface NotificationChannelInterface {
  send(input: SendNotificationInput): Promise<boolean>;
}
