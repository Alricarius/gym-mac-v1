import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
  ManyToOne, JoinColumn,
  OneToMany,
} from 'typeorm';
import { Schedule } from './schedule.entity';
import { User } from '../../../users/domain/entities/user.entity';

@Entity('classes')
export class GymClass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('int')
  capacity: number;

  @Column({ length: 7, nullable: true })
  color?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => Schedule, (schedule) => schedule.gymClass)
  schedules: Schedule[];
}
