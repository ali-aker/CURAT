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
import { SubscriptionPlan } from '@modules/tenants/entities/tenant.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
  })
  plan!: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date' })
  end_date!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount_paid!: number;

  @Column({ type: 'uuid', nullable: true })
  created_by!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
