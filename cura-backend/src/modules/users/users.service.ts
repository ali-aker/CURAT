import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    const { password, ...result } = user;
    return result;
  }

  async findAll(tenant_id: string): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find({
      where: { tenant_id },
      order: { created_at: 'DESC' },
    });

    return users.map(({ password, ...user }) => user);
  }

  async findOne(
    id: string,
    tenant_id: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id, tenant_id },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const { password, ...result } = user;
    return result;
  }

  async update(
    id: string,
    tenant_id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id, tenant_id },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    const { password, ...result } = user;
    return result;
  }

  async remove(id: string, tenant_id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id, tenant_id },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    await this.userRepository.remove(user);
  }

  async activate(
    id: string,
    tenant_id: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id, tenant_id },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    user.is_active = true;
    await this.userRepository.save(user);

    const { password, ...result } = user;
    return result;
  }

  async deactivate(
    id: string,
    tenant_id: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id, tenant_id },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    user.is_active = false;
    await this.userRepository.save(user);

    const { password, ...result } = user;
    return result;
  }

  async getPoints(id: string, tenant_id: string): Promise<{ points: number }> {
    const user = await this.userRepository.findOne({
      where: { id, tenant_id },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return { points: user.points };
  }
  async assignBranch(
    id: string,
    tenant_id: string,
    branch_id: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id, tenant_id },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    user.branch_id = branch_id;
    await this.userRepository.save(user);

    const { password, ...result } = user;
    return result;
  }
}
