import {
  IsEnum,
  IsUUID,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
} from 'class-validator';
import { SubscriptionPlan } from '@modules/tenants/entities/tenant.entity';

export class CreateSubscriptionDto {
  @IsUUID()
  tenant_id!: string;

  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;

  @IsDateString()
  start_date!: string;

  @IsDateString()
  end_date!: string;

  @IsNumber()
  @IsPositive()
  amount_paid!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
