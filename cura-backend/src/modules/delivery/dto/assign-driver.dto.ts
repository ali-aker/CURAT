import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignDriverDto {
  @IsUUID()
  @IsNotEmpty()
  driver_id!: string;
}
