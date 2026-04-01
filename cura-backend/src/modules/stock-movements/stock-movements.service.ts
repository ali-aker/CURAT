import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement, ReferenceType } from './entities/stock-movement.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
  ) {}

  async create(
    dto: CreateStockMovementDto,
    created_by: string,
  ): Promise<StockMovement> {
    const movement = this.stockMovementRepository.create({
      ...dto,
      created_by,
    });
    return this.stockMovementRepository.save(movement);
  }

  async getStock(
    tenant_id: string,
    location_id: string,
    product_id: string,
    batch_id?: string,
    location_type: 'branch' | 'warehouse' = 'branch',
  ): Promise<number> {
    const query = this.stockMovementRepository
      .createQueryBuilder('movement')
      .select(
        `
  SUM(CASE WHEN movement.type = 'in' THEN movement.quantity ELSE 0 END) -
  SUM(CASE WHEN movement.type = 'out' THEN movement.quantity ELSE 0 END) -
  SUM(CASE WHEN movement.type = 'reserved' THEN movement.quantity ELSE 0 END)
`,
        'stock',
      )
      .where('movement.tenant_id = :tenant_id', { tenant_id })
      .andWhere(`movement.${location_type}_id = :location_id`, { location_id })
      .andWhere('movement.product_id = :product_id', { product_id });

    if (location_type === 'branch') {
      query.andWhere('movement.branch_id IS NOT NULL');
      query.andWhere('movement.warehouse_id IS NULL');
    } else {
      query.andWhere('movement.warehouse_id IS NOT NULL');
      query.andWhere('movement.branch_id IS NULL');
    }

    if (batch_id) {
      query.andWhere('movement.batch_id = :batch_id', { batch_id });
    }

    const result = await query.getRawOne();
    return Number(result?.stock || 0);
  }

  async getStockByBatches(
    tenant_id: string,
    location_id: string,
    product_id: string,
    location_type: 'branch' | 'warehouse' = 'branch',
  ): Promise<{ batch_id: string; stock: number }[]> {
    const result = await this.stockMovementRepository
      .createQueryBuilder('movement')
      .select('movement.batch_id', 'batch_id')
      .addSelect(
        `
      SUM(CASE WHEN movement.type = 'in' THEN movement.quantity ELSE 0 END) -
      SUM(CASE WHEN movement.type = 'out' THEN movement.quantity ELSE 0 END)
    `,
        'stock',
      )
      .where('movement.tenant_id = :tenant_id', { tenant_id })
      .andWhere(`movement.${location_type}_id = :location_id`, { location_id })
      .andWhere('movement.product_id = :product_id', { product_id })
      .groupBy('movement.batch_id')
      .having(
        `
      SUM(CASE WHEN movement.type = 'in' THEN movement.quantity ELSE 0 END) -
      SUM(CASE WHEN movement.type = 'out' THEN movement.quantity ELSE 0 END) > 0
    `,
      )
      .getRawMany();

    return result.map((r) => ({
      batch_id: r.batch_id,
      stock: Number(r.stock),
    }));
  }

  async findAll(
    tenant_id: string,
    branch_id?: string,
    product_id?: string,
    reference_type?: ReferenceType,
  ): Promise<StockMovement[]> {
    const where: any = { tenant_id };
    if (branch_id) where.branch_id = branch_id;
    if (product_id) where.product_id = product_id;
    if (reference_type) where.reference_type = reference_type;

    return this.stockMovementRepository.find({
      where,
      relations: ['product', 'batch', 'branch'],
      order: { created_at: 'DESC' },
    });
  }

  async findByReference(
    reference_id: string,
    reference_type: ReferenceType,
  ): Promise<StockMovement[]> {
    return this.stockMovementRepository.find({
      where: { reference_id, reference_type },
      relations: ['product', 'batch'],
    });
  }
}
