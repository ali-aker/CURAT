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
  Query,
} from '@nestjs/common';
import { SalesInvoicesService } from './sales-invoices.service';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';
import { UpdateSalesInvoiceDto } from './dto/update-sales-invoice.dto';
import { ConfirmSalesInvoiceDto } from './dto/confirm-sales-invoice.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/users/entities/user.entity';
import { InvoiceStatus } from './entities/sales-invoice.entity';

@Controller('sales-invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesInvoicesController {
  constructor(private readonly salesInvoicesService: SalesInvoicesService) {}

  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.CASHIER,
    UserRole.BRANCH_MANAGER,
  )
  create(@Body() dto: CreateSalesInvoiceDto, @Request() req: any) {
    return this.salesInvoicesService.create(dto, req.user.id);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  findAll(@Request() req: any, @Query('status') status?: InvoiceStatus) {
    return this.salesInvoicesService.findAll(req.user.tenant_id, status);
  }

  @Get('drafts')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.CASHIER,
    UserRole.BRANCH_MANAGER,
  )
  findDrafts(@Request() req: any, @Query('branch_id') branch_id: string) {
    return this.salesInvoicesService.findDrafts(req.user.tenant_id, branch_id);
  }

  @Get('search/by-number')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.CASHIER,
    UserRole.BRANCH_MANAGER,
  )
  findByNumber(
    @Request() req: any,
    @Query('invoice_number') invoice_number: string,
  ) {
    return this.salesInvoicesService.findByNumber(
      req.user.tenant_id,
      invoice_number,
    );
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.CASHIER,
    UserRole.BRANCH_MANAGER,
  )
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.salesInvoicesService.findOne(id, req.user.tenant_id);
  }

  @Put(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.CASHIER,
    UserRole.BRANCH_MANAGER,
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSalesInvoiceDto,
    @Request() req: any,
  ) {
    return this.salesInvoicesService.update(id, req.user.tenant_id, dto);
  }

  @Patch(':id/confirm')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.CASHIER,
    UserRole.BRANCH_MANAGER,
  )
  confirm(
    @Param('id') id: string,
    @Body() dto: ConfirmSalesInvoiceDto,
    @Request() req: any,
  ) {
    return this.salesInvoicesService.confirm(id, req.user.tenant_id, dto);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.salesInvoicesService.cancel(id, req.user.tenant_id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  softDelete(@Param('id') id: string, @Request() req: any) {
    return this.salesInvoicesService.softDelete(id, req.user.tenant_id);
  }
}
