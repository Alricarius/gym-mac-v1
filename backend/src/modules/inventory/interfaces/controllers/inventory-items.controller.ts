import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards,
} from '@nestjs/common';
import { InventoryItemsService } from '../../application/services/inventory-items.service';
import { CreateInventoryItemDto } from '../../application/dtos/create-inventory-item.dto';
import { UpdateInventoryItemDto } from '../../application/dtos/update-inventory-item.dto';
import { QueryInventoryItemDto } from '../../application/dtos/query-inventory-item.dto';
import { CreateLoanDto } from '../../application/dtos/create-loan.dto';
import { ReturnLoanDto } from '../../application/dtos/return-loan.dto';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryItemsController {
  constructor(private readonly inventoryService: InventoryItemsService) {}

  @Post()
  create(@Body() dto: CreateInventoryItemDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.create(dto, userId);
  }

  @Get()
  findAll(@Query() query: QueryInventoryItemDto) {
    return this.inventoryService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.inventoryService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }

  @Post(':id/loan')
  loan(@Param('id') id: string, @Body() dto: CreateLoanDto, @CurrentUser('id') userId: string) {
    return this.inventoryService.loan(id, dto, userId);
  }

  @Post(':id/return')
  return(@Param('id') id: string, @Body() dto: ReturnLoanDto) {
    return this.inventoryService.return(id, dto);
  }

  @Get(':id/loans')
  findLoans(@Param('id') id: string) {
    return this.inventoryService.findLoans(id);
  }

  @Get(':id/active-loans')
  findActiveLoans(@Param('id') id: string) {
    return this.inventoryService.findActiveLoans(id);
  }
}
