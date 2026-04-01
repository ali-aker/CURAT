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
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/users/entities/user.entity';

@Controller('warehouses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehousesService.create(createWarehouseDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  findAll(@Request() req: any) {
    return this.warehousesService.findAll(req.user.tenant_id);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.WAREHOUSE)
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.warehousesService.findOne(id, req.user.tenant_id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
    @Request() req: any,
  ) {
    return this.warehousesService.update(
      id,
      req.user.tenant_id,
      updateWarehouseDto,
    );
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.warehousesService.remove(id, req.user.tenant_id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  activate(@Param('id') id: string, @Request() req: any) {
    return this.warehousesService.activate(id, req.user.tenant_id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  deactivate(@Param('id') id: string, @Request() req: any) {
    return this.warehousesService.deactivate(id, req.user.tenant_id);
  }
}
