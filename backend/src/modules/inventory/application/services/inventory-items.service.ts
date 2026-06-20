import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, IsNull } from 'typeorm';
import { InventoryItem } from '../../domain/entities/inventory-item.entity';
import { InventoryLoan } from '../../domain/entities/inventory-loan.entity';
import { CreateInventoryItemDto } from '../dtos/create-inventory-item.dto';
import { UpdateInventoryItemDto } from '../dtos/update-inventory-item.dto';
import { QueryInventoryItemDto } from '../dtos/query-inventory-item.dto';
import { CreateLoanDto } from '../dtos/create-loan.dto';
import { ReturnLoanDto } from '../dtos/return-loan.dto';
import { Member } from '../../../members/domain/entities/member.entity';

@Injectable()
export class InventoryItemsService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly itemRepo: Repository<InventoryItem>,
    @InjectRepository(InventoryLoan)
    private readonly loanRepo: Repository<InventoryLoan>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
  ) {}

  async create(dto: CreateInventoryItemDto): Promise<InventoryItem> {
    const item = this.itemRepo.create({
      ...dto,
      availableQuantity: dto.totalQuantity ?? 1,
    });
    return this.itemRepo.save(item);
  }

  async findAll(query: QueryInventoryItemDto) {
    const { branchId, search, page = 1, limit = 20 } = query;
    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (search) where.name = ILike(`%${search}%`);

    const [data, total] = await this.itemRepo.findAndCount({
      where,
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<InventoryItem> {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');
    return item;
  }

  async update(id: string, dto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const item = await this.findById(id);
    if (dto.totalQuantity !== undefined && dto.totalQuantity !== item.totalQuantity) {
      const diff = dto.totalQuantity - item.totalQuantity;
      item.availableQuantity += diff;
    }
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async remove(id: string): Promise<void> {
    await this.itemRepo.softDelete(id);
  }

  async loan(id: string, dto: CreateLoanDto): Promise<InventoryLoan> {
    const item = await this.findById(id);
    const quantity = dto.quantity ?? 1;

    if (item.availableQuantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${item.availableQuantity}, requested: ${quantity}`,
      );
    }

    const member = await this.memberRepo.findOne({ where: { id: dto.memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const loan = this.loanRepo.create({
      inventoryItemId: id,
      memberId: dto.memberId,
      quantity,
      notes: dto.notes,
    });

    item.availableQuantity -= quantity;
    await this.itemRepo.save(item);

    return this.loanRepo.save(loan);
  }

  async return(id: string, dto: ReturnLoanDto): Promise<InventoryLoan> {
    const loan = await this.loanRepo.findOne({
      where: { id: dto.loanId, inventoryItemId: id, returnedAt: IsNull() },
    });
    if (!loan) throw new NotFoundException('Active loan not found');

    loan.returnedAt = new Date();
    const saved = await this.loanRepo.save(loan);

    const item = await this.findById(id);
    item.availableQuantity += loan.quantity;
    await this.itemRepo.save(item);

    return saved;
  }

  async findLoans(id: string): Promise<InventoryLoan[]> {
    return this.loanRepo.find({
      where: { inventoryItemId: id },
      relations: ['member'],
      order: { loanedAt: 'DESC' },
    });
  }

  async findActiveLoans(id: string): Promise<InventoryLoan[]> {
    return this.loanRepo.find({
      where: { inventoryItemId: id, returnedAt: IsNull() },
      relations: ['member'],
      order: { loanedAt: 'DESC' },
    });
  }
}
