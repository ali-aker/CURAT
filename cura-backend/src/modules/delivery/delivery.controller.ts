import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryOrderDto } from './dto/create-delivery-order.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/users/entities/user.entity';

@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  // ==================== Delivery Orders ====================

  @Post('orders')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  create(@Body() dto: CreateDeliveryOrderDto, @Request() req: any) {
    return this.deliveryService.create(dto, req.user.id);
  }

  @Get('orders')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  findAll(@Request() req: any) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query?.tenant_id
        : req.user.tenant_id;
    return this.deliveryService.findAll(tenant_id);
  }

  @Get('orders/search')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  searchByPhone(@Request() req: any, @Query('phone') phone: string) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query?.tenant_id
        : req.user.tenant_id;
    return this.deliveryService.searchByPhone(tenant_id, phone);
  }

  @Get('orders/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.deliveryService.findOne(id, req.user.tenant_id);
  }

  @Patch('orders/:id/status')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryStatusDto,
    @Request() req: any,
  ) {
    return this.deliveryService.updateStatus(
      id,
      req.user.tenant_id,
      dto,
      req.user.id,
    );
  }

  @Patch('orders/:id/assign-driver')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  assignDriver(
    @Param('id') id: string,
    @Body() dto: AssignDriverDto,
    @Request() req: any,
  ) {
    return this.deliveryService.assignDriver(id, req.user.tenant_id, dto);
  }

  // ==================== Delivery Drivers ====================

  @Post('drivers')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  createDriver(@Body() body: any, @Request() req: any) {
    return this.deliveryService.createDriver({
      ...body,
      tenant_id:
        req.user.role === 'super_admin' ? body.tenant_id : req.user.tenant_id,
    });
  }

  @Get('drivers')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  findAllDrivers(@Request() req: any, @Query('branch_id') branch_id?: string) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query?.tenant_id
        : req.user.tenant_id;
    return this.deliveryService.findAllDrivers(tenant_id, branch_id);
  }

  @Patch('drivers/:id/toggle')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  toggleDriver(@Param('id') id: string, @Request() req: any) {
    return this.deliveryService.toggleDriver(id, req.user.tenant_id);
  }
}
