import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum WeekDay {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Entity('gym_config')
export class GymConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  gymName: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'jsonb', nullable: true })
  openingHours?: Record<string, string>;

  @Column({ type: 'text', nullable: true })
  cancellationPolicy?: string;

  @Column({ type: 'int', default: 0 })
  graceDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ length: 50, default: 'America/La_Paz' })
  timezone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
