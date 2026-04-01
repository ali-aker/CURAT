import {
  IsEnum,
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
} from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsUUID()
  tenant_id!: string;

  @IsUUID()
  subscription_id!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsEnum(PaymentMethod)
  payment_method!: PaymentMethod;

  @IsString()
  @IsOptional()
  transaction_id?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
