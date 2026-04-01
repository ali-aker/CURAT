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
  Query,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('offers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  create(@Request() req: any, @Body() dto: CreateOfferDto) {
    const tenant_id =
      req.user.role === 'super_admin' ? req.body.tenant_id : req.user.tenant_id;
    return this.offersService.create(tenant_id, dto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  findAll(@Request() req: any) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.offersService.findAll(tenant_id);
  }

  @Get('batch')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  findActiveOfferForBatch(
    @Request() req: any,
    @Query('batch_id') batch_id: string,
  ) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.offersService.findActiveOfferForBatch(tenant_id, batch_id);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  findOne(@Request() req: any, @Param('id') id: string) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.offersService.findOne(tenant_id, id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOfferDto,
  ) {
    const tenant_id =
      req.user.role === 'super_admin' ? req.body.tenant_id : req.user.tenant_id;
    return this.offersService.update(tenant_id, id, dto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  activate(@Request() req: any, @Param('id') id: string) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.offersService.activate(tenant_id, id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  deactivate(@Request() req: any, @Param('id') id: string) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.offersService.deactivate(tenant_id, id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  delete(@Request() req: any, @Param('id') id: string) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query.tenant_id
        : req.user.tenant_id;
    return this.offersService.delete(tenant_id, id);
  }
}
