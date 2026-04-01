import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCustomerDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
