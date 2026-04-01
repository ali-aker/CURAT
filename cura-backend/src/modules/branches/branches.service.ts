import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    const existing = await this.branchRepository.findOne({
      where: {
        name: createBranchDto.name,
        tenant_id: createBranchDto.tenant_id,
      },
    });

    if (existing) {
      throw new ConflictException('اسم الفرع مستخدم بالفعل');
    }

    const branch = this.branchRepository.create(createBranchDto);
    return this.branchRepository.save(branch);
  }

  async findAll(tenant_id: string): Promise<Branch[]> {
    return this.branchRepository.find({
      where: { tenant_id },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, tenant_id: string): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: { id, tenant_id },
    });

    if (!branch) {
      throw new NotFoundException('الفرع غير موجود');
    }

    return branch;
  }

  async update(
    id: string,
    tenant_id: string,
    updateBranchDto: UpdateBranchDto,
  ): Promise<Branch> {
    const branch = await this.findOne(id, tenant_id);
    Object.assign(branch, updateBranchDto);
    return this.branchRepository.save(branch);
  }

  async remove(id: string, tenant_id: string): Promise<void> {
    const branch = await this.findOne(id, tenant_id);
    await this.branchRepository.remove(branch);
  }

  async activate(id: string, tenant_id: string): Promise<Branch> {
    const branch = await this.findOne(id, tenant_id);
    branch.is_active = true;
    return this.branchRepository.save(branch);
  }

  async deactivate(id: string, tenant_id: string): Promise<Branch> {
    const branch = await this.findOne(id, tenant_id);
    branch.is_active = false;
    return this.branchRepository.save(branch);
  }
}
