import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ValidatePromoCodeDto } from './dto/validate-promo-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('promo-codes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  create(@Request() req: any, @Body() dto: CreatePromoCodeDto) {
    const tenant_id =
      req.user.role === 'super_admin' ? dto.tenant_id : req.user.tenant_id;
    return this.promoCodesService.create(tenant_id, dto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  findAll(@Request() req: any) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.promoCodesService.findAll(tenant_id);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  findOne(@Request() req: any, @Param('id') id: string) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.promoCodesService.findOne(tenant_id, id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePromoCodeDto,
  ) {
    const tenant_id =
      req.user.role === 'super_admin' ? dto.tenant_id : req.user.tenant_id;
    return this.promoCodesService.update(tenant_id, id, dto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  activate(@Request() req: any, @Param('id') id: string) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.promoCodesService.activate(tenant_id, id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  deactivate(@Request() req: any, @Param('id') id: string) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.promoCodesService.deactivate(tenant_id, id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  delete(@Request() req: any, @Param('id') id: string) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.promoCodesService.delete(tenant_id, id);
  }

  @Post('validate')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  validateCode(@Request() req: any, @Body() dto: ValidatePromoCodeDto) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.promoCodesService.validate(tenant_id, dto);
  }
}
