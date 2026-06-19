import {
  IsString, MinLength, IsOptional, IsEmail,
  IsEnum, IsDateString,
} from 'class-validator';
import { MemberGender } from '../../domain/entities/member.entity';

export class CreateMemberDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(MemberGender)
  gender?: MemberGender;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
