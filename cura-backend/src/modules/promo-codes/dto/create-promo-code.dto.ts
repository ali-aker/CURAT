import {
  IsEnum,
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsDateString,
  IsPositive,
  IsUUID,
  Min,
  ValidateIf,
  MinLength,
  MaxLength,
} from 'class-validator';
import { DiscountType } from '../entities/promo-code.entity';

export class CreatePromoCodeDto {
  @IsOptional()
  @IsUUID()
  tenant_id!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  code!: string;

  @IsEnum(DiscountType)
  discount_type!: DiscountType;

  @IsNumber()
  @IsPositive()
  discount_value!: number;

  @ValidateIf((o) => o.discount_type === DiscountType.PERCENTAGE)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  max_discount_amount!: number;

  @IsNumber()
  @Min(0)
  minimum_amount!: number;

  @IsInt()
  @IsPositive()
  max_uses!: number;

  @IsDateString()
  expiry_date!: string;
}
