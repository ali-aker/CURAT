import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsInt,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseOrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  product_id!: string;

  @IsString()
  @IsOptional()
  lot_number?: string;

  @IsDateString()
  @IsOptional()
  manufacture_date?: string;

  @IsDateString()
  @IsOptional()
  expiry_date?: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  purchase_price!: number;

  @IsNumber()
  @Min(0)
  selling_price!: number;
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsUUID()
  @IsNotEmpty()
  warehouse_id!: string;

  @IsUUID()
  @IsNotEmpty()
  supplier_id!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items!: CreatePurchaseOrderItemDto[];
}
