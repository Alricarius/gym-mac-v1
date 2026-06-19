import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CheckInsService } from '../../application/services/check-ins.service';
import { CreateCheckInDto } from '../../application/dtos/create-check-in.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@Controller('check-in')
@UseGuards(JwtAuthGuard)
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Post()
  async create(@Body() dto: CreateCheckInDto) {
    if (dto.type === 'entry') {
      return this.checkInsService.checkIn(dto);
    }
    return this.checkInsService.checkOut(dto);
  }

  @Get('verify/:memberId')
  verify(@Param('memberId') memberId: string) {
    return this.checkInsService.verify(memberId);
  }

  @Get('active')
  findActive() {
    return this.checkInsService.findActive();
  }
}
