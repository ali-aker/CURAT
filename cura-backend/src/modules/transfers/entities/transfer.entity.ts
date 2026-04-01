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
import { TransferItem } from './transfer-item.entity';

export enum TransferStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export enum LocationType {
  BRANCH = 'branch',
  WAREHOUSE = 'warehouse',
}

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'varchar', unique: true })
  transfer_number!: string;

  @Column({ type: 'enum', enum: LocationType })
  from_type!: LocationType;

  @Column({ type: 'uuid' })
  from_id!: string;

  @Column({ type: 'enum', enum: LocationType })
  to_type!: LocationType;

  @Column({ type: 'uuid' })
  to_id!: string;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PENDING,
  })
  status!: TransferStatus;

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

  @OneToMany(() => TransferItem, (item) => item.transfer, {
    cascade: true,
    eager: false,
  })
  items!: TransferItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
