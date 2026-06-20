import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Branch } from '../../domain/entities/branch.entity';
import { CreateBranchDto } from '../dtos/create-branch.dto';
import { UpdateBranchDto } from '../dtos/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly repo: Repository<Branch>,
  ) {}

  async create(dto: CreateBranchDto, createdById: string): Promise<Branch> {
    if (dto.email) {
      const exists = await this.repo.findOne({ where: { email: dto.email } });
      if (exists) throw new ConflictException('Email already registered');
    }
    const branch = this.repo.create({ ...dto, createdById });
    return this.repo.save(branch);
  }

  async findAll(search?: string): Promise<Branch[]> {
    const where: any = {};
    if (search) {
      where.name = ILike(`%${search}%`);
    }
    return this.repo.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Branch> {
    const branch = await this.repo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(id: string, dto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findById(id);
    if (dto.email && dto.email !== branch.email) {
      const exists = await this.repo.findOne({ where: { email: dto.email } });
      if (exists) throw new ConflictException('Email already registered');
    }
    Object.assign(branch, dto);
    return this.repo.save(branch);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
