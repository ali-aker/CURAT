import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { RenewSubscriptionDto } from './dto/renew-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SubscriptionPlan } from '../tenants/entities/tenant.entity';
import { IsEnum } from 'class-validator';

class ChangePlanDto {
  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;
}

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // إنشاء اشتراك جديد
  @Post()
  create(@Request() req: any, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(dto, req.user.id);
  }

  // تجديد الاشتراك
  @Post('renew')
  renew(@Request() req: any, @Body() dto: RenewSubscriptionDto) {
    return this.subscriptionsService.renew(dto, req.user.id);
  }

  // تغيير الخطة
  @Patch(':tenant_id/change-plan')
  changePlan(
    @Param('tenant_id') tenant_id: string,
    @Body() dto: ChangePlanDto,
  ) {
    return this.subscriptionsService.changePlan(tenant_id, dto.plan);
  }

  // إيقاف tenant
  @Patch(':tenant_id/deactivate')
  deactivate(@Param('tenant_id') tenant_id: string) {
    return this.subscriptionsService.deactivate(tenant_id);
  }

  // تفعيل tenant
  @Patch(':tenant_id/activate')
  activate(@Param('tenant_id') tenant_id: string) {
    return this.subscriptionsService.activate(tenant_id);
  }

  // كل الاشتراكات
  @Get()
  findAll() {
    return this.subscriptionsService.findAll();
  }

  // اشتراكات tenant معين
  @Get(':tenant_id/history')
  findByTenant(@Param('tenant_id') tenant_id: string) {
    return this.subscriptionsService.findByTenant(tenant_id);
  }

  // مدفوعات tenant معين
  @Get(':tenant_id/payments')
  findPayments(@Param('tenant_id') tenant_id: string) {
    return this.subscriptionsService.findPaymentsByTenant(tenant_id);
  }

  // تشغيل الـ cron يدوياً (للتيست)
  @Post('deactivate-expired')
  deactivateExpired() {
    return this.subscriptionsService.deactivateExpiredTenants();
  }
}
