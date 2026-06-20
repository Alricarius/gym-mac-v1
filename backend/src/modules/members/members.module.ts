import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './domain/entities/member.entity';
import { Branch } from '../branches/domain/entities/branch.entity';
import { MembersService } from './application/services/members.service';
import { MembersController } from './interfaces/controllers/members.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Branch])],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
