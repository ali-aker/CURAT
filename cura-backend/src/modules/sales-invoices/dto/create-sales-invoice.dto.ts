import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsInt,
  IsNumber,
  IsBoolean,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType, PaymentMethod } from '../entities/sales-invoice.entity';

export class CreateSalesInvoiceItemDto {
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

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount_value?: number;

  @IsEnum(DiscountType)
  @IsOptional()
  discount_type?: DiscountType;
}

export class CreateSalesInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsUUID()
  @IsNotEmpty()
  branch_id!: string;

  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  payment_method?: PaymentMethod;

  @IsString()
  @IsOptional()
  promo_code?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  points_redeemed?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount_value?: number;

  @IsEnum(DiscountType)
  @IsOptional()
  discount_type?: DiscountType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  paid_amount?: number;

  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  is_delivery?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesInvoiceItemDto)
  items!: CreateSalesInvoiceItemDto[];
}
