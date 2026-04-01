import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateSalesReturnDto } from './dto/create-sales-return.dto';
import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto';
import { ConfirmReturnDto } from './dto/confirm-return.dto';
import { CancelReturnDto } from './dto/cancel-return.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/users/entities/user.entity';

@Controller('returns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  // ==================== Sales Returns ====================

  @Post('sales')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  createSalesReturn(@Body() dto: CreateSalesReturnDto, @Request() req: any) {
    return this.returnsService.createSalesReturn(dto, req.user.id);
  }

  @Get('sales')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  findAllSalesReturns(@Request() req: any) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query?.tenant_id
        : req.user.tenant_id;
    return this.returnsService.findAllSalesReturns(tenant_id);
  }

  @Get('sales/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  findOneSalesReturn(@Param('id') id: string, @Request() req: any) {
    return this.returnsService.findOneSalesReturn(id, req.user.tenant_id);
  }

  @Patch('sales/:id/confirm')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  confirmSalesReturn(
    @Param('id') id: string,
    @Body() dto: ConfirmReturnDto,
    @Request() req: any,
  ) {
    return this.returnsService.confirmSalesReturn(
      id,
      req.user.tenant_id,
      dto,
      req.user.id,
    );
  }

  @Patch('sales/:id/cancel')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  cancelSalesReturn(
    @Param('id') id: string,
    @Body() dto: CancelReturnDto,
    @Request() req: any,
  ) {
    return this.returnsService.cancelSalesReturn(
      id,
      req.user.tenant_id,
      dto,
      req.user.id,
    );
  }

  // ==================== Purchase Returns ====================

  @Post('purchases')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.WAREHOUSE)
  createPurchaseReturn(
    @Body() dto: CreatePurchaseReturnDto,
    @Request() req: any,
  ) {
    return this.returnsService.createPurchaseReturn(dto, req.user.id);
  }

  @Get('purchases')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.WAREHOUSE)
  findAllPurchaseReturns(@Request() req: any) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query?.tenant_id
        : req.user.tenant_id;
    return this.returnsService.findAllPurchaseReturns(tenant_id);
  }

  @Get('purchases/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.WAREHOUSE)
  findOnePurchaseReturn(@Param('id') id: string, @Request() req: any) {
    return this.returnsService.findOnePurchaseReturn(id, req.user.tenant_id);
  }

  @Patch('purchases/:id/confirm')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.WAREHOUSE)
  confirmPurchaseReturn(
    @Param('id') id: string,
    @Body() dto: ConfirmReturnDto,
    @Request() req: any,
  ) {
    return this.returnsService.confirmPurchaseReturn(
      id,
      req.user.tenant_id,
      dto,
      req.user.id,
    );
  }

  @Patch('purchases/:id/cancel')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.WAREHOUSE)
  cancelPurchaseReturn(
    @Param('id') id: string,
    @Body() dto: CancelReturnDto,
    @Request() req: any,
  ) {
    return this.returnsService.cancelPurchaseReturn(
      id,
      req.user.tenant_id,
      dto,
      req.user.id,
    );
  }
}
