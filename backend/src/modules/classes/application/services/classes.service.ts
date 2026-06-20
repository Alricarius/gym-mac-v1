import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GymClass } from '../../domain/entities/gym-class.entity';
import { Schedule } from '../../domain/entities/schedule.entity';
import { CreateClassDto } from '../dtos/create-class.dto';
import { UpdateClassDto } from '../dtos/update-class.dto';
import { QueryClassDto } from '../dtos/query-class.dto';
import { CreateScheduleDto } from '../dtos/create-schedule.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(GymClass)
    private readonly classRepo: Repository<GymClass>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
  ) {}

  async create(dto: CreateClassDto): Promise<GymClass> {
    const gymClass = this.classRepo.create(dto);
    return this.classRepo.save(gymClass);
  }

  async findAll(query: QueryClassDto) {
    const { name, isActive, page = 1, limit = 20 } = query;
    const countQb = this.classRepo.createQueryBuilder('c')
      .where('c.deletedAt IS NULL');

    if (name) {
      countQb.andWhere('c.name ILIKE :name', { name: `%${name}%` });
    }
    if (isActive !== undefined) {
      countQb.andWhere('c.isActive = :isActive', { isActive: isActive === 'true' });
    }

    const total = await countQb.getCount();

    const dataQb = this.classRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.schedules', 's')
      .where('c.deletedAt IS NULL');

    if (name) {
      dataQb.andWhere('c.name ILIKE :name', { name: `%${name}%` });
    }
    if (isActive !== undefined) {
      dataQb.andWhere('c.isActive = :isActive', { isActive: isActive === 'true' });
    }

    const data = await dataQb
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<GymClass> {
    const gymClass = await this.classRepo.findOne({
      where: { id },
      relations: ['schedules'],
      withDeleted: false,
    });
    if (!gymClass) throw new NotFoundException('Class not found');
    return gymClass;
  }

  async update(id: string, dto: UpdateClassDto): Promise<GymClass> {
    const gymClass = await this.findById(id);
    Object.assign(gymClass, dto);
    return this.classRepo.save(gymClass);
  }

  async softDelete(id: string): Promise<void> {
    const gymClass = await this.findById(id);
    await this.classRepo.softRemove(gymClass);
  }

  async addSchedule(classId: string, dto: CreateScheduleDto): Promise<Schedule> {
    const gymClass = await this.findById(classId);
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }
    const schedule = this.scheduleRepo.create({
      ...dto,
      classId: gymClass.id,
    });
    return this.scheduleRepo.save(schedule);
  }

  async removeSchedule(classId: string, scheduleId: string): Promise<void> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId, classId },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    await this.scheduleRepo.remove(schedule);
  }
}
