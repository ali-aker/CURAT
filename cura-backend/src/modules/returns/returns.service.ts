import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SalesReturn,
  ReturnStatus,
  RefundMethod,
} from './entities/sales-return.entity';
import { SalesReturnItem } from './entities/sales-return-item.entity';
import { PurchaseReturn } from './entities/purchase-return.entity';
import { PurchaseReturnItem } from './entities/purchase-return-item.entity';
import { StockMovementsService } from '@modules/stock-movements/stock-movements.service';
import {
  MovementType,
  ReferenceType,
} from '@modules/stock-movements/entities/stock-movement.entity';
import { TenantsService } from '@modules/tenants/tenants.service';
import { CustomersService } from '@modules/customers/customers.service';
import { CreateSalesReturnDto } from './dto/create-sales-return.dto';
import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto';
import { ConfirmReturnDto } from './dto/confirm-return.dto';
import { CancelReturnDto } from './dto/cancel-return.dto';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(SalesReturn)
    private salesReturnRepository: Repository<SalesReturn>,
    @InjectRepository(SalesReturnItem)
    private salesReturnItemRepository: Repository<SalesReturnItem>,
    @InjectRepository(PurchaseReturn)
    private purchaseReturnRepository: Repository<PurchaseReturn>,
    @InjectRepository(PurchaseReturnItem)
    private purchaseReturnItemRepository: Repository<PurchaseReturnItem>,
    private stockMovementsService: StockMovementsService,
    private tenantsService: TenantsService,
    private customersService: CustomersService,
  ) {}

  private generateReturnNumber(prefix: string): string {
    return `${prefix}-${Date.now()}`;
  }

  // ==================== Sales Returns ====================

  async createSalesReturn(
    dto: CreateSalesReturnDto,
    created_by: string,
  ): Promise<SalesReturn> {
    // التحقق من فترة المرتجع
    const tenant = await this.tenantsService.findOne(dto.tenant_id);
    const invoice = await this.salesReturnRepository.manager
      .getRepository('SalesInvoice')
      .findOne({ where: { id: dto.sales_invoice_id } });

    if (!invoice) {
      throw new NotFoundException('الفاتورة مش موجودة');
    }

    const returnDays = tenant.sales_return_days ?? 7;
    const invoiceDate = new Date(invoice.created_at);
    const diffDays = Math.floor(
      (Date.now() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays > returnDays) {
      throw new BadRequestException(
        `انتهت فترة المرتجع المسموحة (${returnDays} أيام)`,
      );
    }

    // التحقق من الـ refund amounts
    const total_amount = dto.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    );

    if (dto.refund_method === RefundMethod.BOTH) {
      const totalRefund = (dto.cash_amount ?? 0) + (dto.credit_amount ?? 0);
      if (totalRefund !== total_amount) {
        throw new BadRequestException(
          'مجموع الكاش والكريدت لازم يساوي إجمالي المرتجع',
        );
      }
    }

    const salesReturn = this.salesReturnRepository.create({
      tenant_id: dto.tenant_id,
      branch_id: dto.branch_id,
      customer_id: dto.customer_id,
      sales_invoice_id: dto.sales_invoice_id,
      return_number: this.generateReturnNumber('SR'),
      status: ReturnStatus.PENDING,
      refund_method: dto.refund_method,
      total_amount,
      cash_amount:
        dto.refund_method === RefundMethod.CREDIT
          ? 0
          : (dto.cash_amount ?? total_amount),
      credit_amount:
        dto.refund_method === RefundMethod.CASH
          ? 0
          : (dto.credit_amount ??
            (dto.refund_method === RefundMethod.CREDIT ? total_amount : 0)),
      notes: dto.notes,
      created_by,
      items: dto.items.map((item) =>
        this.salesReturnItemRepository.create({
          product_id: item.product_id,
          batch_id: item.batch_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity,
        }),
      ),
    });

    return this.salesReturnRepository.save(salesReturn);
  }

  async confirmSalesReturn(
    id: string,
    tenant_id: string,
    dto: ConfirmReturnDto,
    confirmed_by: string,
  ): Promise<SalesReturn> {
    const salesReturn = await this.findOneSalesReturn(id, tenant_id);

    if (salesReturn.status !== ReturnStatus.PENDING) {
      throw new BadRequestException('المرتجع مش في حالة pending');
    }

    // تسجيل Stock Movement IN للفرع
    for (const item of salesReturn.items) {
      await this.stockMovementsService.create(
        {
          tenant_id: salesReturn.tenant_id,
          branch_id: salesReturn.branch_id,
          product_id: item.product_id,
          batch_id: item.batch_id,
          type: MovementType.IN,
          quantity: item.quantity,
          reference_type: ReferenceType.RETURN_SALES,
          reference_id: salesReturn.id,
          notes: `مرتجع مبيعات ${salesReturn.return_number}`,
        },
        confirmed_by,
      );
    }

    // إضافة credit للعميل لو في credit
    if (salesReturn.customer_id && salesReturn.credit_amount > 0) {
      await this.customersService.addCredit(
        salesReturn.customer_id,
        salesReturn.tenant_id,
        salesReturn.credit_amount,
      );
    }

    salesReturn.status = ReturnStatus.CONFIRMED;
    if (dto.notes) salesReturn.notes = dto.notes;

    return this.salesReturnRepository.save(salesReturn);
  }

  async cancelSalesReturn(
    id: string,
    tenant_id: string,
    dto: CancelReturnDto,
    cancelled_by: string,
  ): Promise<SalesReturn> {
    const salesReturn = await this.findOneSalesReturn(id, tenant_id);

    if (salesReturn.status === ReturnStatus.CANCELLED) {
      throw new BadRequestException('المرتجع ملغي بالفعل');
    }

    if (salesReturn.status === ReturnStatus.CONFIRMED) {
      throw new BadRequestException('لا يمكن إلغاء مرتجع تم تأكيده بالفعل');
    }

    salesReturn.status = ReturnStatus.CANCELLED;
    salesReturn.cancellation_reason = dto.cancellation_reason;
    salesReturn.cancelled_by = cancelled_by;
    salesReturn.cancelled_at = new Date();

    return this.salesReturnRepository.save(salesReturn);
  }

  async findAllSalesReturns(tenant_id: string): Promise<SalesReturn[]> {
    return this.salesReturnRepository.find({
      where: { tenant_id },
      relations: [
        'items',
        'items.product',
        'items.batch',
        'customer',
        'branch',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findOneSalesReturn(
    id: string,
    tenant_id: string,
  ): Promise<SalesReturn> {
    const salesReturn = await this.salesReturnRepository.findOne({
      where: { id, tenant_id },
      relations: [
        'items',
        'items.product',
        'items.batch',
        'customer',
        'branch',
      ],
    });

    if (!salesReturn) {
      throw new NotFoundException('المرتجع مش موجود');
    }

    return salesReturn;
  }

  // ==================== Purchase Returns ====================

  async createPurchaseReturn(
    dto: CreatePurchaseReturnDto,
    created_by: string,
  ): Promise<PurchaseReturn> {
    const total_amount = dto.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    );

    const purchaseReturn = this.purchaseReturnRepository.create({
      tenant_id: dto.tenant_id,
      warehouse_id: dto.warehouse_id,
      supplier_id: dto.supplier_id,
      purchase_order_id: dto.purchase_order_id,
      return_number: this.generateReturnNumber('PR'),
      status: ReturnStatus.PENDING,
      total_amount,
      refund_amount: dto.refund_amount ?? 0,
      notes: dto.notes,
      created_by,
      items: dto.items.map((item) =>
        this.purchaseReturnItemRepository.create({
          product_id: item.product_id,
          batch_id: item.batch_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity,
        }),
      ),
    });

    return this.purchaseReturnRepository.save(purchaseReturn);
  }

  async confirmPurchaseReturn(
    id: string,
    tenant_id: string,
    dto: ConfirmReturnDto,
    confirmed_by: string,
  ): Promise<PurchaseReturn> {
    const purchaseReturn = await this.findOnePurchaseReturn(id, tenant_id);

    if (purchaseReturn.status !== ReturnStatus.PENDING) {
      throw new BadRequestException('المرتجع مش في حالة pending');
    }

    // تسجيل Stock Movement OUT من المستودع
    for (const item of purchaseReturn.items) {
      await this.stockMovementsService.create(
        {
          tenant_id: purchaseReturn.tenant_id,
          warehouse_id: purchaseReturn.warehouse_id,
          product_id: item.product_id,
          batch_id: item.batch_id,
          type: MovementType.OUT,
          quantity: item.quantity,
          reference_type: ReferenceType.RETURN_PURCHASE,
          reference_id: purchaseReturn.id,
          notes: `مرتجع مشتريات ${purchaseReturn.return_number}`,
        },
        confirmed_by,
      );
    }

    purchaseReturn.status = ReturnStatus.CONFIRMED;
    if (dto.notes) purchaseReturn.notes = dto.notes;

    return this.purchaseReturnRepository.save(purchaseReturn);
  }

  async cancelPurchaseReturn(
    id: string,
    tenant_id: string,
    dto: CancelReturnDto,
    cancelled_by: string,
  ): Promise<PurchaseReturn> {
    const purchaseReturn = await this.findOnePurchaseReturn(id, tenant_id);

    if (purchaseReturn.status === ReturnStatus.CANCELLED) {
      throw new BadRequestException('المرتجع ملغي بالفعل');
    }

    if (purchaseReturn.status === ReturnStatus.CONFIRMED) {
      throw new BadRequestException('لا يمكن إلغاء مرتجع تم تأكيده بالفعل');
    }

    purchaseReturn.status = ReturnStatus.CANCELLED;
    purchaseReturn.cancellation_reason = dto.cancellation_reason;
    purchaseReturn.cancelled_by = cancelled_by;
    purchaseReturn.cancelled_at = new Date();

    return this.purchaseReturnRepository.save(purchaseReturn);
  }

  async findAllPurchaseReturns(tenant_id: string): Promise<PurchaseReturn[]> {
    return this.purchaseReturnRepository.find({
      where: { tenant_id },
      relations: [
        'items',
        'items.product',
        'items.batch',
        'supplier',
        'warehouse',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findOnePurchaseReturn(
    id: string,
    tenant_id: string,
  ): Promise<PurchaseReturn> {
    const purchaseReturn = await this.purchaseReturnRepository.findOne({
      where: { id, tenant_id },
      relations: [
        'items',
        'items.product',
        'items.batch',
        'supplier',
        'warehouse',
      ],
    });

    if (!purchaseReturn) {
      throw new NotFoundException('المرتجع مش موجود');
    }

    return purchaseReturn;
  }
}
