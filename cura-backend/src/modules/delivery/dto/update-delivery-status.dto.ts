import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DeliveryStatus } from '../entities/delivery-order.entity';

export class UpdateDeliveryStatusDto {
  @IsEnum(DeliveryStatus)
  @IsNotEmpty()
  status!: DeliveryStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
