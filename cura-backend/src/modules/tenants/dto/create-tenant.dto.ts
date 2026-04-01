import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { SubscriptionPlan } from '../entities/tenant.entity';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(SubscriptionPlan)
  @IsOptional()
  subscription_plan?: SubscriptionPlan;

  @IsDateString()
  @IsOptional()
  subscription_start?: string;

  @IsDateString()
  @IsOptional()
  subscription_end?: string;
}
