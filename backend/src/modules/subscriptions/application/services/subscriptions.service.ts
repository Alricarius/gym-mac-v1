import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../../domain/entities/subscription.entity';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { QuerySubscriptionDto } from '../dtos/query-subscription.dto';
import { PlansService } from '../../../plans/application/services/plans.service';
import { Payment } from '../../../payments/domain/entities/payment.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly repo: Repository<Subscription>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly plansService: PlansService,
  ) {}

  async create(dto: CreateSubscriptionDto): Promise<Subscription> {
    const plan = await this.plansService.findById(dto.planId);

    const activeSubscription = await this.repo.findOne({
      where: {
        memberId: dto.memberId,
        status: SubscriptionStatus.ACTIVE,
      },
    });
    if (activeSubscription) {
      throw new ConflictException('Member already has an active subscription');
    }

    const startDate = dto.startDate || new Date().toISOString().split('T')[0];
    const endDate = this.calculateEndDate(startDate, plan.duration);

    const subscription = this.repo.create({
      memberId: dto.memberId,
      planId: dto.planId,
      startDate,
      endDate,
    });

    const saved = await this.repo.save(subscription);

    const amount = dto.paymentAmount ?? Number(plan.price);

    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const now = new Date();
    const payment = this.paymentRepo.create({
      subscriptionId: saved.id,
      memberId: dto.memberId,
      amount,
      method: dto.paymentMethod,
      reference: dto.paymentReference,
      notes: dto.paymentNotes,
      paidAt: now,
      branchId: dto.paymentBranchId,
    });

    await this.paymentRepo.save(payment);
    await this.repo.update(saved.id, { lastPaymentAt: now });

    return this.findById(saved.id);
  }

  async findAll(query: QuerySubscriptionDto) {
    const { memberId, status, page = 1, limit = 20 } = query;
    const where: any = {};

    if (memberId) where.memberId = memberId;
    if (status) where.status = status;

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['member', 'plan'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<Subscription> {
    const subscription = await this.repo.findOne({
      where: { id },
      relations: ['member', 'plan'],
    });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return subscription;
  }

  async pause(id: string): Promise<Subscription> {
    const subscription = await this.findById(id);
    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('Only active subscriptions can be paused');
    }
    subscription.status = SubscriptionStatus.PAUSED;
    subscription.pausedAt = new Date().toISOString().split('T')[0];
    return this.repo.save(subscription);
  }

  async resume(id: string): Promise<Subscription> {
    const subscription = await this.findById(id);
    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new BadRequestException('Only paused subscriptions can be resumed');
    }

    const pausedAt = new Date(subscription.pausedAt!);
    const resumedAt = new Date();
    const daysPaused = Math.ceil(
      (resumedAt.getTime() - pausedAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    subscription.pausedDays += daysPaused;

    const currentEnd = new Date(subscription.endDate);
    currentEnd.setDate(currentEnd.getDate() + daysPaused);

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.endDate = currentEnd.toISOString().split('T')[0];
    subscription.pausedAt = undefined as any;
    return this.repo.save(subscription);
  }

  async cancel(id: string): Promise<Subscription> {
    const subscription = await this.findById(id);
    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('Subscription is already cancelled');
    }
    if (subscription.status === SubscriptionStatus.EXPIRED) {
      throw new BadRequestException('Cannot cancel an expired subscription');
    }
    subscription.status = SubscriptionStatus.CANCELLED;
    return this.repo.save(subscription);
  }

  async updateLastPayment(id: string, paidAt: Date): Promise<void> {
    await this.repo.update(id, { lastPaymentAt: paidAt });
  }

  private calculateEndDate(startDate: string, durationDays: number): string {
    const date = new Date(startDate);
    date.setDate(date.getDate() + durationDays);
    return date.toISOString().split('T')[0];
  }
}
