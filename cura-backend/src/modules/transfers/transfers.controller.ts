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
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { ConfirmTransferDto } from './dto/confirm-transfer.dto';
import { CancelTransferDto } from './dto/cancel-transfer.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/users/entities/user.entity';

@Controller('transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.WAREHOUSE,
  )
  create(@Body() dto: CreateTransferDto, @Request() req: any) {
    return this.transfersService.create(dto, req.user.id);
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.WAREHOUSE,
  )
  findAll(@Request() req: any) {
    const tenant_id =
      req.user.role === 'super_admin'
        ? req.query?.tenant_id
        : req.user.tenant_id;

    return this.transfersService.findAll(tenant_id);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.WAREHOUSE,
  )
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.transfersService.findOne(id, req.user.tenant_id);
  }

  @Patch(':id/confirm')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.WAREHOUSE,
  )
  confirm(
    @Param('id') id: string,
    @Body() dto: ConfirmTransferDto,
    @Request() req: any,
  ) {
    return this.transfersService.confirm(
      id,
      req.user.tenant_id,
      dto,
      req.user.id,
    );
  }

  @Patch(':id/cancel')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.WAREHOUSE,
  )
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelTransferDto,
    @Request() req: any,
  ) {
    return this.transfersService.cancel(
      id,
      req.user.tenant_id,
      dto,
      req.user.id,
    );
  }
}
