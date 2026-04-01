import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Batch } from './entities/batch.entity';
import { Catalog } from './entities/catalog.entity';
import { Section } from './entities/section.entity';
import { Brand } from './entities/brand.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateBrandDto } from './dto/create-brand.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Catalog)
    private catalogRepository: Repository<Catalog>,
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}

  // ===== Catalogs =====
  async createCatalog(dto: CreateCatalogDto): Promise<Catalog> {
    const existing = await this.catalogRepository.findOne({
      where: { name: dto.name, tenant_id: dto.tenant_id },
    });
    if (existing) throw new ConflictException('الكتالوج موجود بالفعل');
    const catalog = this.catalogRepository.create(dto);
    return this.catalogRepository.save(catalog);
  }

  async findAllCatalogs(tenant_id: string): Promise<any[]> {
    const catalogs = await this.catalogRepository.find({
      where: { tenant_id },
      order: { created_at: 'DESC' },
    });

    return Promise.all(
      catalogs.map(async (catalog) => ({
        ...catalog,
        products_count: await this.productRepository.count({
          where: { catalog_id: catalog.id, tenant_id },
        }),
      })),
    );
  }

  async updateCatalog(
    id: string,
    tenant_id: string,
    dto: Partial<CreateCatalogDto>,
  ): Promise<Catalog> {
    const catalog = await this.catalogRepository.findOne({
      where: { id, tenant_id },
    });
    if (!catalog) throw new NotFoundException('الكتالوج غير موجود');
    Object.assign(catalog, dto);
    return this.catalogRepository.save(catalog);
  }

  async removeCatalog(id: string, tenant_id: string): Promise<void> {
    const catalog = await this.catalogRepository.findOne({
      where: { id, tenant_id },
    });
    if (!catalog) throw new NotFoundException('الكتالوج غير موجود');

    const productsCount = await this.productRepository.count({
      where: { catalog_id: id, tenant_id },
    });
    if (productsCount > 0)
      throw new ConflictException(
        `لا يمكن حذف الكتالوج، يوجد ${productsCount} صنف مرتبط به`,
      );

    await this.catalogRepository.softRemove(catalog);
  }

  // ===== Sections =====
  async createSection(dto: CreateSectionDto): Promise<Section> {
    const existing = await this.sectionRepository.findOne({
      where: { name: dto.name, tenant_id: dto.tenant_id },
    });
    if (existing) throw new ConflictException('القسم موجود بالفعل');
    const section = this.sectionRepository.create(dto);
    return this.sectionRepository.save(section);
  }

  async findAllSections(tenant_id: string): Promise<any[]> {
    const sections = await this.sectionRepository.find({
      where: { tenant_id },
      order: { created_at: 'DESC' },
    });

    return Promise.all(
      sections.map(async (section) => ({
        ...section,
        products_count: await this.productRepository.count({
          where: { section_id: section.id, tenant_id },
        }),
      })),
    );
  }

  async updateSection(
    id: string,
    tenant_id: string,
    dto: Partial<CreateSectionDto>,
  ): Promise<Section> {
    const section = await this.sectionRepository.findOne({
      where: { id, tenant_id },
    });
    if (!section) throw new NotFoundException('القسم غير موجود');
    Object.assign(section, dto);
    return this.sectionRepository.save(section);
  }

  async removeSection(id: string, tenant_id: string): Promise<void> {
    const section = await this.sectionRepository.findOne({
      where: { id, tenant_id },
    });
    if (!section) throw new NotFoundException('القسم غير موجود');

    const productsCount = await this.productRepository.count({
      where: { section_id: id, tenant_id },
    });
    if (productsCount > 0)
      throw new ConflictException(
        `لا يمكن حذف القسم، يوجد ${productsCount} صنف مرتبط به`,
      );

    await this.sectionRepository.softRemove(section);
  }

  // ===== Brands =====
  async createBrand(dto: CreateBrandDto): Promise<Brand> {
    const existing = await this.brandRepository.findOne({
      where: { name: dto.name, tenant_id: dto.tenant_id },
    });
    if (existing) throw new ConflictException('الماركة موجودة بالفعل');
    const brand = this.brandRepository.create(dto);
    return this.brandRepository.save(brand);
  }

  async findAllBrands(tenant_id: string): Promise<any[]> {
    const brands = await this.brandRepository.find({
      where: { tenant_id },
      order: { created_at: 'DESC' },
    });

    return Promise.all(
      brands.map(async (brand) => ({
        ...brand,
        products_count: await this.productRepository.count({
          where: { brand_id: brand.id, tenant_id },
        }),
      })),
    );
  }

  async updateBrand(
    id: string,
    tenant_id: string,
    dto: Partial<CreateBrandDto>,
  ): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id, tenant_id },
    });
    if (!brand) throw new NotFoundException('الماركة غير موجودة');
    Object.assign(brand, dto);
    return this.brandRepository.save(brand);
  }

  async removeBrand(id: string, tenant_id: string): Promise<void> {
    const brand = await this.brandRepository.findOne({
      where: { id, tenant_id },
    });
    if (!brand) throw new NotFoundException('الماركة غير موجودة');

    const productsCount = await this.productRepository.count({
      where: { brand_id: id, tenant_id },
    });
    if (productsCount > 0)
      throw new ConflictException(
        `لا يمكن حذف الماركة، يوجد ${productsCount} صنف مرتبط بها`,
      );

    await this.brandRepository.softRemove(brand);
  }

  // ===== Products =====
  async create(dto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepository.findOne({
      where: { barcode: dto.barcode, tenant_id: dto.tenant_id },
    });
    if (existing && dto.barcode)
      throw new ConflictException('الباركود مستخدم بالفعل');
    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async findAll(tenant_id: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { tenant_id },
      relations: ['catalog', 'section', 'brand'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, tenant_id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, tenant_id },
      relations: ['catalog', 'section', 'brand'],
    });
    if (!product) throw new NotFoundException('المنتج غير موجود');
    return product;
  }

  async update(
    id: string,
    tenant_id: string,
    dto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id, tenant_id);
    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async remove(id: string, tenant_id: string): Promise<void> {
    const product = await this.findOne(id, tenant_id);

    const activeBatchesCount = await this.batchRepository.count({
      where: { product_id: id, is_active: true },
    });

    if (activeBatchesCount > 0)
      throw new ConflictException(
        `لا يمكن حذف المنتج، يوجد ${activeBatchesCount} دفعة نشطة مرتبطة به`,
      );

    await this.productRepository.softRemove(product);
  }

  async activate(id: string, tenant_id: string): Promise<Product> {
    const product = await this.findOne(id, tenant_id);
    product.is_active = true;
    return this.productRepository.save(product);
  }

  async deactivate(id: string, tenant_id: string): Promise<Product> {
    const product = await this.findOne(id, tenant_id);
    product.is_active = false;
    return this.productRepository.save(product);
  }

  // ===== Batches =====
  async createBatch(dto: CreateBatchDto): Promise<Batch> {
    const batch = this.batchRepository.create(dto);
    return this.batchRepository.save(batch);
  }

  async findBatchesByProduct(
    product_id: string,
    branch_id?: string,
    warehouse_id?: string,
  ): Promise<Batch[]> {
    const where: any = { product_id, is_active: true };
    if (branch_id) where.branch_id = branch_id;
    if (warehouse_id) where.warehouse_id = warehouse_id;

    return this.batchRepository.find({
      where,
      order: { expiry_date: 'ASC' },
    });
  }

  async findExpiringBatches(tenant_id: string, days: number): Promise<Batch[]> {
    const date = new Date();
    date.setDate(date.getDate() + days);

    return this.batchRepository
      .createQueryBuilder('batch')
      .innerJoin('batch.product', 'product')
      .where('product.tenant_id = :tenant_id', { tenant_id })
      .andWhere('batch.expiry_date <= :date', { date })
      .andWhere('batch.is_active = true')
      .orderBy('batch.expiry_date', 'ASC')
      .getMany();
  }

  async updateBatch(id: string, dto: UpdateBatchDto): Promise<Batch> {
    const batch = await this.batchRepository.findOne({ where: { id } });
    if (!batch) throw new NotFoundException('الباتش غير موجود');
    Object.assign(batch, dto);
    return this.batchRepository.save(batch);
  }

  async searchForLabel(tenant_id: string, query: string): Promise<any[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.batches', 'batch', 'batch.is_active = true')
      .where('product.tenant_id = :tenant_id', { tenant_id })
      .andWhere(
        '(LOWER(product.name_ar) LIKE LOWER(:query) OR LOWER(product.name_en) LIKE LOWER(:query) OR LOWER(product.scientific_name) LIKE LOWER(:query) OR product.barcode = :exact)',
        { query: `%${query}%`, exact: query },
      )
      .orderBy('product.name_ar', 'ASC')
      .getMany();

    return products.map((product) => ({
      id: product.id,
      name_ar: product.name_ar,
      name_en: product.name_en,
      scientific_name: product.scientific_name,
      barcode: product.barcode,
      unit: product.unit,
      batches: product.batches?.map((batch) => ({
        id: batch.id,
        lot_number: batch.lot_number,
        selling_price: batch.selling_price,
        expiry_date: batch.expiry_date,
      })),
    }));
  }

  async findAllBatches(tenant_id: string): Promise<Batch[]> {
    return this.batchRepository
      .createQueryBuilder('batch')
      .innerJoinAndSelect('batch.product', 'product')
      .where('product.tenant_id = :tenant_id', { tenant_id })
      .orderBy('batch.created_at', 'DESC')
      .getMany();
  }

  async deactivateBatch(id: string): Promise<Batch> {
    const batch = await this.batchRepository.findOne({ where: { id } });
    if (!batch) throw new NotFoundException('الدفعة غير موجودة');
    batch.is_active = false;
    return this.batchRepository.save(batch);
  }

  async activateBatch(id: string): Promise<Batch> {
    const batch = await this.batchRepository.findOne({ where: { id } });
    if (!batch) throw new NotFoundException('الدفعة غير موجودة');
    batch.is_active = true;
    return this.batchRepository.save(batch);
  }
}
