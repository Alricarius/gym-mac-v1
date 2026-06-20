import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GymConfig } from '../../domain/entities/gym-config.entity';
import { UpdateGymConfigDto } from '../dtos/update-gym-config.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(GymConfig)
    private readonly repo: Repository<GymConfig>,
  ) {}

  async getOrCreate(): Promise<GymConfig> {
    const all = await this.repo.find({ take: 1 });
    let config = all[0] ?? null;
    if (!config) {
      config = new GymConfig();
      config.gymName = 'Mi Gimnasio';
      config.graceDays = 0;
      config.taxRate = 0;
      config.timezone = 'America/La_Paz';
      config = await this.repo.save(config);
    }
    return config;
  }

  async update(dto: UpdateGymConfigDto): Promise<GymConfig> {
    const config = await this.getOrCreate();
    Object.assign(config, dto);
    return this.repo.save(config);
  }
}
