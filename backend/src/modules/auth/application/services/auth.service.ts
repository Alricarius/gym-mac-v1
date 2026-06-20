import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../../../users/application/services/users.service';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { LoginDto } from '../dtos/login.dto';
import { TokenResponseDto } from '../dtos/token-response.dto';
import { UserResponseDto } from '../../../users/application/dtos/user-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new UnauthorizedException('Account is inactive');

    return this.generateTokens(user);
  }

  async refresh(refreshTokenStr: string): Promise<TokenResponseDto> {
    const tokenHash = this.hashToken(refreshTokenStr);
    const stored = await this.refreshTokenRepo.findOne({
      where: { tokenHash, isRevoked: false },
      relations: ['user'],
    });

    if (!stored) throw new UnauthorizedException('Invalid refresh token');

    if (stored.expiresAt < new Date()) {
      await this.refreshTokenRepo.remove(stored);
      throw new UnauthorizedException('Refresh token expired');
    }

    stored.isRevoked = true;
    await this.refreshTokenRepo.save(stored);

    const user = stored.user;
    if (!user.isActive) throw new UnauthorizedException('Account is inactive');

    return this.generateTokens(user);
  }

  async logout(refreshTokenStr: string): Promise<void> {
    const tokenHash = this.hashToken(refreshTokenStr);
    await this.refreshTokenRepo.update({ tokenHash }, { isRevoked: true });
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    return plainToInstance(UserResponseDto, user);
  }

  private async generateTokens(user: any): Promise<TokenResponseDto> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production',
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    });

    const refreshTokenValue = crypto.randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(refreshTokenValue);

    const expiryMs = 7 * 24 * 60 * 60 * 1000;
    await this.refreshTokenRepo.save({
      userId: user.id,
      createdById: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + expiryMs),
    });

    const userDto = plainToInstance(UserResponseDto, user);

    return { accessToken, refreshToken: refreshTokenValue, user: userDto };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
