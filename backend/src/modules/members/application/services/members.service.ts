import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Member } from '../../domain/entities/member.entity';
import { CreateMemberDto } from '../dtos/create-member.dto';
import { UpdateMemberDto } from '../dtos/update-member.dto';
import { QueryMemberDto } from '../dtos/query-member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly repo: Repository<Member>,
  ) {}

  async create(dto: CreateMemberDto): Promise<Member> {
    if (dto.email) {
      const exists = await this.repo.findOne({ where: { email: dto.email } });
      if (exists) throw new ConflictException('Email already registered');
    }
    const member = this.repo.create(dto);
    return this.repo.save(member);
  }

  async findAll(query: QueryMemberDto) {
    const { search, page = 1, limit = 20 } = query;
    const where: any = {};

    if (search) {
      where.fullName = ILike(`%${search}%`);
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

  async findById(id: string): Promise<Member> {
    const member = await this.repo.findOne({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async update(id: string, dto: UpdateMemberDto): Promise<Member> {
    const member = await this.findById(id);
    if (dto.email && dto.email !== member.email) {
      const exists = await this.repo.findOne({ where: { email: dto.email } });
      if (exists) throw new ConflictException('Email already registered');
    }
    Object.assign(member, dto);
    return this.repo.save(member);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
