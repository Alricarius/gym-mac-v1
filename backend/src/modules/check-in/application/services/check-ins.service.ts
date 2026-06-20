import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CheckIn, CheckInType } from '../../domain/entities/check-in.entity';
import { CreateCheckInDto } from '../dtos/create-check-in.dto';
import { Member } from '../../../members/domain/entities/member.entity';
import { Subscription, SubscriptionStatus } from '../../../subscriptions/domain/entities/subscription.entity';
import { CheckInGateway } from '../../interfaces/gateways/check-in.gateway';

@Injectable()
export class CheckInsService {
  constructor(
    @InjectRepository(CheckIn)
    private readonly checkInRepo: Repository<CheckIn>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    private readonly gateway: CheckInGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async verify(memberId: string) {
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

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

  async checkIn(dto: CreateCheckInDto) {
    const verification = await this.verify(dto.memberId);
    if (!verification.canEnter) throw new BadRequestException(verification.reason);

    const checkIn = this.checkInRepo.create({ memberId: dto.memberId, type: CheckInType.ENTRY });
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

  async checkOut(dto: CreateCheckInDto) {
    const member = await this.memberRepo.findOne({ where: { id: dto.memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const checkIn = this.checkInRepo.create({ memberId: dto.memberId, type: CheckInType.EXIT });
    const saved = await this.checkInRepo.save(checkIn);
    const result = await this.checkInRepo.findOne({
      where: { id: saved.id },
      relations: ['member'],
    });

    this.gateway.emitCheckInUpdate();
    return result;
  }

  async findActive() {
    const raw = await this.checkInRepo.query(`
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
      ORDER BY ci."createdAt" DESC
    `);
    return raw;
  }
}
