import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PromoCodeUsage } from './promo-code-usage.entity';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('promo_codes')
export class PromoCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  tenant_id!: string;

  @Column()
  code!: string;

  @Column({ type: 'enum', enum: DiscountType })
  discount_type!: DiscountType;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  discount_value!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  max_discount_amount!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  minimum_amount!: number;

  @Column({ type: 'int' })
  max_uses!: number;

  @Column({ type: 'int', default: 0 })
  used_count!: number;

  @Column({ type: 'date' })
  expiry_date!: Date;

  @Column({ default: true })
  is_active!: boolean;

  @OneToMany(() => PromoCodeUsage, (usage) => usage.promo_code)
  usages!: PromoCodeUsage[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
