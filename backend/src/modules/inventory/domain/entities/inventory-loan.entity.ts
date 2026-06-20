import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { InventoryItem } from './inventory-item.entity';
import { Member } from '../../../members/domain/entities/member.entity';
import { User } from '../../../users/domain/entities/user.entity';

@Entity('inventory_loans')
export class InventoryLoan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  inventoryItemId: string;

  @ManyToOne(() => InventoryItem)
  @JoinColumn({ name: 'inventoryItemId' })
  inventoryItem: InventoryItem;

  @Column()
  memberId: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @Column({ default: 1 })
  quantity: number;

  @CreateDateColumn()
  loanedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  returnedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;
}
