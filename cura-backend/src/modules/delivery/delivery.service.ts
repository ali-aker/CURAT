import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DeliveryOrder,
  DeliveryStatus,
  DeliveryType,
} from './entities/delivery-order.entity';
import { DeliveryDriver } from './entities/delivery-driver.entity';
import { CustomersService } from '@modules/customers/customers.service';
import { StockMovementsService } from '@modules/stock-movements/stock-movements.service';
import {
  MovementType,
  ReferenceType,
} from '@modules/stock-movements/entities/stock-movement.entity';
import { CreateDeliveryOrderDto } from './dto/create-delivery-order.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(DeliveryOrder)
    private deliveryOrderRepository: Repository<DeliveryOrder>,
    @InjectRepository(DeliveryDriver)
    private deliveryDriverRepository: Repository<DeliveryDriver>,
    private customersService: CustomersService,
    private stockMovementsService: StockMovementsService,
  ) {}

  private generateDeliveryNumber(): string {
    return `DEL-${Date.now()}`;
  }

  private calculateDeliveryFee(
    invoiceAmount: number,
    deliveryFee: number,
    freeDeliveryMinAmount: number,
  ): number {
    if (freeDeliveryMinAmount > 0 && invoiceAmount >= freeDeliveryMinAmount) {
      return 0;
    }
    return deliveryFee;
  }

  // ==================== Delivery Orders ====================

  async create(
    dto: CreateDeliveryOrderDto,
    created_by: string,
  ): Promise<DeliveryOrder> {
    const invoice = await this.deliveryOrderRepository.manager
      .getRepository('SalesInvoice')
      .findOne({ where: { id: dto.sales_invoice_id } });

    if (!invoice) {
      throw new NotFoundException('الفاتورة مش موجودة');
    }

    const branch = await this.deliveryOrderRepository.manager
      .getRepository('Branch')
      .findOne({ where: { id: dto.branch_id } });

    if (!branch) {
      throw new NotFoundException('الفرع مش موجود');
    }

    if (!branch.delivery_enabled) {
      throw new BadRequestException('التوصيل مش متاح في الفرع ده');
    }

    if (
      dto.delivery_type === DeliveryType.EXTERNAL &&
      !branch.external_shipping_enabled
    ) {
      throw new BadRequestException('الشحن الخارجي مش متاح في الفرع ده');
    }

    const delivery_fee = this.calculateDeliveryFee(
      Number(invoice.net_amount),
      Number(branch.delivery_fee),
      Number(branch.free_delivery_min_amount),
    );

    const deliveryOrder = this.deliveryOrderRepository.create({
      tenant_id: dto.tenant_id,
      branch_id: dto.branch_id,
      sales_invoice_id: dto.sales_invoice_id,
      customer_id: dto.customer_id,
      delivery_number: this.generateDeliveryNumber(),
      status: DeliveryStatus.PENDING,
      delivery_type: dto.delivery_type,
      customer_name: dto.customer_name,
      customer_phone: dto.customer_phone,
      delivery_address: dto.delivery_address,
      delivery_fee,
      notes: dto.notes,
      created_by,
    });

    return this.deliveryOrderRepository.save(deliveryOrder);
  }

  async updateStatus(
    id: string,
    tenant_id: string,
    dto: UpdateDeliveryStatusDto,
    updated_by: string,
  ): Promise<DeliveryOrder> {
    const deliveryOrder = await this.findOne(id, tenant_id);

    // التحقق من الـ Status Flow
    const validTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      [DeliveryStatus.PENDING]: [
        DeliveryStatus.PROCESSING,
        DeliveryStatus.CANCELLED,
      ],
      [DeliveryStatus.PROCESSING]: [
        DeliveryStatus.PICKED_UP,
        DeliveryStatus.CANCELLED,
      ],
      [DeliveryStatus.PICKED_UP]: [
        DeliveryStatus.ON_THE_WAY,
        DeliveryStatus.CANCELLED,
      ],
      [DeliveryStatus.ON_THE_WAY]: [
        DeliveryStatus.DELIVERED,
        DeliveryStatus.CANCELLED,
      ],
      [DeliveryStatus.DELIVERED]: [],
      [DeliveryStatus.CANCELLED]: [],
    };

    if (!validTransitions[deliveryOrder.status].includes(dto.status)) {
      throw new BadRequestException(
        `لا يمكن تغيير الحالة من ${deliveryOrder.status} إلى ${dto.status}`,
      );
    }

    // لو cancelled محتاج notes
    if (dto.status === DeliveryStatus.CANCELLED && !dto.notes) {
      throw new BadRequestException('لازم تكتب سبب الإلغاء');
    }

    // لو delivered
    if (dto.status === DeliveryStatus.DELIVERED) {
      deliveryOrder.delivered_at = new Date();

      // جيب الفاتورة مع الـ items
      const invoice = await this.deliveryOrderRepository.manager
        .getRepository('SalesInvoice')
        .findOne({
          where: { id: deliveryOrder.sales_invoice_id },
          relations: ['items'],
        });

      if (invoice) {
        for (const item of invoice.items) {
          // عكس الـ RESERVED
          await this.stockMovementsService.create(
            {
              tenant_id: deliveryOrder.tenant_id,
              branch_id: deliveryOrder.branch_id,
              product_id: item.product_id,
              batch_id: item.batch_id,
              type: MovementType.IN,
              quantity: item.quantity,
              reference_type: ReferenceType.SALES_INVOICE,
              reference_id: invoice.id,
              notes: `إلغاء حجز وتأكيد توصيل ${deliveryOrder.delivery_number}`,
            },
            updated_by,
          );

          // OUT فعلي
          await this.stockMovementsService.create(
            {
              tenant_id: deliveryOrder.tenant_id,
              branch_id: deliveryOrder.branch_id,
              product_id: item.product_id,
              batch_id: item.batch_id,
              type: MovementType.OUT,
              quantity: item.quantity,
              reference_type: ReferenceType.SALES_INVOICE,
              reference_id: invoice.id,
              notes: `تأكيد توصيل ${deliveryOrder.delivery_number}`,
            },
            updated_by,
          );
        }

        // إضافة نقاط للعميل
        if (deliveryOrder.customer_id) {
          const points = Math.floor(Number(invoice.net_amount) / 10);
          if (points > 0) {
            await this.customersService.addPoints(
              deliveryOrder.customer_id,
              deliveryOrder.tenant_id,
              points,
            );
          }
        }
      }
    }

    // لو cancelled
    if (dto.status === DeliveryStatus.CANCELLED) {
      deliveryOrder.cancellation_reason = dto.notes!;
      deliveryOrder.cancelled_by = updated_by;
      deliveryOrder.cancelled_at = new Date();

      // عكس الـ RESERVED لو الفاتورة delivery
      const invoice = await this.deliveryOrderRepository.manager
        .getRepository('SalesInvoice')
        .findOne({
          where: { id: deliveryOrder.sales_invoice_id },
          relations: ['items'],
        });

      if (invoice && invoice.is_delivery) {
        for (const item of invoice.items) {
          await this.stockMovementsService.create(
            {
              tenant_id: deliveryOrder.tenant_id,
              branch_id: deliveryOrder.branch_id,
              product_id: item.product_id,
              batch_id: item.batch_id,
              type: MovementType.IN,
              quantity: item.quantity,
              reference_type: ReferenceType.ADJUSTMENT,
              reference_id: deliveryOrder.id,
              notes: `إلغاء حجز بسبب إلغاء طلب توصيل ${deliveryOrder.delivery_number} - ${dto.notes}`,
            },
            updated_by,
          );
        }
      }
    }

    deliveryOrder.status = dto.status;
    if (dto.notes && dto.status !== DeliveryStatus.CANCELLED) {
      deliveryOrder.notes = dto.notes;
    }

    return this.deliveryOrderRepository.save(deliveryOrder);
  }

  async assignDriver(
    id: string,
    tenant_id: string,
    dto: AssignDriverDto,
  ): Promise<DeliveryOrder> {
    const deliveryOrder = await this.findOne(id, tenant_id);

    if (
      deliveryOrder.status === DeliveryStatus.DELIVERED ||
      deliveryOrder.status === DeliveryStatus.CANCELLED
    ) {
      throw new BadRequestException('لا يمكن تعيين سائق لهذا الطلب');
    }

    const driver = await this.deliveryDriverRepository.findOne({
      where: { id: dto.driver_id, tenant_id, is_active: true },
    });

    if (!driver) {
      throw new NotFoundException('السائق مش موجود أو غير نشط');
    }

    deliveryOrder.driver_id = dto.driver_id;
    return this.deliveryOrderRepository.save(deliveryOrder);
  }

  async searchByPhone(tenant_id: string, phone: string): Promise<any> {
    const customer = await this.deliveryOrderRepository.manager
      .getRepository('Customer')
      .findOne({ where: { phone, tenant_id, is_active: true } });

    if (!customer) {
      return null;
    }

    return customer;
  }

  async findAll(tenant_id: string): Promise<DeliveryOrder[]> {
    return this.deliveryOrderRepository.find({
      where: { tenant_id },
      relations: ['invoice', 'customer', 'driver', 'branch'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, tenant_id: string): Promise<DeliveryOrder> {
    const deliveryOrder = await this.deliveryOrderRepository.findOne({
      where: { id, tenant_id },
      relations: ['invoice', 'customer', 'driver', 'branch'],
    });

    if (!deliveryOrder) {
      throw new NotFoundException('طلب التوصيل مش موجود');
    }

    return deliveryOrder;
  }

  // ==================== Delivery Drivers ====================

  async createDriver(data: Partial<DeliveryDriver>): Promise<DeliveryDriver> {
    const driver = this.deliveryDriverRepository.create(data);
    return this.deliveryDriverRepository.save(driver);
  }

  async findAllDrivers(
    tenant_id: string,
    branch_id?: string,
  ): Promise<DeliveryDriver[]> {
    const where: any = { tenant_id };
    if (branch_id) where.branch_id = branch_id;

    return this.deliveryDriverRepository.find({
      where,
      relations: ['branch'],
      order: { created_at: 'DESC' },
    });
  }

  async toggleDriver(id: string, tenant_id: string): Promise<DeliveryDriver> {
    const driver = await this.deliveryDriverRepository.findOne({
      where: { id, tenant_id },
    });

    if (!driver) {
      throw new NotFoundException('السائق مش موجود');
    }

    driver.is_active = !driver.is_active;
    return this.deliveryDriverRepository.save(driver);
  }
}
