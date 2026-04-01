import {
  IsEnum,
  IsUUID,
  IsNumber,
  IsInt,
  IsOptional,
  IsDateString,
  IsPositive,
  ValidateIf,
} from 'class-validator';
import { OfferType } from '../entities/offer.entity';

export class CreateOfferDto {
  @IsOptional()
  @IsUUID()
  tenant_id!: string;

  @IsUUID()
  batch_id!: string;

  @IsEnum(OfferType)
  type!: OfferType;

  @ValidateIf(
    (o) => o.type === OfferType.PERCENTAGE || o.type === OfferType.FIXED,
  )
  @IsNumber()
  @IsPositive()
  discount_value!: number;

  @ValidateIf((o) => o.type === OfferType.PERCENTAGE)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  max_discount_amount!: number;

  @ValidateIf((o) => o.type === OfferType.BUY_X_GET_Y)
  @IsInt()
  @IsPositive()
  buy_quantity!: number;

  @ValidateIf((o) => o.type === OfferType.BUY_X_GET_Y)
  @IsInt()
  @IsPositive()
  free_quantity!: number;

  @ValidateIf((o) => o.type === OfferType.BUY_X_GET_Y)
  @IsOptional()
  @IsUUID()
  free_batch_id!: string;

  @IsDateString()
  expiry_date!: string;
}
