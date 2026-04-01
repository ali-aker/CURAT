import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SubscriptionPlan {
  BASIC = 'basic',
  PRO = 'pro',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 3, default: 'EGP' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.BASIC,
  })
  subscription_plan!: SubscriptionPlan;

  @Column({ type: 'date', nullable: true })
  subscription_start!: Date;

  @Column({ type: 'date', nullable: true })
  subscription_end!: Date;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'int', default: 7 })
  sales_return_days!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  tax_rate!: number;
  
  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
