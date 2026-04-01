import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { SubscriptionPlan } from '@modules/tenants/entities/tenant.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { RenewSubscriptionDto } from './dto/renew-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Tenant)
    private tenantRepo: Repository<Tenant>,
  ) {}

  // إنشاء اشتراك جديد
  async create(
    dto: CreateSubscriptionDto,
    created_by: string,
  ): Promise<Subscription> {
    const tenant = await this.tenantRepo.findOne({
      where: { id: dto.tenant_id },
    });
    if (!tenant) throw new NotFoundException('الـ Tenant غير موجود');

    const subscription = this.subscriptionRepo.create({
      ...dto,
      status: SubscriptionStatus.ACTIVE,
      created_by,
    });

    const saved = await this.subscriptionRepo.save(subscription);

    // تحديث الـ tenant
    tenant.subscription_plan = dto.plan;
    tenant.subscription_start = new Date(dto.start_date);
    tenant.subscription_end = new Date(dto.end_date);
    tenant.is_active = true;
    await this.tenantRepo.save(tenant);

    return saved;
  }

  // تجديد الاشتراك
  async renew(
    dto: RenewSubscriptionDto,
    created_by: string,
  ): Promise<{ subscription: Subscription; payment: Payment }> {
    const tenant = await this.tenantRepo.findOne({
      where: { id: dto.tenant_id },
    });
    if (!tenant) throw new NotFoundException('الـ Tenant غير موجود');

    // حساب تاريخ البداية والنهاية
    const today = new Date();
    const currentEnd = tenant.subscription_end
      ? new Date(tenant.subscription_end)
      : today;

    // لو الاشتراك لسه شغال نبدأ من بعده، لو انتهى نبدأ من النهارده
    const start_date = currentEnd > today ? currentEnd : today;
    const end_date = new Date(start_date);
    end_date.setMonth(end_date.getMonth() + dto.duration_months);

    // إنشاء الاشتراك الجديد
    const subscription = await this.subscriptionRepo.save(
      this.subscriptionRepo.create({
        tenant_id: dto.tenant_id,
        plan: dto.plan,
        status: SubscriptionStatus.ACTIVE,
        start_date,
        end_date,
        amount_paid: dto.amount_paid,
        created_by,
        notes: dto.notes,
      }),
    );

    // تسجيل الدفع
    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({
        tenant_id: dto.tenant_id,
        subscription_id: subscription.id,
        amount: dto.amount_paid,
        payment_method: dto.payment_method,
        status: PaymentStatus.COMPLETED,
        transaction_id: dto.transaction_id,
        created_by,
        notes: dto.notes,
      }),
    );

    // تحديث الـ tenant
    tenant.subscription_plan = dto.plan;
    tenant.subscription_start = start_date;
    tenant.subscription_end = end_date;
    tenant.is_active = true;
    await this.tenantRepo.save(tenant);

    return { subscription, payment };
  }

  // تغيير الخطة
  async changePlan(tenant_id: string, plan: SubscriptionPlan): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({
      where: { id: tenant_id },
    });
    if (!tenant) throw new NotFoundException('الـ Tenant غير موجود');

    if (tenant.subscription_plan === plan) {
      throw new BadRequestException('الخطة دي هي الخطة الحالية بالفعل');
    }

    tenant.subscription_plan = plan;
    return this.tenantRepo.save(tenant);
  }

  // إيقاف tenant يدوي
  async deactivate(tenant_id: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({
      where: { id: tenant_id },
    });
    if (!tenant) throw new NotFoundException('الـ Tenant غير موجود');

    tenant.is_active = false;
    return this.tenantRepo.save(tenant);
  }

  // تفعيل tenant يدوي
  async activate(tenant_id: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({
      where: { id: tenant_id },
    });
    if (!tenant) throw new NotFoundException('الـ Tenant غير موجود');

    tenant.is_active = true;
    return this.tenantRepo.save(tenant);
  }

  // تاريخ الاشتراكات لـ tenant
  async findByTenant(tenant_id: string): Promise<Subscription[]> {
    return this.subscriptionRepo.find({
      where: { tenant_id },
      order: { created_at: 'DESC' },
    });
  }

  // تاريخ المدفوعات لـ tenant
  async findPaymentsByTenant(tenant_id: string): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { tenant_id },
      order: { created_at: 'DESC' },
    });
  }

  // كل الاشتراكات (للـ super_admin)
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepo.find({
      relations: ['tenant'],
      order: { created_at: 'DESC' },
    });
  }

  // إيقاف الـ tenants المنتهية اشتراكاتهم تلقائياً (Cron Job)
  async deactivateExpiredTenants(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredTenants = await this.tenantRepo.find({
      where: {
        is_active: true,
        subscription_end: LessThan(today),
      },
    });

    for (const tenant of expiredTenants) {
      tenant.is_active = false;
      await this.tenantRepo.save(tenant);
    }
  }
}
