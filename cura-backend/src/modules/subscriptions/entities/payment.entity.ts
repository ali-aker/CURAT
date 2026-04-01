import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Subscription } from './subscription.entity';

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  PAYMOB = 'paymob',
  FAWRY = 'fawry',
  STRIPE = 'stripe',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('subscription_payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'uuid' })
  subscription_id!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  payment_method!: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.COMPLETED,
  })
  status!: PaymentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transaction_id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  gateway_response!: string;

  @Column({ type: 'uuid', nullable: true })
  created_by!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription!: Subscription;

  @CreateDateColumn()
  created_at!: Date;
}