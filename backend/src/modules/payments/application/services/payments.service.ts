import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../domain/entities/payment.entity';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { QueryPaymentDto } from '../dtos/query-payment.dto';
import { Branch } from '../../../branches/domain/entities/branch.entity';
import { SubscriptionsService } from '../../../subscriptions/application/services/subscriptions.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  private async resolveBranchId(branchId?: string): Promise<string> {
    if (branchId) return branchId;
    const first = await this.branchRepo.find({ take: 1, order: { name: 'ASC' } });
    return first[0]?.id;
  }

  async create(dto: CreatePaymentDto, createdById: string): Promise<Payment> {
    const subscription = await this.subscriptionsService.findById(dto.subscriptionId);

    const amount = dto.amount ?? Number(subscription.plan.price);

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const payment = this.repo.create({
      subscriptionId: dto.subscriptionId,
      memberId: subscription.memberId,
      amount,
      method: dto.method,
      reference: dto.reference,
      notes: dto.notes,
      paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
      branchId: await this.resolveBranchId(dto.branchId),
      createdById,
    });

    const saved = await this.repo.save(payment);

    await this.subscriptionsService.updateLastPayment(subscription.id, saved.paidAt);

    return this.findById(saved.id);
  }

  async findAll(query: QueryPaymentDto) {
    const { memberId, subscriptionId, method, page = 1, limit = 20 } = query;
    const where: any = {};

    if (memberId) where.memberId = memberId;
    if (subscriptionId) where.subscriptionId = subscriptionId;
    if (method) where.method = method;

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['subscription', 'subscription.member', 'subscription.plan', 'member'],
      order: { paidAt: 'DESC' },
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

  async findById(id: string): Promise<Payment> {
    const payment = await this.repo.findOne({
      where: { id },
      relations: ['subscription', 'subscription.member', 'subscription.plan', 'member'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async getReceipt(id: string) {
    const payment = await this.findById(id);
    return {
      receiptNumber: payment.id,
      member: payment.member?.fullName ?? payment.subscription?.member?.fullName ?? 'N/A',
      plan: payment.subscription?.plan?.name ?? 'N/A',
      amount: Number(payment.amount),
      method: payment.method,
      reference: payment.reference,
      paidAt: payment.paidAt,
      subscriptionStart: payment.subscription?.startDate,
      subscriptionEnd: payment.subscription?.endDate,
    };
  }
}
