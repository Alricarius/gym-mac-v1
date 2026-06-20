import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Member } from '../../../members/domain/entities/member.entity';
import { NotificationType } from '../enums/notification-type.enum';
import { NotificationChannel } from '../enums/notification-channel.enum';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  memberId?: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId' })
  member?: Member;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
