import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { DeliveryType } from '../entities/delivery-order.entity';

export class CreateDeliveryOrderDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsUUID()
  @IsNotEmpty()
  branch_id!: string;

  @IsUUID()
  @IsNotEmpty()
  sales_invoice_id!: string;

  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @IsEnum(DeliveryType)
  @IsNotEmpty()
  delivery_type!: DeliveryType;

  @IsString()
  @IsNotEmpty()
  customer_name!: string;

  @IsString()
  @IsNotEmpty()
  customer_phone!: string;

  @IsString()
  @IsNotEmpty()
  delivery_address!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
