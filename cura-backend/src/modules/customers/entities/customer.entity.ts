import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '@modules/tenants/entities/tenant.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @Column({ type: 'int', default: 0 })
  points!: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  credit_balance!: number;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;
}
