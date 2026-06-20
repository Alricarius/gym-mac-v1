import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Booking, BookingStatus } from '../../domain/entities/booking.entity';
import { GymClass } from '../../../classes/domain/entities/gym-class.entity';
import { Schedule } from '../../../classes/domain/entities/schedule.entity';
import { Subscription, SubscriptionStatus } from '../../../subscriptions/domain/entities/subscription.entity';
import { CreateBookingDto } from '../dtos/create-booking.dto';
import { UpdateBookingDto } from '../dtos/update-booking.dto';
import { QueryBookingDto } from '../dtos/query-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(GymClass)
    private readonly classRepo: Repository<GymClass>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async create(dto: CreateBookingDto): Promise<Booking> {
    const gymClass = await this.classRepo.findOne({
      where: { id: dto.classId, isActive: true },
    });
    if (!gymClass) throw new NotFoundException('Class not found or inactive');

    const schedule = await this.scheduleRepo.findOne({
      where: { id: dto.scheduleId, classId: dto.classId },
    });
    if (!schedule) throw new NotFoundException('Schedule not found for this class');

    const hasActiveSubscription = await this.subscriptionRepo.findOne({
      where: {
        memberId: dto.memberId,
        status: SubscriptionStatus.ACTIVE,
        endDate: MoreThanOrEqual(new Date().toISOString().split('T')[0]),
      },
    });
    if (!hasActiveSubscription) {
      throw new BadRequestException('Member does not have an active subscription');
    }

    const existingBooking = await this.bookingRepo.findOne({
      where: {
        classId: dto.classId,
        scheduleId: dto.scheduleId,
        memberId: dto.memberId,
        bookingDate: dto.bookingDate,
        status: BookingStatus.CONFIRMED,
      },
    });
    if (existingBooking) {
      throw new BadRequestException('Member already has a confirmed booking for this class');
    }

    const confirmedCount = await this.bookingRepo.count({
      where: {
        classId: dto.classId,
        scheduleId: dto.scheduleId,
        bookingDate: dto.bookingDate,
        status: BookingStatus.CONFIRMED,
      },
    });

    const isFull = confirmedCount >= gymClass.capacity;

    const booking = this.bookingRepo.create({
      classId: dto.classId,
      scheduleId: dto.scheduleId,
      memberId: dto.memberId,
      bookingDate: dto.bookingDate,
      status: isFull ? BookingStatus.WAITLISTED : BookingStatus.CONFIRMED,
    });

    return this.bookingRepo.save(booking);
  }

  async findAll(query: QueryBookingDto) {
    const { classId, memberId, date, page = 1, limit = 20 } = query;
    const where: any = {};

    if (classId) where.classId = classId;
    if (memberId) where.memberId = memberId;
    if (date) where.bookingDate = date;

    const [data, total] = await this.bookingRepo.findAndCount({
      where,
      relations: ['gymClass', 'schedule', 'member'],
      order: { bookingDate: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['gymClass', 'schedule', 'member'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async updateStatus(id: string, dto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findById(id);

    if (dto.status === BookingStatus.CANCELLED) {
      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException('Booking is already cancelled');
      }
      booking.status = BookingStatus.CANCELLED;
      const saved = await this.bookingRepo.save(booking);
      await this.promoteNextWaitlisted(booking.classId, booking.scheduleId, booking.bookingDate);
      return this.findById(saved.id);
    }

    if (dto.status === BookingStatus.ATTENDED || dto.status === BookingStatus.NO_SHOW) {
      if (booking.status !== BookingStatus.CONFIRMED) {
        throw new BadRequestException('Only confirmed bookings can be marked as attended or no-show');
      }
      booking.status = dto.status as BookingStatus;
      return this.bookingRepo.save(booking);
    }

    throw new BadRequestException(`Invalid status transition to ${dto.status}`);
  }

  async remove(id: string): Promise<void> {
    const booking = await this.findById(id);
    const { classId, scheduleId, bookingDate } = booking;
    await this.bookingRepo.remove(booking);
    await this.promoteNextWaitlisted(classId, scheduleId, bookingDate);
  }

  private async promoteNextWaitlisted(
    classId: string,
    scheduleId: string,
    bookingDate: string,
  ): Promise<void> {
    const nextWaitlisted = await this.bookingRepo.findOne({
      where: {
        classId,
        scheduleId,
        bookingDate,
        status: BookingStatus.WAITLISTED,
      },
      order: { createdAt: 'ASC' },
    });

    if (nextWaitlisted) {
      nextWaitlisted.status = BookingStatus.CONFIRMED;
      await this.bookingRepo.save(nextWaitlisted);
    }
  }
}
