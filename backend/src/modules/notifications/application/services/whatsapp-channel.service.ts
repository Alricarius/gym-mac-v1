import { Injectable } from '@nestjs/common';
import { NotificationChannelInterface, SendNotificationInput } from './notification-channel.interface';

@Injectable()
export class WhatsAppChannelService implements NotificationChannelInterface {
  async send(input: SendNotificationInput): Promise<boolean> {
    console.log(`[WHATSAPP MOCK] To: ${input.to}`);
    console.log(`[WHATSAPP MOCK] Message: ${input.subject} - ${input.body}`);
    return true;
  }
}
