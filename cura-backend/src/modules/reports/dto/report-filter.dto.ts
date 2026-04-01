import { IsOptional, IsDateString, IsUUID, IsEnum } from 'class-validator';

export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export class ReportFilterDto {
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @IsOptional()
  @IsDateString()
  date_from?: string;

  @IsOptional()
  @IsDateString()
  date_to?: string;

  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @IsOptional()
  @IsUUID()
  warehouse_id?: string;

  @IsOptional()
  @IsUUID()
  tenant_id?: string;
}
