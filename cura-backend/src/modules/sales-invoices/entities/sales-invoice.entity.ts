import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Customer } from '@modules/customers/entities/customer.entity';
import { SalesInvoiceItem } from './sales-invoice-item.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MIXED = 'mixed',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('sales_invoices')
export class SalesInvoice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'uuid' })
  branch_id!: string;

  @Column({ type: 'uuid', nullable: true })
  customer_id!: string;

  @Column({ type: 'uuid' })
  cashier_id!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  invoice_number!: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status!: InvoiceStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  payment_method!: PaymentMethod;

  @Column({ type: 'uuid', nullable: true })
  promo_code_id!: string;

  @Column({ type: 'int', default: 0 })
  points_redeemed!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_amount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  discount_value!: number;

  @Column({
    type: 'enum',
    enum: DiscountType,
    nullable: true,
  })
  discount_type!: DiscountType;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discount_amount!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tax_amount!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  net_amount!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paid_amount!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  change_amount!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'boolean', default: false })
  is_delivery!: boolean;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @OneToMany(() => SalesInvoiceItem, (item) => item.sales_invoice, {
    cascade: true,
  })
  items!: SalesInvoiceItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;
}
