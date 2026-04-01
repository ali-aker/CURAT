import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  MinLength,
} from 'class-validator';
import { UserRole } from '@modules/users/entities/user.entity';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsDateString()
  @IsOptional()
  date_of_birth?: string;
}