import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    const existing = await this.warehouseRepository.findOne({
      where: {
        name: createWarehouseDto.name,
        tenant_id: createWarehouseDto.tenant_id,
      },
    });

    if (existing) {
      throw new ConflictException('اسم المستودع مستخدم بالفعل');
    }

    const warehouse = this.warehouseRepository.create(createWarehouseDto);
    return this.warehouseRepository.save(warehouse);
  }

  async findAll(tenant_id: string): Promise<Warehouse[]> {
    return this.warehouseRepository.find({
      where: { tenant_id },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, tenant_id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id, tenant_id },
    });

    if (!warehouse) {
      throw new NotFoundException('المستودع غير موجود');
    }

    return warehouse;
  }

  async update(
    id: string,
    tenant_id: string,
    updateWarehouseDto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    const warehouse = await this.findOne(id, tenant_id);
    Object.assign(warehouse, updateWarehouseDto);
    return this.warehouseRepository.save(warehouse);
  }

  async remove(id: string, tenant_id: string): Promise<void> {
    const warehouse = await this.findOne(id, tenant_id);
    await this.warehouseRepository.remove(warehouse);
  }

  async activate(id: string, tenant_id: string): Promise<Warehouse> {
    const warehouse = await this.findOne(id, tenant_id);
    warehouse.is_active = true;
    return this.warehouseRepository.save(warehouse);
  }

  async deactivate(id: string, tenant_id: string): Promise<Warehouse> {
    const warehouse = await this.findOne(id, tenant_id);
    warehouse.is_active = false;
    return this.warehouseRepository.save(warehouse);
  }
}
