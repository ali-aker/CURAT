import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('batches')
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  product_id!: string;

  @Column({ type: 'uuid', nullable: true })
  branch_id!: string;

  @Column({ type: 'uuid', nullable: true })
  warehouse_id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lot_number!: string;

  @Column({ type: 'date', nullable: true })
  manufacture_date!: Date;

  @Column({ type: 'date', nullable: true })
  expiry_date!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchase_price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  selling_price!: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ManyToOne(() => Product, (product) => product.batches)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
