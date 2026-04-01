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
import { Catalog } from './catalog.entity';
import { Section } from './section.entity';
import { Brand } from './brand.entity';
import { Batch } from './batch.entity';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  tenant_id!: string;

  @Column({ type: 'uuid', nullable: true })
  catalog_id!: string;

  @Column({ type: 'uuid', nullable: true })
  section_id!: string;

  @Column({ type: 'uuid', nullable: true })
  brand_id!: string;

  @Column({ type: 'varchar', length: 255 })
  name_ar!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name_en!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  scientific_name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  barcode!: string;

  @Column({ type: 'varchar', length: 50 })
  unit!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sub_unit!: string;

  @Column({ type: 'int', nullable: true })
  sub_unit_qty!: number;

  @Column({ type: 'int', default: 0 })
  min_stock_alert!: number;

  @Column({ type: 'boolean', default: false })
  is_taxable!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  discount_value!: number;

  @Column({
    type: 'enum',
    enum: DiscountType,
    nullable: true,
  })
  discount_type!: DiscountType;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => Catalog)
  @JoinColumn({ name: 'catalog_id' })
  catalog!: Catalog;

  @ManyToOne(() => Section)
  @JoinColumn({ name: 'section_id' })
  section!: Section;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand!: Brand;

  @OneToMany(() => Batch, (batch) => batch.product)
  batches!: Batch[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;
}
