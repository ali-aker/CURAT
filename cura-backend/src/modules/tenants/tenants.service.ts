import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.tenantRepository.findOne({
      where: { name: createTenantDto.name },
    });

    if (existing) {
      throw new ConflictException('اسم الصيدلية مستخدم بالفعل');
    }

    const tenant = this.tenantRepository.create(createTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('الصيدلية غير موجودة');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);
    Object.assign(tenant, updateTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.remove(tenant);
  }

  async activate(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.is_active = true;
    return this.tenantRepository.save(tenant);
  }

  async deactivate(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.is_active = false;
    return this.tenantRepository.save(tenant);
  }
}
