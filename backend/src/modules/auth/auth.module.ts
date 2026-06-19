import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './interfaces/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { RefreshToken } from './domain/entities/refresh-token.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production',
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' },
    }),
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
