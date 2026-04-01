import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { WarehouseCategory } from '../entities/warehouse.entity';

export class CreateWarehouseDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(WarehouseCategory)
  @IsOptional()
  category?: WarehouseCategory;
}
