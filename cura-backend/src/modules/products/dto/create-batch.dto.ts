import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateBatchDto {
  @IsUUID()
  @IsNotEmpty()
  product_id!: string;

  @IsUUID()
  @IsNotEmpty()
  branch_id!: string;

  @IsString()
  @IsOptional()
  lot_number?: string;

  @IsDateString()
  @IsOptional()
  manufacture_date?: string;

  @IsDateString()
  @IsOptional()
  expiry_date?: string;

  @IsNumber()
  @Min(0)
  purchase_price!: number;

  @IsNumber()
  @Min(0)
  selling_price!: number;
}