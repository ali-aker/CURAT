import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SalesInvoice } from './sales-invoice.entity';
import { Product } from '@modules/products/entities/product.entity';
import { Batch } from '@modules/products/entities/batch.entity';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('sales_invoice_items')
export class SalesInvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  sales_invoice_id!: string;

  @Column({ type: 'uuid' })
  product_id!: string;

  @Column({ type: 'uuid' })
  batch_id!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unit_price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  discount_value!: number;

  @Column({
    type: 'enum',
    enum: DiscountType,
    nullable: true,
  })
  discount_type!: DiscountType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  discount_amount!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_price!: number;

  @ManyToOne(() => SalesInvoice, (invoice) => invoice.items)
  @JoinColumn({ name: 'sales_invoice_id' })
  sales_invoice!: SalesInvoice;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'batch_id' })
  batch!: Batch;
}
