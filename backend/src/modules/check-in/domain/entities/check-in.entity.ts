import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Member } from '../../../members/domain/entities/member.entity';

export enum CheckInType {
  ENTRY = 'entry',
  EXIT = 'exit',
}

@Entity('check_ins')
export class CheckIn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  memberId: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @Column({ type: 'enum', enum: CheckInType })
  type: CheckInType;

  @CreateDateColumn()
  createdAt: Date;
}
