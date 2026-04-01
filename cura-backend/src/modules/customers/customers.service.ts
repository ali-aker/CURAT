import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.customerRepository.findOne({
      where: {
        phone: createCustomerDto.phone,
        tenant_id: createCustomerDto.tenant_id,
      },
    });

    if (existing) {
      throw new ConflictException('رقم الهاتف مستخدم بالفعل');
    }

    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  async findAll(tenant_id: string): Promise<Customer[]> {
    return this.customerRepository.find({
      where: { tenant_id },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, tenant_id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id, tenant_id },
    });

    if (!customer) {
      throw new NotFoundException('العميل غير موجود');
    }

    return customer;
  }

  async update(
    id: string,
    tenant_id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.findOne(id, tenant_id);
    Object.assign(customer, updateCustomerDto);
    return this.customerRepository.save(customer);
  }

  async remove(id: string, tenant_id: string): Promise<void> {
    const customer = await this.findOne(id, tenant_id);
    await this.customerRepository.softRemove(customer);
  }

  async activate(id: string, tenant_id: string): Promise<Customer> {
    const customer = await this.findOne(id, tenant_id);
    customer.is_active = true;
    return this.customerRepository.save(customer);
  }

  async deactivate(id: string, tenant_id: string): Promise<Customer> {
    const customer = await this.findOne(id, tenant_id);
    customer.is_active = false;
    return this.customerRepository.save(customer);
  }

  async getPoints(id: string, tenant_id: string): Promise<{ points: number }> {
    const customer = await this.findOne(id, tenant_id);
    return { points: customer.points };
  }

  async redeemPoints(
    id: string,
    tenant_id: string,
    points: number,
  ): Promise<Customer> {
    const customer = await this.findOne(id, tenant_id);

    if (customer.points < points) {
      throw new ConflictException('رصيد النقاط غير كافي');
    }

    customer.points -= points;
    return this.customerRepository.save(customer);
  }

  async addPoints(
    id: string,
    tenant_id: string,
    points: number,
  ): Promise<Customer> {
    const customer = await this.findOne(id, tenant_id);
    customer.points += points;
    return this.customerRepository.save(customer);
  }

  async addCredit(
    id: string,
    tenant_id: string,
    amount: number,
  ): Promise<Customer> {
    const customer = await this.findOne(id, tenant_id);
    customer.credit_balance = Number(customer.credit_balance) + amount;
    return this.customerRepository.save(customer);
  }
}
