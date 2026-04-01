import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateBrandDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdateBrandDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
