import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  points?: number;
}
