import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
  Request,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/users/entities/user.entity';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.WAREHOUSE)
  create(@Body() dto: CreatePurchaseOrderDto, @Request() req: any) {
    return this.purchaseOrdersService.create(dto, req.user.id);
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.WAREHOUSE,
  )
  findAll(@Request() req: any) {
    return this.purchaseOrdersService.findAll(req.user.tenant_id);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.WAREHOUSE,
  )
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.purchaseOrdersService.findOne(id, req.user.tenant_id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.WAREHOUSE)
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderDto,
    @Request() req: any,
  ) {
    return this.purchaseOrdersService.update(id, req.user.tenant_id, dto);
  }

  @Patch(':id/receive')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.WAREHOUSE)
  receive(
    @Param('id') id: string,
    @Body() dto: ReceivePurchaseOrderDto,
    @Request() req: any,
  ) {
    return this.purchaseOrdersService.receive(id, req.user.tenant_id, dto);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.purchaseOrdersService.cancel(id, req.user.tenant_id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  softDelete(@Param('id') id: string, @Request() req: any) {
    return this.purchaseOrdersService.softDelete(id, req.user.tenant_id);
  }
}
