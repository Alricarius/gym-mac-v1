import { Injectable } from '@nestjs/common';
import { NotificationChannelInterface, SendNotificationInput } from './notification-channel.interface';

@Injectable()
export class EmailChannelService implements NotificationChannelInterface {
  async send(input: SendNotificationInput): Promise<boolean> {
    console.log(`[EMAIL MOCK] To: ${input.to}`);
    console.log(`[EMAIL MOCK] Subject: ${input.subject}`);
    console.log(`[EMAIL MOCK] Body: ${input.body}`);
    return true;
  }
}
