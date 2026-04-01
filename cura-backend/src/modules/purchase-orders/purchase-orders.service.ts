import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PurchaseOrder,
  PurchaseOrderStatus,
} from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Batch } from '@modules/products/entities/batch.entity';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Product } from '@modules/products/entities/product.entity';
import { StockMovementsService } from '@modules/stock-movements/stock-movements.service';
import {
  MovementType,
  ReferenceType,
} from '@modules/stock-movements/entities/stock-movement.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private stockMovementsService: StockMovementsService,
  ) {}

  private generateOrderNumber(): string {
    const date = new Date();
    const timestamp = date.getTime();
    return `PO-${timestamp}`;
  }

  async create(
    dto: CreatePurchaseOrderDto,
    created_by: string,
  ): Promise<PurchaseOrder> {
    // جيب الـ tax_rate من الـ tenant
    const tenant = await this.tenantRepository.findOne({
      where: { id: dto.tenant_id },
    });
    const tax_rate = Number(tenant?.tax_rate || 0);

    // حساب الإجمالي
    const total_amount = dto.items.reduce(
      (sum, item) => sum + item.purchase_price * item.quantity,
      0,
    );

    // حساب الضريبة على الأصناف الخاضعة للضريبة فقط
    let tax_amount = 0;
    if (tax_rate > 0) {
      for (const item of dto.items) {
        const product = await this.productRepository.findOne({
          where: { id: item.product_id },
        });
        if (product?.is_taxable) {
          const itemTotal = item.purchase_price * item.quantity;
          tax_amount += (itemTotal * tax_rate) / 100;
        }
      }
    }

    // إنشاء الطلب
    const order = this.purchaseOrderRepository.create({
      ...dto,
      order_number: this.generateOrderNumber(),
      total_amount,
      tax_amount,
      created_by,
      status: PurchaseOrderStatus.PENDING,
    });

    // إنشاء الـ Items
    order.items = dto.items.map((item) =>
      this.purchaseOrderItemRepository.create({
        ...item,
        total_price: item.purchase_price * item.quantity,
      }),
    );

    return this.purchaseOrderRepository.save(order);
  }

  async findAll(tenant_id: string): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.find({
      where: { tenant_id },
      relations: ['supplier', 'warehouse', 'items', 'items.product'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, tenant_id: string): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findOne({
      where: { id, tenant_id },
      relations: ['supplier', 'warehouse', 'items', 'items.product'],
    });
    if (!order) throw new NotFoundException('طلب الشراء غير موجود');
    return order;
  }

  async update(
    id: string,
    tenant_id: string,
    dto: UpdatePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    const order = await this.findOne(id, tenant_id);
    if (order.status !== PurchaseOrderStatus.PENDING) {
      throw new BadRequestException('لا يمكن تعديل طلب تم استلامه أو إلغاؤه');
    }
    Object.assign(order, dto);
    return this.purchaseOrderRepository.save(order);
  }

  async receive(
    id: string,
    tenant_id: string,
    dto: ReceivePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    const order = await this.findOne(id, tenant_id);

    if (order.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException('لا يمكن استلام طلب ملغي');
    }

    if (order.status === PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException('تم استلام هذا الطلب بالفعل');
    }

    for (const item_id of dto.item_ids) {
      const item = order.items.find((i) => i.id === item_id);
      if (!item) continue;

      // إنشاء الباتش
      const batch = await this.batchRepository.save(
        this.batchRepository.create({
          product_id: item.product_id,
          warehouse_id: order.warehouse_id,
          lot_number: item.lot_number,
          manufacture_date: item.manufacture_date,
          expiry_date: item.expiry_date,
          purchase_price: item.purchase_price,
          selling_price: item.selling_price,
          is_active: true,
        }),
      );

      // تسجيل Stock Movement IN
      await this.stockMovementsService.create(
        {
          tenant_id: order.tenant_id,
          warehouse_id: order.warehouse_id,
          product_id: item.product_id,
          batch_id: batch.id,
          type: MovementType.IN,
          quantity: item.quantity,
          reference_type: ReferenceType.PURCHASE_ORDER,
          reference_id: order.id,
          notes: `استلام طلب شراء ${order.order_number}`,
        },
        order.created_by,
      );
    }

    const allReceived = dto.item_ids.length === order.items.length;
    order.status = allReceived
      ? PurchaseOrderStatus.RECEIVED
      : PurchaseOrderStatus.PARTIAL;

    return this.purchaseOrderRepository.save(order);
  }

  async cancel(id: string, tenant_id: string): Promise<PurchaseOrder> {
    const order = await this.findOne(id, tenant_id);

    if (order.status === PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException('لا يمكن إلغاء طلب تم استلامه بالفعل');
    }

    order.status = PurchaseOrderStatus.CANCELLED;
    return this.purchaseOrderRepository.save(order);
  }

  async softDelete(id: string, tenant_id: string): Promise<void> {
    const order = await this.findOne(id, tenant_id);
    await this.purchaseOrderRepository.softRemove(order);
  }
}
