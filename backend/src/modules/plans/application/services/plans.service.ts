import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Plan } from '../../domain/entities/plan.entity';
import { CreatePlanDto } from '../dtos/create-plan.dto';
import { UpdatePlanDto } from '../dtos/update-plan.dto';
import { QueryPlanDto } from '../dtos/query-plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly repo: Repository<Plan>,
  ) {}

  async create(dto: CreatePlanDto): Promise<Plan> {
    const plan = this.repo.create(dto);
    return this.repo.save(plan);
  }

  async findAll(query: QueryPlanDto) {
    const { search, page = 1, limit = 20 } = query;
    const where: any = {};

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const [data, total] = await this.repo.findAndCount({
      where,
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

  async findById(id: string): Promise<Plan> {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async update(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findById(id);
    Object.assign(plan, dto);
    return this.repo.save(plan);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
