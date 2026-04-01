import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CancelReturnDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  cancellation_reason!: string;
}
