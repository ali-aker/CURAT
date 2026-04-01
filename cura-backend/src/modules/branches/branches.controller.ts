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
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/users/entities/user.entity';

@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchesService.create(createBranchDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  findAll(@Request() req: any) {
    return this.branchesService.findAll(req.user.tenant_id);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.branchesService.findOne(id, req.user.tenant_id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
    @Request() req: any,
  ) {
    return this.branchesService.update(id, req.user.tenant_id, updateBranchDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.branchesService.remove(id, req.user.tenant_id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  activate(@Param('id') id: string, @Request() req: any) {
    return this.branchesService.activate(id, req.user.tenant_id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  deactivate(@Param('id') id: string, @Request() req: any) {
    return this.branchesService.deactivate(id, req.user.tenant_id);
  }
}
