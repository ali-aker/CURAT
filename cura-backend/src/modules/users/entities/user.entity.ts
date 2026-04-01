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

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  BRANCH_MANAGER = 'branch_manager',
  CASHIER = 'cashier',
  WAREHOUSE = 'warehouse',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  tenant_id!: string;

  @Column({ type: 'uuid', nullable: true })
  branch_id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CASHIER,
  })
  role!: UserRole;

  @Column({ type: 'date', nullable: true })
  date_of_birth!: Date;

  @Column({ type: 'int', default: 0 })
  points!: number;

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