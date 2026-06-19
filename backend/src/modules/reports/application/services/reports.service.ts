import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../../payments/domain/entities/payment.entity';
import { Member, MemberStatus } from '../../../members/domain/entities/member.entity';
import { Subscription, SubscriptionStatus } from '../../../subscriptions/domain/entities/subscription.entity';
import { CheckIn, CheckInType } from '../../../check-in/domain/entities/check-in.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(CheckIn)
    private readonly checkInRepo: Repository<CheckIn>,
  ) {}

  async getDashboard(): Promise<{
    todayIncome: number;
    activeMembers: number;
    totalMembers: number;
    todayCheckIns: number;
    activeSubscriptions: number;
    incomeLast7Days: { date: string; total: number }[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const incomeRow = await this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.amount), 0)::numeric', 'total')
      .where('p.paidAt >= :today', { today })
      .andWhere('p.paidAt < :tomorrow', { tomorrow })
      .getRawOne();

    const activeMembers = await this.memberRepo.count({ where: { status: MemberStatus.ACTIVE } });
    const totalMembers = await this.memberRepo.count();

    const todayCheckIns = await this.checkInRepo
      .createQueryBuilder('c')
      .where('c.type = :type', { type: CheckInType.ENTRY })
      .andWhere('c.createdAt >= :today', { today })
      .andWhere('c.createdAt < :tomorrow', { tomorrow })
      .getCount();

    const activeSubscriptions = await this.subscriptionRepo.count({ where: { status: SubscriptionStatus.ACTIVE } });

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const incomeRaw = await this.paymentRepo
      .createQueryBuilder('p')
      .select("DATE(p.paidAt)", "date")
      .addSelect('COALESCE(SUM(p.amount), 0)::numeric', 'total')
      .where('p.paidAt >= :sevenDaysAgo', { sevenDaysAgo })
      .andWhere('p.paidAt < :tomorrow', { tomorrow })
      .groupBy('DATE(p.paidAt)')
      .orderBy('DATE(p.paidAt)', 'ASC')
      .getRawMany();

    const incomeMap = new Map<string, number>();
    for (const row of incomeRaw) {
      const dateKey = typeof row.date === 'string'
        ? row.date
        : row.date instanceof Date
          ? row.date.toISOString().split('T')[0]
          : String(row.date);
      incomeMap.set(dateKey, Number(row.total));
    }

    const incomeLast7Days: { date: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      incomeLast7Days.push({ date: dateStr, total: incomeMap.get(dateStr) ?? 0 });
    }

    return {
      todayIncome: Number(incomeRow?.total ?? 0),
      activeMembers,
      totalMembers,
      todayCheckIns,
      activeSubscriptions,
      incomeLast7Days,
    };
  }

  async getIncome(from: string, to: string): Promise<{
    data: { date: string; total: number; count: number }[];
    total: number;
    from: string;
    to: string;
  }> {
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const rows = await this.paymentRepo
      .createQueryBuilder('p')
      .select("DATE(p.paidAt)", "date")
      .addSelect('COALESCE(SUM(p.amount), 0)::numeric', 'total')
      .addSelect('COUNT(p.id)', 'count')
      .where('p.paidAt >= :fromDate', { fromDate })
      .andWhere('p.paidAt <= :toDate', { toDate })
      .groupBy('DATE(p.paidAt)')
      .orderBy('DATE(p.paidAt)', 'ASC')
      .getRawMany();

    const grandTotal = rows.reduce((sum, row) => sum + Number(row.total), 0);

    return {
      data: rows.map((r) => ({
        date: r.date,
        total: Number(r.total),
        count: Number(r.count),
      })),
      total: grandTotal,
      from,
      to,
    };
  }

  async getMembers(): Promise<{
    newMembers: number;
    activeMembers: number;
    cancelledSubscriptions: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newMembers = await this.memberRepo
      .createQueryBuilder('m')
      .where('m.createdAt >= :startOfMonth', { startOfMonth })
      .getCount();

    const activeMembers = await this.memberRepo.count({ where: { status: MemberStatus.ACTIVE } });

    const cancelledSubscriptions = await this.subscriptionRepo
      .createQueryBuilder('s')
      .where('s.status = :status', { status: SubscriptionStatus.CANCELLED })
      .andWhere('s.updatedAt >= :startOfMonth', { startOfMonth })
      .getCount();

    return { newMembers, activeMembers, cancelledSubscriptions };
  }
}
