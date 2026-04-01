import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Customer } from '@modules/customers/entities/customer.entity';
import { SalesInvoice } from '@modules/sales-invoices/entities/sales-invoice.entity';
import { SalesReturnItem } from './sales-return-item.entity';

export enum ReturnStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum RefundMethod {
  CASH = 'cash',
  CREDIT = 'credit',
  BOTH = 'both',
}

@Entity('sales_returns')
export class SalesReturn {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'uuid' })
  branch_id!: string;

  @Column({ type: 'uuid', nullable: true })
  customer_id!: string;

  @Column({ type: 'uuid' })
  sales_invoice_id!: string;

  @Column({ type: 'varchar', unique: true })
  return_number!: string;

  @Column({ type: 'enum', enum: ReturnStatus, default: ReturnStatus.PENDING })
  status!: ReturnStatus;

  @Column({ type: 'enum', enum: RefundMethod, nullable: true })
  refund_method!: RefundMethod;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_amount!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  cash_amount!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  credit_amount!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'text', nullable: true })
  cancellation_reason!: string;

  @Column({ type: 'uuid', nullable: true })
  cancelled_by!: string;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at!: Date;

  @Column({ type: 'uuid' })
  created_by!: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @ManyToOne(() => SalesInvoice)
  @JoinColumn({ name: 'sales_invoice_id' })
  invoice!: SalesInvoice;

  @OneToMany(() => SalesReturnItem, (item) => item.salesReturn, {
    cascade: true,
    eager: false,
  })
  items!: SalesReturnItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
