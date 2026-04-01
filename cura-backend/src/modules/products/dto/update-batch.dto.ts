import { PartialType } from '@nestjs/mapped-types';
import { CreateBatchDto } from './create-batch.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateBatchDto extends PartialType(CreateBatchDto) {
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}