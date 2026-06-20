import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MembersService } from '../../application/services/members.service';
import { CreateMemberDto } from '../../application/dtos/create-member.dto';
import { UpdateMemberDto } from '../../application/dtos/update-member.dto';
import { QueryMemberDto } from '../../application/dtos/query-member.dto';
import { UpdateBranchDto } from '../../application/dtos/update-branch.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '../../../users/domain/entities/user.entity';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  create(@Body() dto: CreateMemberDto, @CurrentUser('id') userId: string) {
    return this.membersService.create(dto, userId);
  }

  @Get()
  findAll(@Query() query: QueryMemberDto) {
    return this.membersService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.membersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.membersService.update(id, dto);
  }

  @Patch(':id/branch')
  updateBranch(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.membersService.updateBranch(id, dto.branchId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }
}
