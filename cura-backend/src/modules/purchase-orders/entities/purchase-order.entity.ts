import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Warehouse } from '@modules/warehouses/entities/warehouse.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export enum PurchaseOrderStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled',
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'uuid' })
  warehouse_id!: string;

  @Column({ type: 'uuid' })
  supplier_id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  order_number!: string;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.PENDING,
  })
  status!: PurchaseOrderStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_amount!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tax_amount!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'uuid' })
  created_by!: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse!: Warehouse;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id' })
  supplier!: Supplier;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchase_order, {
    cascade: true,
  })
  items!: PurchaseOrderItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;
}
