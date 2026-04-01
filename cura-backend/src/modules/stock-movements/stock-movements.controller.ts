import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/users/entities/user.entity';
import { ReferenceType } from './entities/stock-movement.entity';

@Controller('stock-movements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  create(@Body() dto: CreateStockMovementDto, @Request() req: any) {
    return this.stockMovementsService.create(dto, req.user.id);
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.WAREHOUSE,
  )
  findAll(
    @Request() req: any,
    @Query('tenant_id') query_tenant_id?: string,
    @Query('branch_id') branch_id?: string,
    @Query('product_id') product_id?: string,
    @Query('reference_type') reference_type?: ReferenceType,
  ) {
    const tenant_id =
      req.user.role === 'super_admin' ? query_tenant_id : req.user.tenant_id;

    return this.stockMovementsService.findAll(
      tenant_id,
      branch_id,
      product_id,
      reference_type,
    );
  }

  @Get('stock')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
    UserRole.WAREHOUSE,
  )
  getStock(
    @Request() req: any,
    @Query('location_id') location_id: string,
    @Query('product_id') product_id: string,
    @Query('tenant_id') query_tenant_id?: string,
    @Query('batch_id') batch_id?: string,
    @Query('location_type') location_type: 'branch' | 'warehouse' = 'branch',
  ) {
    const tenant_id =
      req.user.role === 'super_admin' ? query_tenant_id : req.user.tenant_id;

    return this.stockMovementsService.getStock(
      tenant_id,
      location_id,
      product_id,
      batch_id,
      location_type,
    );
  }

  @Get('stock/batches')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
    UserRole.WAREHOUSE,
  )
  getStockByBatches(
    @Request() req: any,
    @Query('location_id') location_id: string,
    @Query('product_id') product_id: string,
    @Query('tenant_id') query_tenant_id?: string,
    @Query('location_type') location_type: 'branch' | 'warehouse' = 'branch',
  ) {
    const tenant_id =
      req.user.role === 'super_admin' ? query_tenant_id : req.user.tenant_id;

    return this.stockMovementsService.getStockByBatches(
      tenant_id,
      location_id,
      product_id,
      location_type,
    );
  }
}
