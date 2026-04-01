import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { PurchaseOrder } from '@modules/purchase-orders/entities/purchase-order.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
  ) {}

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const existing = await this.supplierRepository.findOne({
      where: { name: dto.name, tenant_id: dto.tenant_id },
    });
    if (existing) throw new ConflictException('المورد موجود بالفعل');
    const supplier = this.supplierRepository.create(dto);
    return this.supplierRepository.save(supplier);
  }

  async findAll(tenant_id: string): Promise<any[]> {
    const suppliers = await this.supplierRepository.find({
      where: { tenant_id },
      order: { created_at: 'DESC' },
    });

    return Promise.all(
      suppliers.map(async (supplier) => ({
        ...supplier,
        invoices_count: await this.purchaseOrderRepository.count({
          where: { supplier_id: supplier.id, tenant_id },
        }),
      })),
    );
  }

  async findOne(id: string, tenant_id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id, tenant_id },
    });
    if (!supplier) throw new NotFoundException('المورد غير موجود');
    return supplier;
  }

  async update(
    id: string,
    tenant_id: string,
    dto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const supplier = await this.findOne(id, tenant_id);
    Object.assign(supplier, dto);
    return this.supplierRepository.save(supplier);
  }

  async remove(id: string, tenant_id: string): Promise<void> {
    const supplier = await this.findOne(id, tenant_id);

    const invoicesCount = await this.purchaseOrderRepository.count({
      where: { supplier_id: id, tenant_id },
    });

    if (invoicesCount > 0)
      throw new ConflictException(
        `لا يمكن حذف المورد، يوجد ${invoicesCount} فاتورة مشتريات مرتبطة به`,
      );

    await this.supplierRepository.softRemove(supplier);
  }

  async activate(id: string, tenant_id: string): Promise<Supplier> {
    const supplier = await this.findOne(id, tenant_id);
    supplier.is_active = true;
    return this.supplierRepository.save(supplier);
  }

  async deactivate(id: string, tenant_id: string): Promise<Supplier> {
    const supplier = await this.findOne(id, tenant_id);
    supplier.is_active = false;
    return this.supplierRepository.save(supplier);
  }
}
