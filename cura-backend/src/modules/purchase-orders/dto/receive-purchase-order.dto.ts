import { IsArray, IsUUID, IsNotEmpty } from 'class-validator';

export class ReceivePurchaseOrderDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  item_ids!: string[];
}
