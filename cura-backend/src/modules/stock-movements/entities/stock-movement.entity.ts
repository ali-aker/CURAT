import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Warehouse } from '@modules/warehouses/entities/warehouse.entity';
import { Product } from '@modules/products/entities/product.entity';
import { Batch } from '@modules/products/entities/batch.entity';

export enum MovementType {
  IN = 'in',
  OUT = 'out',
  RESERVED = 'reserved',
}

export enum ReferenceType {
  PURCHASE_ORDER = 'purchase_order',
  SALES_INVOICE = 'sales_invoice',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  RETURN_PURCHASE = 'return_purchase',
  RETURN_SALES = 'return_sales',
  ADJUSTMENT = 'adjustment',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'uuid', nullable: true })
  branch_id!: string;

  @Column({ type: 'uuid', nullable: true })
  warehouse_id!: string;

  @Column({ type: 'uuid' })
  product_id!: string;

  @Column({ type: 'uuid' })
  batch_id!: string;

  @Column({ type: 'enum', enum: MovementType })
  type!: MovementType;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'enum', enum: ReferenceType })
  reference_type!: ReferenceType;

  @Column({ type: 'uuid' })
  reference_id!: string;

  @Column({ type: 'uuid' })
  created_by!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch!: Branch;

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse!: Warehouse;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'batch_id' })
  batch!: Batch;

  @CreateDateColumn()
  created_at!: Date;
}
