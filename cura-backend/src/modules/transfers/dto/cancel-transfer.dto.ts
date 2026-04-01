import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CancelTransferDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  cancellation_reason!: string;
}
