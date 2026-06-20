import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { PaymentsService } from '../../application/services/payments.service';
import { CreatePaymentDto } from '../../application/dtos/create-payment.dto';
import { QueryPaymentDto } from '../../application/dtos/query-payment.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto, @CurrentUser('id') userId: string) {
    return this.paymentsService.create(dto, userId);
  }

  @Get()
  findAll(@Query() query: QueryPaymentDto) {
    return this.paymentsService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Get(':id/receipt')
  getReceipt(@Param('id') id: string) {
    return this.paymentsService.getReceipt(id);
  }
}
