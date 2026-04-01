import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationType } from '../entities/transfer.entity';

export class CreateTransferItemDto {
  @IsUUID()
  @IsNotEmpty()
  product_id!: string;

  @IsUUID()
  @IsNotEmpty()
  batch_id!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateTransferDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsEnum(LocationType)
  @IsNotEmpty()
  from_type!: LocationType;

  @IsUUID()
  @IsNotEmpty()
  from_id!: string;

  @IsEnum(LocationType)
  @IsNotEmpty()
  to_type!: LocationType;

  @IsUUID()
  @IsNotEmpty()
  to_id!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransferItemDto)
  items!: CreateTransferItemDto[];
}
