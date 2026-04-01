import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { PaymentMethod } from '../entities/sales-invoice.entity';

export class ConfirmSalesInvoiceDto {
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  payment_method!: PaymentMethod;

  @IsNumber()
  @Min(0)
  paid_amount!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  points_redeemed?: number;
}
