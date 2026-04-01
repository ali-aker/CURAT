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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateCatalogDto } from './dto/create-catalog.dto';
import { UpdateSectionDto } from './dto/create-section.dto';
import { UpdateBrandDto } from './dto/create-brand.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/users/entities/user.entity';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ===== Catalogs =====
  @Post('catalogs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  createCatalog(@Body() dto: CreateCatalogDto) {
    return this.productsService.createCatalog(dto);
  }

  @Get('catalogs')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  findAllCatalogs(@Request() req: any) {
    return this.productsService.findAllCatalogs(req.user.tenant_id);
  }

  @Put('catalogs/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  updateCatalog(
    @Param('id') id: string,
    @Body() dto: UpdateCatalogDto,
    @Request() req: any,
  ) {
    return this.productsService.updateCatalog(id, req.user.tenant_id, dto);
  }

  @Delete('catalogs/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  removeCatalog(@Param('id') id: string, @Request() req: any) {
    return this.productsService.removeCatalog(id, req.user.tenant_id);
  }

  // ===== Sections =====
  @Post('sections')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  createSection(@Body() dto: CreateSectionDto) {
    return this.productsService.createSection(dto);
  }

  @Get('sections')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  findAllSections(@Request() req: any) {
    return this.productsService.findAllSections(req.user.tenant_id);
  }

  @Put('sections/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  updateSection(
    @Param('id') id: string,
    @Body() dto: UpdateSectionDto,
    @Request() req: any,
  ) {
    return this.productsService.updateSection(id, req.user.tenant_id, dto);
  }

  @Delete('sections/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  removeSection(@Param('id') id: string, @Request() req: any) {
    return this.productsService.removeSection(id, req.user.tenant_id);
  }

  // ===== Brands =====
  @Post('brands')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  createBrand(@Body() dto: CreateBrandDto) {
    return this.productsService.createBrand(dto);
  }

  @Get('brands')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  findAllBrands(@Request() req: any) {
    return this.productsService.findAllBrands(req.user.tenant_id);
  }

  @Put('brands/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  updateBrand(
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
    @Request() req: any,
  ) {
    return this.productsService.updateBrand(id, req.user.tenant_id, dto);
  }

  @Delete('brands/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  removeBrand(@Param('id') id: string, @Request() req: any) {
    return this.productsService.removeBrand(id, req.user.tenant_id);
  }

  // ===== Products =====
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  findAll(@Request() req: any) {
    return this.productsService.findAll(req.user.tenant_id);
  }

  @Get('search/label')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  searchForLabel(
    @Request() req: any,
    @Query('query') query: string,
    @Query('tenant_id') tenant_id_query?: string,
  ) {
    const tenant_id =
      req.user.role === 'super_admin' ? tenant_id_query : req.user.tenant_id;
    return this.productsService.searchForLabel(tenant_id, query);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.productsService.findOne(id, req.user.tenant_id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Request() req: any,
  ) {
    return this.productsService.update(id, req.user.tenant_id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.productsService.remove(id, req.user.tenant_id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  activate(@Param('id') id: string, @Request() req: any) {
    return this.productsService.activate(id, req.user.tenant_id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  deactivate(@Param('id') id: string, @Request() req: any) {
    return this.productsService.deactivate(id, req.user.tenant_id);
  }

  // ===== Batches =====
  @Post('batches')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.WAREHOUSE)
  createBatch(@Body() dto: CreateBatchDto) {
    return this.productsService.createBatch(dto);
  }

  @Get('batches/all')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.WAREHOUSE,
  )
  findAllBatches(@Request() req: any) {
    return this.productsService.findAllBatches(req.user.tenant_id);
  }

  @Get(':id/batches')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.CASHIER,
  )
  findBatchesByProduct(
    @Param('id') id: string,
    @Query('branch_id') branch_id?: string,
    @Query('warehouse_id') warehouse_id?: string,
  ) {
    return this.productsService.findBatchesByProduct(
      id,
      branch_id,
      warehouse_id,
    );
  }

  @Get('batches/expiring')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.BRANCH_MANAGER)
  findExpiringBatches(@Request() req: any, @Query('days') days: number = 30) {
    return this.productsService.findExpiringBatches(req.user.tenant_id, days);
  }

  @Put('batches/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.WAREHOUSE)
  updateBatch(@Param('id') id: string, @Body() dto: UpdateBatchDto) {
    return this.productsService.updateBatch(id, dto);
  }

  @Patch('batches/:id/deactivate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.WAREHOUSE)
  deactivateBatch(@Param('id') id: string) {
    return this.productsService.deactivateBatch(id);
  }

  @Patch('batches/:id/activate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.WAREHOUSE)
  activateBatch(@Param('id') id: string) {
    return this.productsService.activateBatch(id);
  }
}
