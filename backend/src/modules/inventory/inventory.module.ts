import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './domain/entities/inventory-item.entity';
import { InventoryLoan } from './domain/entities/inventory-loan.entity';
import { Member } from '../members/domain/entities/member.entity';
import { InventoryItemsService } from './application/services/inventory-items.service';
import { InventoryItemsController } from './interfaces/controllers/inventory-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem, InventoryLoan, Member])],
  controllers: [InventoryItemsController],
  providers: [InventoryItemsService],
  exports: [InventoryItemsService],
})
export class InventoryModule {}
