import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Warehouse } from '@modules/warehouses/entities/warehouse.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { PurchaseOrder } from '@modules/purchase-orders/entities/purchase-order.entity';
import { ReturnStatus } from './sales-return.entity';
import { PurchaseReturnItem } from './purchase-return-item.entity';

@Entity('purchase_returns')
export class PurchaseReturn {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'uuid' })
  warehouse_id!: string;

  @Column({ type: 'uuid' })
  supplier_id!: string;

  @Column({ type: 'uuid' })
  purchase_order_id!: string;

  @Column({ type: 'varchar', unique: true })
  return_number!: string;

  @Column({ type: 'enum', enum: ReturnStatus, default: ReturnStatus.PENDING })
  status!: ReturnStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_amount!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  refund_amount!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'text', nullable: true })
  cancellation_reason!: string;

  @Column({ type: 'uuid', nullable: true })
  cancelled_by!: string;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at!: Date;

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

  @ManyToOne(() => PurchaseOrder)
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder!: PurchaseOrder;

  @OneToMany(() => PurchaseReturnItem, (item) => item.purchaseReturn, {
    cascade: true,
    eager: false,
  })
  items!: PurchaseReturnItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
