import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEmail,
} from 'class-validator';

export class CreateSupplierDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
