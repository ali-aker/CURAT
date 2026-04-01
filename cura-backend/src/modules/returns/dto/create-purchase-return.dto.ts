import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseReturnItemDto {
  @IsUUID()
  @IsNotEmpty()
  product_id!: string;

  @IsUUID()
  @IsNotEmpty()
  batch_id!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unit_price!: number;
}

export class CreatePurchaseReturnDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsUUID()
  @IsNotEmpty()
  warehouse_id!: string;

  @IsUUID()
  @IsNotEmpty()
  supplier_id!: string;

  @IsUUID()
  @IsNotEmpty()
  purchase_order_id!: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  refund_amount?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseReturnItemDto)
  items!: CreatePurchaseReturnItemDto[];
}
