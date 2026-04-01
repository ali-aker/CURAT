import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MovementType, ReferenceType } from '../entities/stock-movement.entity';

export class CreateStockMovementDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsUUID()
  @IsOptional()
  branch_id?: string;

  @IsUUID()
  @IsOptional()
  warehouse_id?: string;

  @IsUUID()
  @IsNotEmpty()
  product_id!: string;

  @IsUUID()
  @IsNotEmpty()
  batch_id!: string;

  @IsEnum(MovementType)
  @IsNotEmpty()
  type!: MovementType;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsEnum(ReferenceType)
  @IsNotEmpty()
  reference_type!: ReferenceType;

  @IsUUID()
  @IsNotEmpty()
  reference_id!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
