import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CheckInsService } from '../../application/services/check-ins.service';
import { CreateCheckInDto } from '../../application/dtos/create-check-in.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@Controller('check-in')
@UseGuards(JwtAuthGuard)
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Post()
  async create(@Body() dto: CreateCheckInDto, @CurrentUser('id') userId: string) {
    if (dto.type === 'entry') {
      return this.checkInsService.checkIn(dto, userId);
    }
    return this.checkInsService.checkOut(dto, userId);
  }

  @Get('verify/:memberId')
  verify(@Param('memberId') memberId: string, @Query('branchId') branchId?: string) {
    return this.checkInsService.verify(memberId, branchId);
  }

  @Get('active')
  findActive(@Query('branchId') branchId?: string) {
    return this.checkInsService.findActive(branchId);
  }

  @Post(':memberId/update-branch')
  updateBranch(@Param('memberId') memberId: string, @Body('branchId') branchId: string) {
    return this.checkInsService.updateMemberBranch(memberId, branchId);
  }
}
