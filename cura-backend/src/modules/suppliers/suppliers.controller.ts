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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/users/entities/user.entity';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.WAREHOUSE,
  )
  findAll(@Request() req: any) {
    return this.suppliersService.findAll(req.user.tenant_id);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.WAREHOUSE,
  )
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.suppliersService.findOne(id, req.user.tenant_id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @Request() req: any,
  ) {
    return this.suppliersService.update(id, req.user.tenant_id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.suppliersService.remove(id, req.user.tenant_id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  activate(@Param('id') id: string, @Request() req: any) {
    return this.suppliersService.activate(id, req.user.tenant_id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  deactivate(@Param('id') id: string, @Request() req: any) {
    return this.suppliersService.deactivate(id, req.user.tenant_id);
  }
}
