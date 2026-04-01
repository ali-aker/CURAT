import { IsOptional, IsString } from 'class-validator';

export class ConfirmTransferDto {
  @IsString()
  @IsOptional()
  notes?: string;
}
