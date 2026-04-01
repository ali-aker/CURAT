import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { DiscountType } from '../entities/product.entity';

export class CreateProductDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsUUID()
  @IsOptional()
  catalog_id?: string;

  @IsUUID()
  @IsOptional()
  section_id?: string;

  @IsUUID()
  @IsOptional()
  brand_id?: string;

  @IsString()
  @IsNotEmpty()
  name_ar!: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @IsString()
  @IsOptional()
  scientific_name?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsNotEmpty()
  unit!: string;

  @IsString()
  @IsOptional()
  sub_unit?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  sub_unit_qty?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  min_stock_alert?: number;

  @IsBoolean()
  @IsOptional()
  is_taxable?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount_value?: number;

  @IsEnum(DiscountType)
  @IsOptional()
  discount_type?: DiscountType;
}
