import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  points?: number;
}
