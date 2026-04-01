import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsUUID()
  @IsOptional()
  tenant_id?: string;

  @IsUUID()
  @IsOptional()
  branch_id?: string;

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
