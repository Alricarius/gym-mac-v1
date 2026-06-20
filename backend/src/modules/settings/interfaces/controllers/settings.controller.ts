import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from '../../application/services/settings.service';
import { UpdateGymConfigDto } from '../../application/dtos/update-gym-config.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '../../../users/domain/entities/user.entity';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  get() {
    return this.settingsService.getOrCreate();
  }

  @Put()
  @Roles(UserRole.ADMIN)
  update(@Body() dto: UpdateGymConfigDto) {
    return this.settingsService.update(dto);
  }
}
