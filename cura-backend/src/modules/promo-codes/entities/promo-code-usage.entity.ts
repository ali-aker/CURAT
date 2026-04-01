import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PromoCode } from './promo-code.entity';

@Entity('promo_code_usages')
export class PromoCodeUsage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  promo_code_id!: string;

  @Column('uuid')
  customer_id!: string;

  @Column('uuid')
  sales_invoice_id!: string;

  @ManyToOne(() => PromoCode, (promo) => promo.usages)
  @JoinColumn({ name: 'promo_code_id' })
  promo_code!: PromoCode;

  @CreateDateColumn()
  used_at!: Date;
}
