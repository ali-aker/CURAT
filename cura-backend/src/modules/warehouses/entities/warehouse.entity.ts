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

export enum WarehouseCategory {
  MEDICINES = 'medicines',
  COSMETICS = 'cosmetics',
  GENERAL = 'general',
}

@Entity('warehouses')
export class Warehouse {
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

  @Column({
    type: 'enum',
    enum: WarehouseCategory,
    default: WarehouseCategory.GENERAL,
  })
  category!: WarehouseCategory;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
