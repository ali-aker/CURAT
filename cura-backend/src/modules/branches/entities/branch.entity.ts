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

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @Column({ type: 'boolean', default: false })
  delivery_enabled!: boolean;

  @Column({ type: 'boolean', default: false })
  external_shipping_enabled!: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  delivery_fee!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  free_delivery_min_amount!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
