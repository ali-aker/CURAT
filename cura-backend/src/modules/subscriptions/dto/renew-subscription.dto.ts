import {
  IsEnum,
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  IsInt,
  Min,
} from 'class-validator';
import { SubscriptionPlan } from '@modules/tenants/entities/tenant.entity';
import { PaymentMethod } from '../entities/payment.entity';

export class RenewSubscriptionDto {
  @IsUUID()
  tenant_id!: string;

  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;

  @IsInt()
  @Min(1)
  duration_months!: number;

  @IsNumber()
  @IsPositive()
  amount_paid!: number;

  @IsEnum(PaymentMethod)
  payment_method!: PaymentMethod;

  @IsString()
  @IsOptional()
  transaction_id?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
