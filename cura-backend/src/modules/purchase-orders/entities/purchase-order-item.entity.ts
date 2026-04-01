import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Product } from '@modules/products/entities/product.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  purchase_order_id!: string;

  @Column({ type: 'uuid' })
  product_id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lot_number!: string;

  @Column({ type: 'date', nullable: true })
  manufacture_date!: Date;

  @Column({ type: 'date', nullable: true })
  expiry_date!: Date;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  purchase_price!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  selling_price!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_price!: number;

  @ManyToOne(() => PurchaseOrder, (order) => order.items)
  @JoinColumn({ name: 'purchase_order_id' })
  purchase_order!: PurchaseOrder;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
