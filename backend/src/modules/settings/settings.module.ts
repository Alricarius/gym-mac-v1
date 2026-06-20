import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymConfig } from './domain/entities/gym-config.entity';
import { SettingsService } from './application/services/settings.service';
import { SettingsController } from './interfaces/controllers/settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GymConfig])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
