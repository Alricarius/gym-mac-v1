import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { GymClass } from '../../../classes/domain/entities/gym-class.entity';
import { Schedule } from '../../../classes/domain/entities/schedule.entity';
import { Member } from '../../../members/domain/entities/member.entity';
import { User } from '../../../users/domain/entities/user.entity';

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  WAITLISTED = 'waitlisted',
  ATTENDED = 'attended',
  NO_SHOW = 'no_show',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  classId: string;

  @Column()
  scheduleId: string;

  @Column()
  memberId: string;

  @Column({ type: 'date' })
  bookingDate: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => GymClass)
  @JoinColumn({ name: 'classId' })
  gymClass: GymClass;

  @ManyToOne(() => Schedule)
  @JoinColumn({ name: 'scheduleId' })
  schedule: Schedule;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;
}
