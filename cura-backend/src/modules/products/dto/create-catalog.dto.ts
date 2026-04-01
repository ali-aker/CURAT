import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateCatalogDto {
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

export class UpdateCatalogDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
