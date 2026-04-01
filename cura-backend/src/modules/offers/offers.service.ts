import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer, OfferType } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
  ) {}

  async create(tenant_id: string, dto: CreateOfferDto): Promise<Offer> {
    // التحقق من عدم وجود offer فعال على نفس الـ batch
    const existing = await this.offersRepository.findOne({
      where: {
        tenant_id,
        batch_id: dto.batch_id,
        is_active: true,
      },
    });

    if (existing) {
      throw new BadRequestException('يوجد عرض فعال بالفعل على هذه الدفعة');
    }

    // التحقق من الـ discount_value للـ percentage
    if (dto.type === OfferType.PERCENTAGE && dto.discount_value > 100) {
      throw new BadRequestException('نسبة الخصم لا يمكن أن تتجاوز 100%');
    }

    const offer = this.offersRepository.create({
      ...dto,
      tenant_id,
    });

    return this.offersRepository.save(offer);
  }

  async findAll(tenant_id: string): Promise<Offer[]> {
    return this.offersRepository.find({
      where: { tenant_id },
      relations: ['batch', 'free_batch'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(tenant_id: string, id: string): Promise<Offer> {
    const offer = await this.offersRepository.findOne({
      where: { tenant_id, id },
      relations: ['batch', 'free_batch'],
    });

    if (!offer) {
      throw new NotFoundException('العرض غير موجود');
    }

    return offer;
  }

  async update(
    tenant_id: string,
    id: string,
    dto: UpdateOfferDto,
  ): Promise<Offer> {
    const offer = await this.findOne(tenant_id, id);

    Object.assign(offer, dto);
    return this.offersRepository.save(offer);
  }

  async activate(tenant_id: string, id: string): Promise<Offer> {
    const offer = await this.findOne(tenant_id, id);

    if (offer.is_active) {
      throw new BadRequestException('العرض فعال بالفعل');
    }

    // التحقق من عدم وجود offer فعال آخر على نفس الـ batch
    const existing = await this.offersRepository.findOne({
      where: {
        tenant_id,
        batch_id: offer.batch_id,
        is_active: true,
      },
    });

    if (existing) {
      throw new BadRequestException('يوجد عرض فعال بالفعل على هذه الدفعة');
    }

    offer.is_active = true;
    return this.offersRepository.save(offer);
  }

  async deactivate(tenant_id: string, id: string): Promise<Offer> {
    const offer = await this.findOne(tenant_id, id);

    if (!offer.is_active) {
      throw new BadRequestException('العرض غير فعال بالفعل');
    }

    offer.is_active = false;
    return this.offersRepository.save(offer);
  }

  async delete(tenant_id: string, id: string): Promise<void> {
    const offer = await this.findOne(tenant_id, id);
    await this.offersRepository.remove(offer);
  }

  // دي بتتاستخدم من الـ SalesInvoicesService
  async findActiveOfferForBatch(
    tenant_id: string,
    batch_id: string,
  ): Promise<Offer | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.offersRepository
      .createQueryBuilder('offer')
      .where('offer.tenant_id = :tenant_id', { tenant_id })
      .andWhere('offer.batch_id = :batch_id', { batch_id })
      .andWhere('offer.is_active = true')
      .andWhere('offer.expiry_date >= :today', { today })
      .getOne();
  }
}
