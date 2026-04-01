import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Transfer } from './transfer.entity';
import { Product } from '@modules/products/entities/product.entity';
import { Batch } from '@modules/products/entities/batch.entity';

@Entity('transfer_items')
export class TransferItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  transfer_id!: string;

  @Column({ type: 'uuid' })
  product_id!: string;

  @Column({ type: 'uuid' })
  batch_id!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @ManyToOne(() => Transfer, (transfer) => transfer.items)
  @JoinColumn({ name: 'transfer_id' })
  transfer!: Transfer;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'batch_id' })
  batch!: Batch;
}
