import { IsString, IsNumber, IsUUID, IsPositive } from 'class-validator';

export class ValidatePromoCodeDto {
  @IsString()
  code!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsUUID()
  customer_id!: string;
}
