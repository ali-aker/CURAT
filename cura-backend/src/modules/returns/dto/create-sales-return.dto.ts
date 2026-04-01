import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RefundMethod } from '../entities/sales-return.entity';

export class CreateSalesReturnItemDto {
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

export class CreateSalesReturnDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsUUID()
  @IsNotEmpty()
  branch_id!: string;

  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @IsUUID()
  @IsNotEmpty()
  sales_invoice_id!: string;

  @IsEnum(RefundMethod)
  @IsNotEmpty()
  refund_method!: RefundMethod;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cash_amount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  credit_amount?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesReturnItemDto)
  items!: CreateSalesReturnItemDto[];
}
