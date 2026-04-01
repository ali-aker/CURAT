import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Batch } from '../../products/entities/batch.entity';

export enum OfferType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  BUY_X_GET_Y = 'buy_x_get_y',
}

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  tenant_id!: string;

  @Column('uuid')
  batch_id!: string;

  @Column({ type: 'enum', enum: OfferType })
  type!: OfferType;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  discount_value!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  max_discount_amount!: number;

  @Column({ type: 'int', nullable: true })
  buy_quantity!: number;

  @Column({ type: 'int', nullable: true })
  free_quantity!: number;

  @Column({ type: 'uuid', nullable: true })
  free_batch_id!: string;

  @Column({ type: 'date' })
  expiry_date!: Date;

  @Column({ default: true })
  is_active!: boolean;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'batch_id' })
  batch!: Batch;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'free_batch_id' })
  free_batch!: Batch;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
