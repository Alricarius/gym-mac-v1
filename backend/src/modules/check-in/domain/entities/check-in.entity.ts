import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Member } from '../../../members/domain/entities/member.entity';
import { Branch } from '../../../branches/domain/entities/branch.entity';
import { User } from '../../../users/domain/entities/user.entity';

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

  @Column()
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ type: 'enum', enum: CheckInType })
  type: CheckInType;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;
}
