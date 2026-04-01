import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Customer } from '@modules/customers/entities/customer.entity';
import { SalesInvoice } from '@modules/sales-invoices/entities/sales-invoice.entity';
import { DeliveryDriver } from './delivery-driver.entity';

export enum DeliveryStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PICKED_UP = 'picked_up',
  ON_THE_WAY = 'on_the_way',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum DeliveryType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

@Entity('delivery_orders')
export class DeliveryOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'uuid' })
  branch_id!: string;

  @Column({ type: 'uuid' })
  sales_invoice_id!: string;

  @Column({ type: 'uuid', nullable: true })
  customer_id!: string;

  @Column({ type: 'uuid', nullable: true })
  driver_id!: string;

  @Column({ type: 'varchar', unique: true })
  delivery_number!: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  status!: DeliveryStatus;

  @Column({ type: 'enum', enum: DeliveryType, default: DeliveryType.INTERNAL })
  delivery_type!: DeliveryType;

  @Column({ type: 'varchar' })
  customer_name!: string;

  @Column({ type: 'varchar' })
  customer_phone!: string;

  @Column({ type: 'text' })
  delivery_address!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  delivery_fee!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'text', nullable: true })
  cancellation_reason!: string;

  @Column({ type: 'uuid', nullable: true })
  cancelled_by!: string;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at!: Date;

  @Column({ type: 'uuid' })
  created_by!: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @ManyToOne(() => SalesInvoice)
  @JoinColumn({ name: 'sales_invoice_id' })
  invoice!: SalesInvoice;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @ManyToOne(() => DeliveryDriver, { nullable: true })
  @JoinColumn({ name: 'driver_id' })
  driver!: DeliveryDriver;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
