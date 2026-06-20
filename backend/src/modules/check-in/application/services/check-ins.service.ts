import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CheckIn, CheckInType } from '../../domain/entities/check-in.entity';
import { CreateCheckInDto } from '../dtos/create-check-in.dto';
import { Member } from '../../../members/domain/entities/member.entity';
import { Branch } from '../../../branches/domain/entities/branch.entity';
import { Subscription, SubscriptionStatus } from '../../../subscriptions/domain/entities/subscription.entity';
import { CheckInGateway } from '../../interfaces/gateways/check-in.gateway';

@Injectable()
export class CheckInsService {
  constructor(
    @InjectRepository(CheckIn)
    private readonly checkInRepo: Repository<CheckIn>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    private readonly gateway: CheckInGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async verify(memberId: string, branchId?: string) {
    const member = await this.memberRepo.findOne({
      where: { id: memberId },
      relations: ['branch'],
    });
    if (!member) throw new NotFoundException('Member not found');

    if (branchId && member.branchId && member.branchId !== branchId) {
      const branch = await this.branchRepo.findOne({ where: { id: member.branchId } });
      return {
        canEnter: false,
        reason: 'wrong_branch',
        member: {
          id: member.id,
          fullName: member.fullName,
          branchId: member.branchId,
          branchName: branch?.name || 'Unknown',
        },
      };
    }

    if (branchId && !member.branchId) {
      member.branchId = branchId;
      await this.memberRepo.save(member);
    }

    const subscription = await this.subscriptionRepo.findOne({
      where: {
        memberId,
        status: SubscriptionStatus.ACTIVE,
        endDate: MoreThan(new Date().toISOString().split('T')[0]),
      },
      order: { endDate: 'DESC' },
    });

    if (!subscription) {
      return { canEnter: false, reason: 'No tiene una suscripción activa' };
    }

    return { canEnter: true, member, subscription };
  }

  async checkIn(dto: CreateCheckInDto, createdById: string) {
    const branchId = dto.branchId;
    const verification = await this.verify(dto.memberId, branchId);
    if (!verification.canEnter) throw new BadRequestException(verification.reason);

    const checkIn = this.checkInRepo.create({
      memberId: dto.memberId,
      type: CheckInType.ENTRY,
      branchId: branchId || (verification as any).member.branchId,
      createdById,
    });
    const saved = await this.checkInRepo.save(checkIn);
    const result = await this.checkInRepo.findOne({
      where: { id: saved.id },
      relations: ['member'],
    });

    this.gateway.emitCheckInUpdate();

    const { member, subscription } = verification as { canEnter: true; member: Member; subscription: Subscription };
    if (member && subscription) {
      const endDate = new Date(subscription.endDate);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const remainingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      this.eventEmitter.emit('member.checked-in', {
        memberId: member.id,
        memberEmail: member.email || '',
        memberPhone: member.phone || null,
        memberFullName: member.fullName,
        remainingDays,
      });
    }

    return result;
  }

  async checkOut(dto: CreateCheckInDto, createdById: string) {
    const member = await this.memberRepo.findOne({ where: { id: dto.memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const checkIn = this.checkInRepo.create({
      memberId: dto.memberId,
      type: CheckInType.EXIT,
      branchId: dto.branchId || member.branchId,
      createdById,
    });
    const saved = await this.checkInRepo.save(checkIn);
    const result = await this.checkInRepo.findOne({
      where: { id: saved.id },
      relations: ['member'],
    });

    this.gateway.emitCheckInUpdate();
    return result;
  }

  async findActive(branchId?: string) {
    let whereClause = `
      SELECT ci.id, ci."memberId", ci.type, ci."createdAt",
             m."fullName", m."photoUrl"
      FROM check_ins ci
      INNER JOIN members m ON m.id = ci."memberId"
      WHERE ci.type = 'entry'
      AND NOT EXISTS (
        SELECT 1 FROM check_ins ci2
        WHERE ci2."memberId" = ci."memberId"
        AND ci2.type = 'exit'
        AND ci2."createdAt" > ci."createdAt"
      )
    `;
    if (branchId) {
      whereClause += ` AND ci."branchId" = $1`;
    }
    whereClause += ` ORDER BY ci."createdAt" DESC`;
    const params = branchId ? [branchId] : [];
    return this.checkInRepo.query(whereClause, params);
  }

  async updateMemberBranch(memberId: string, branchId: string) {
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch) throw new NotFoundException('Branch not found');
    member.branchId = branchId;
    return this.memberRepo.save(member);
  }
}
