import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';

export enum MemberGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  fullName: string;

  @Column({ unique: true, length: 100, nullable: true })
  email?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: string;

  @Column({ type: 'enum', enum: MemberGender, nullable: true })
  gender?: MemberGender;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ length: 500, nullable: true })
  photoUrl?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.ACTIVE })
  status: MemberStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
