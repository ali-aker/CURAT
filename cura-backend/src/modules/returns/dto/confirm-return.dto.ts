import { IsOptional, IsString } from 'class-validator';

export class ConfirmReturnDto {
  @IsString()
  @IsOptional()
  notes?: string;
}
