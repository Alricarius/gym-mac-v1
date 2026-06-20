import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './domain/entities/branch.entity';
import { BranchesService } from './application/services/branches.service';
import { BranchesController } from './interfaces/controllers/branches.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Branch])],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
