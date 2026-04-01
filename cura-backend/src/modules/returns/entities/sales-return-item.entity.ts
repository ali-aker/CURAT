import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SalesReturn } from './sales-return.entity';
import { Product } from '@modules/products/entities/product.entity';
import { Batch } from '@modules/products/entities/batch.entity';

@Entity('sales_return_items')
export class SalesReturnItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  sales_return_id!: string;

  @Column({ type: 'uuid' })
  product_id!: string;

  @Column({ type: 'uuid' })
  batch_id!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unit_price!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_price!: number;

  @ManyToOne(() => SalesReturn, (salesReturn) => salesReturn.items)
  @JoinColumn({ name: 'sales_return_id' })
  salesReturn!: SalesReturn;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'batch_id' })
  batch!: Batch;
}
