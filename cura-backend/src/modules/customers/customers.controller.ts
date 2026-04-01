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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/users/entities/user.entity';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.CASHIER)
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  findAll(@Request() req: any) {
    return this.customersService.findAll(req.user.tenant_id);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.customersService.findOne(id, req.user.tenant_id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.CASHIER)
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Request() req: any,
  ) {
    return this.customersService.update(
      id,
      req.user.tenant_id,
      updateCustomerDto,
    );
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.customersService.remove(id, req.user.tenant_id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  activate(@Param('id') id: string, @Request() req: any) {
    return this.customersService.activate(id, req.user.tenant_id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  deactivate(@Param('id') id: string, @Request() req: any) {
    return this.customersService.deactivate(id, req.user.tenant_id);
  }

  @Get(':id/points')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  getPoints(@Param('id') id: string, @Request() req: any) {
    return this.customersService.getPoints(id, req.user.tenant_id);
  }

  @Patch(':id/redeem-points')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.CASHIER)
  redeemPoints(
    @Param('id') id: string,
    @Body('points') points: number,
    @Request() req: any,
  ) {
    return this.customersService.redeemPoints(id, req.user.tenant_id, points);
  }

  @Patch(':id/add-points')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.CASHIER)
  addPoints(
    @Param('id') id: string,
    @Body('points') points: number,
    @Request() req: any,
  ) {
    return this.customersService.addPoints(id, req.user.tenant_id, points);
  }
}
