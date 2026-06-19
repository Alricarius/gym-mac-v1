import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { ReportsService } from '../../application/services/reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.reportsService.getDashboard();
  }

  @Get('income')
  getIncome(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportsService.getIncome(from, to);
  }

  @Get('members')
  getMembers() {
    return this.reportsService.getMembers();
  }
}
