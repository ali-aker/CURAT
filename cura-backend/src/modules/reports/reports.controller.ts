import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  getSalesReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const tenant_id =
      req.user.role === 'super_admin' ? filter.tenant_id : req.user.tenant_id;
    return this.reportsService.getSalesReport(tenant_id, filter);
  }

  @Get('stock')
  getStockReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const tenant_id =
      req.user.role === 'super_admin' ? filter.tenant_id : req.user.tenant_id;
    return this.reportsService.getStockReport(tenant_id, filter);
  }

  @Get('top-products')
  getTopProductsReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const tenant_id =
      req.user.role === 'super_admin' ? filter.tenant_id : req.user.tenant_id;
    return this.reportsService.getTopProductsReport(tenant_id, filter);
  }

  @Get('top-customers')
  getTopCustomersReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const tenant_id =
      req.user.role === 'super_admin' ? filter.tenant_id : req.user.tenant_id;
    return this.reportsService.getTopCustomersReport(tenant_id, filter);
  }

  @Get('purchases')
  getPurchasesReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const tenant_id =
      req.user.role === 'super_admin' ? filter.tenant_id : req.user.tenant_id;
    return this.reportsService.getPurchasesReport(tenant_id, filter);
  }

  @Get('returns')
  getReturnsReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const tenant_id =
      req.user.role === 'super_admin' ? filter.tenant_id : req.user.tenant_id;
    return this.reportsService.getReturnsReport(tenant_id, filter);
  }

  @Get('delivery')
  getDeliveryReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const tenant_id =
      req.user.role === 'super_admin' ? filter.tenant_id : req.user.tenant_id;
    return this.reportsService.getDeliveryReport(tenant_id, filter);
  }

  @Get('transfers')
  getTransfersReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const tenant_id =
      req.user.role === 'super_admin' ? filter.tenant_id : req.user.tenant_id;
    return this.reportsService.getTransfersReport(tenant_id, filter);
  }

  @Get('profit')
  getProfitReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const tenant_id =
      req.user.role === 'super_admin' ? filter.tenant_id : req.user.tenant_id;
    return this.reportsService.getProfitReport(tenant_id, filter);
  }

  @Get('users')
  getUsersReport(@Request() req: any) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.reportsService.getUsersReport(tenant_id);
  }

  @Get('branches')
  getBranchesReport(@Request() req: any) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.reportsService.getBranchesReport(tenant_id);
  }

  @Get('offers')
  getOffersReport(@Request() req: any) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.reportsService.getOffersReport(tenant_id);
  }

  @Get('promo-codes')
  getPromoCodesReport(@Request() req: any) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.reportsService.getPromoCodesReport(tenant_id);
  }

  @Get('slow-moving')
  getSlowMovingReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const tenant_id =
      req.user.role === 'super_admin' ? filter.tenant_id : req.user.tenant_id;
    return this.reportsService.getSlowMovingReport(tenant_id, filter);
  }

  @Get('daily-closing')
  getDailyClosingReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const tenant_id =
      req.user.role === 'super_admin' ? filter.tenant_id : req.user.tenant_id;
    return this.reportsService.getDailyClosingReport(tenant_id, filter);
  }

  @Get('expiry')
  getExpiryReport(
    @Request() req: any,
    @Query('days_ahead') days_ahead?: number,
  ) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.reportsService.getExpiryReport(
      tenant_id,
      Number(days_ahead) || 30,
    );
  }
}
