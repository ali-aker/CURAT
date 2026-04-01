import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
export class CreateBranchDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  delivery_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  external_shipping_enabled?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  delivery_fee?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  free_delivery_min_amount?: number;
}
