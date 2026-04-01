import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode, DiscountType } from './entities/promo-code.entity';
import { PromoCodeUsage } from './entities/promo-code-usage.entity';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ValidatePromoCodeDto } from './dto/validate-promo-code.dto';

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectRepository(PromoCode)
    private promoCodesRepository: Repository<PromoCode>,
    @InjectRepository(PromoCodeUsage)
    private promoCodeUsagesRepository: Repository<PromoCodeUsage>,
  ) {}

  async create(tenant_id: string, dto: CreatePromoCodeDto): Promise<PromoCode> {
    // التحقق من عدم تكرار الكود في نفس الـ tenant
    const existing = await this.promoCodesRepository.findOne({
      where: { tenant_id, code: dto.code },
    });

    if (existing) {
      throw new BadRequestException('الكود موجود بالفعل');
    }

    // التحقق من الـ discount_value للـ percentage
    if (
      dto.discount_type === DiscountType.PERCENTAGE &&
      dto.discount_value > 100
    ) {
      throw new BadRequestException('نسبة الخصم لا يمكن أن تتجاوز 100%');
    }

    const promoCode = this.promoCodesRepository.create({
      ...dto,
      tenant_id,
    });

    return this.promoCodesRepository.save(promoCode);
  }

  async findAll(tenant_id: string): Promise<PromoCode[]> {
    return this.promoCodesRepository.find({
      where: { tenant_id },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(tenant_id: string, id: string): Promise<PromoCode> {
    const promoCode = await this.promoCodesRepository.findOne({
      where: { tenant_id, id },
      relations: ['usages'],
    });

    if (!promoCode) {
      throw new NotFoundException('الكود غير موجود');
    }

    return promoCode;
  }

  async update(
    tenant_id: string,
    id: string,
    dto: UpdatePromoCodeDto,
  ): Promise<PromoCode> {
    const promoCode = await this.findOne(tenant_id, id);

    // لو بيغير الكود نفسه، نتحقق من عدم التكرار
    if (dto.code && dto.code !== promoCode.code) {
      const existing = await this.promoCodesRepository.findOne({
        where: { tenant_id, code: dto.code },
      });
      if (existing) {
        throw new BadRequestException('الكود موجود بالفعل');
      }
    }

    Object.assign(promoCode, dto);
    return this.promoCodesRepository.save(promoCode);
  }

  async activate(tenant_id: string, id: string): Promise<PromoCode> {
    const promoCode = await this.findOne(tenant_id, id);

    if (promoCode.is_active) {
      throw new BadRequestException('الكود فعال بالفعل');
    }

    promoCode.is_active = true;
    return this.promoCodesRepository.save(promoCode);
  }

  async deactivate(tenant_id: string, id: string): Promise<PromoCode> {
    const promoCode = await this.findOne(tenant_id, id);

    if (!promoCode.is_active) {
      throw new BadRequestException('الكود غير فعال بالفعل');
    }

    promoCode.is_active = false;
    return this.promoCodesRepository.save(promoCode);
  }

  async delete(tenant_id: string, id: string): Promise<void> {
    const promoCode = await this.findOne(tenant_id, id);
    await this.promoCodesRepository.remove(promoCode);
  }

  // دي بتتاستخدم من الـ SalesInvoicesService
  async validate(
    tenant_id: string,
    dto: ValidatePromoCodeDto,
  ): Promise<{ promoCode: PromoCode; discount_amount: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const promoCode = await this.promoCodesRepository.findOne({
      where: { tenant_id, code: dto.code, is_active: true },
    });

    if (!promoCode) {
      throw new BadRequestException('الكود غير صحيح أو غير فعال');
    }

    // التحقق من تاريخ الانتهاء
    if (new Date(promoCode.expiry_date) < today) {
      throw new BadRequestException('الكود منتهي الصلاحية');
    }

    // التحقق من عدد مرات الاستخدام
    if (promoCode.used_count >= promoCode.max_uses) {
      throw new BadRequestException(
        'الكود تجاوز الحد الأقصى لعدد مرات الاستخدام',
      );
    }

    // التحقق من الحد الأدنى للفاتورة
    if (dto.amount < promoCode.minimum_amount) {
      throw new BadRequestException(
        `الحد الأدنى لاستخدام الكود هو ${promoCode.minimum_amount}`,
      );
    }

    // التحقق من عدم استخدام الكود من نفس الـ customer
    const usedBefore = await this.promoCodeUsagesRepository.findOne({
      where: {
        promo_code_id: promoCode.id,
        customer_id: dto.customer_id,
      },
    });

    if (usedBefore) {
      throw new BadRequestException('لقد استخدمت هذا الكود من قبل');
    }

    // حساب الخصم
    let discount_amount = 0;

    if (promoCode.discount_type === DiscountType.PERCENTAGE) {
      discount_amount = (dto.amount * Number(promoCode.discount_value)) / 100;
      if (promoCode.max_discount_amount) {
        discount_amount = Math.min(
          discount_amount,
          Number(promoCode.max_discount_amount),
        );
      }
    } else {
      discount_amount = Math.min(Number(promoCode.discount_value), dto.amount);
    }

    return { promoCode, discount_amount };
  }

  // دي بتتاستخدم بعد تأكيد الفاتورة
  async applyUsage(
    promo_code_id: string,
    customer_id: string,
    sales_invoice_id: string,
  ): Promise<void> {
    // تسجيل الاستخدام
    const usage = this.promoCodeUsagesRepository.create({
      promo_code_id,
      customer_id,
      sales_invoice_id,
    });
    await this.promoCodeUsagesRepository.save(usage);

    // زيادة الـ used_count
    await this.promoCodesRepository.increment(
      { id: promo_code_id },
      'used_count',
      1,
    );
  }
}
