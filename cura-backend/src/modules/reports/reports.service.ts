import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ReportFilterDto, ReportPeriod } from './dto/report-filter.dto';
import {
  SalesInvoice,
  InvoiceStatus,
} from '@modules/sales-invoices/entities/sales-invoice.entity';
import { SalesInvoiceItem } from '@modules/sales-invoices/entities/sales-invoice-item.entity';
import {
  PurchaseOrder,
  PurchaseOrderStatus,
} from '@modules/purchase-orders/entities/purchase-order.entity';
import { SalesReturn } from '@modules/returns/entities/sales-return.entity';
import { PurchaseReturn } from '@modules/returns/entities/purchase-return.entity';
import {
  DeliveryOrder,
  DeliveryStatus,
} from '@modules/delivery/entities/delivery-order.entity';
import {
  Transfer,
  TransferStatus,
} from '@modules/transfers/entities/transfer.entity';
import { StockMovement } from '@modules/stock-movements/entities/stock-movement.entity';
import { User } from '@modules/users/entities/user.entity';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Offer } from '@modules/offers/entities/offer.entity';
import { PromoCode } from '@modules/promo-codes/entities/promo-code.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(SalesInvoice)
    private salesInvoiceRepo: Repository<SalesInvoice>,
    @InjectRepository(SalesInvoiceItem)
    private salesInvoiceItemRepo: Repository<SalesInvoiceItem>,
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepo: Repository<PurchaseOrder>,
    @InjectRepository(SalesReturn)
    private salesReturnRepo: Repository<SalesReturn>,
    @InjectRepository(PurchaseReturn)
    private purchaseReturnRepo: Repository<PurchaseReturn>,
    @InjectRepository(DeliveryOrder)
    private deliveryOrderRepo: Repository<DeliveryOrder>,
    @InjectRepository(Transfer)
    private transferRepo: Repository<Transfer>,
    @InjectRepository(StockMovement)
    private stockMovementRepo: Repository<StockMovement>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
    @InjectRepository(Offer)
    private offerRepo: Repository<Offer>,
    @InjectRepository(PromoCode)
    private promoCodeRepo: Repository<PromoCode>,
  ) {}

  private getDateRange(filter: ReportFilterDto): { from: Date; to: Date } {
    const now = new Date();
    let from: Date;
    let to: Date = new Date(now.setHours(23, 59, 59, 999));

    if (filter.period === ReportPeriod.DAILY) {
      from = new Date();
      from.setHours(0, 0, 0, 0);
    } else if (filter.period === ReportPeriod.WEEKLY) {
      from = new Date();
      from.setDate(from.getDate() - 7);
      from.setHours(0, 0, 0, 0);
    } else if (filter.period === ReportPeriod.MONTHLY) {
      from = new Date();
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
    } else if (
      filter.period === ReportPeriod.CUSTOM &&
      filter.date_from &&
      filter.date_to
    ) {
      from = new Date(filter.date_from);
      to = new Date(filter.date_to);
      to.setHours(23, 59, 59, 999);
    } else {
      from = new Date();
      from.setHours(0, 0, 0, 0);
    }

    return { from, to };
  }

  // 1. تقرير المبيعات
  async getSalesReport(tenant_id: string, filter: ReportFilterDto) {
    const { from, to } = this.getDateRange(filter);
    const where: any = {
      tenant_id,
      status: InvoiceStatus.CONFIRMED,
      created_at: Between(from, to),
    };
    if (filter.branch_id) where.branch_id = filter.branch_id;

    const invoices = await this.salesInvoiceRepo.find({
      where,
      relations: ['customer', 'branch', 'items', 'items.product'],
      order: { created_at: 'DESC' },
    });

    const total_sales = invoices.reduce(
      (sum, inv) => sum + Number(inv.net_amount),
      0,
    );
    const total_discount = invoices.reduce(
      (sum, inv) => sum + Number(inv.discount_amount),
      0,
    );
    const total_invoices = invoices.length;

    return {
      total_invoices,
      total_sales,
      total_discount,
      invoices,
    };
  }

  // 2. تقرير المخزون الحالي
  async getStockReport(tenant_id: string, filter: ReportFilterDto) {
    const query = this.stockMovementRepo
      .createQueryBuilder('movement')
      .select('movement.product_id', 'product_id')
      .addSelect('movement.batch_id', 'batch_id')
      .addSelect('movement.branch_id', 'branch_id')
      .addSelect('movement.warehouse_id', 'warehouse_id')
      .addSelect(
        `SUM(CASE WHEN movement.type = 'in' THEN movement.quantity ELSE 0 END) -
         SUM(CASE WHEN movement.type = 'out' THEN movement.quantity ELSE 0 END) -
         SUM(CASE WHEN movement.type = 'reserved' THEN movement.quantity ELSE 0 END)`,
        'stock',
      )
      .where('movement.tenant_id = :tenant_id', { tenant_id })
      .groupBy('movement.product_id')
      .addGroupBy('movement.batch_id')
      .addGroupBy('movement.branch_id')
      .addGroupBy('movement.warehouse_id');

    if (filter.branch_id) {
      query.andWhere('movement.branch_id = :branch_id', {
        branch_id: filter.branch_id,
      });
    }
    if (filter.warehouse_id) {
      query.andWhere('movement.warehouse_id = :warehouse_id', {
        warehouse_id: filter.warehouse_id,
      });
    }

    const stock = await query.getRawMany();
    return stock;
  }

  // 3. تقرير المنتجات الأكثر مبيعاً
  async getTopProductsReport(tenant_id: string, filter: ReportFilterDto) {
    const { from, to } = this.getDateRange(filter);

    const result = await this.salesInvoiceItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.sales_invoice', 'invoice')
      .innerJoin('item.product', 'product')
      .select('product.id', 'product_id')
      .addSelect('product.name_ar', 'product_name')
      .addSelect('SUM(item.quantity)', 'total_quantity')
      .addSelect('SUM(item.total_price)', 'total_revenue')
      .where('invoice.tenant_id = :tenant_id', { tenant_id })
      .andWhere('invoice.status = :status', { status: InvoiceStatus.CONFIRMED })
      .andWhere('invoice.created_at BETWEEN :from AND :to', { from, to })
      .groupBy('product.id')
      .addGroupBy('product.name_ar')
      .orderBy('total_quantity', 'DESC')
      .limit(10)
      .getRawMany();

    return result;
  }

  // 4. تقرير العملاء الأكثر شراءً
  async getTopCustomersReport(tenant_id: string, filter: ReportFilterDto) {
    const { from, to } = this.getDateRange(filter);

    const result = await this.salesInvoiceRepo
      .createQueryBuilder('invoice')
      .innerJoin('invoice.customer', 'customer')
      .select('customer.id', 'customer_id')
      .addSelect('customer.name', 'customer_name')
      .addSelect('customer.phone', 'customer_phone')
      .addSelect('COUNT(invoice.id)', 'total_invoices')
      .addSelect('SUM(invoice.net_amount)', 'total_spent')
      .where('invoice.tenant_id = :tenant_id', { tenant_id })
      .andWhere('invoice.status = :status', { status: InvoiceStatus.CONFIRMED })
      .andWhere('invoice.created_at BETWEEN :from AND :to', { from, to })
      .groupBy('customer.id')
      .addGroupBy('customer.name')
      .addGroupBy('customer.phone')
      .orderBy('total_spent', 'DESC')
      .limit(10)
      .getRawMany();

    return result;
  }

  // 5. تقرير الموردين والمشتريات
  async getPurchasesReport(tenant_id: string, filter: ReportFilterDto) {
    const { from, to } = this.getDateRange(filter);

    const orders = await this.purchaseOrderRepo.find({
      where: {
        tenant_id,
        status: PurchaseOrderStatus.RECEIVED,
        created_at: Between(from, to),
      },
      relations: ['supplier', 'items', 'items.product'],
      order: { created_at: 'DESC' },
    });

    const total_purchases = orders.reduce(
      (sum, o) => sum + Number(o.total_amount),
      0,
    );

    return {
      total_orders: orders.length,
      total_purchases,
      orders,
    };
  }

  // 6. تقرير المرتجعات
  async getReturnsReport(tenant_id: string, filter: ReportFilterDto) {
    const { from, to } = this.getDateRange(filter);

    const salesReturns = await this.salesReturnRepo.find({
      where: {
        tenant_id,
        created_at: Between(from, to),
      },
      relations: ['invoice', 'items', 'items.product'],
      order: { created_at: 'DESC' },
    });

    const purchaseReturns = await this.purchaseReturnRepo.find({
      where: {
        tenant_id,
        created_at: Between(from, to),
      },
      relations: ['purchase_order', 'items', 'items.product'],
      order: { created_at: 'DESC' },
    });

    const total_sales_returns = salesReturns.reduce(
      (sum, r) => sum + Number(r.total_amount),
      0,
    );
    const total_purchase_returns = purchaseReturns.reduce(
      (sum, r) => sum + Number(r.total_amount),
      0,
    );

    return {
      sales_returns: {
        total: salesReturns.length,
        total_amount: total_sales_returns,
        items: salesReturns,
      },
      purchase_returns: {
        total: purchaseReturns.length,
        total_amount: total_purchase_returns,
        items: purchaseReturns,
      },
    };
  }

  // 7. تقرير التوصيل
  async getDeliveryReport(tenant_id: string, filter: ReportFilterDto) {
    const { from, to } = this.getDateRange(filter);
    const where: any = {
      tenant_id,
      created_at: Between(from, to),
    };
    if (filter.branch_id) where.branch_id = filter.branch_id;

    const orders = await this.deliveryOrderRepo.find({
      where,
      relations: ['driver', 'branch', 'invoice'],
      order: { created_at: 'DESC' },
    });

    const delivered = orders.filter(
      (o) => o.status === DeliveryStatus.DELIVERED,
    );
    const cancelled = orders.filter(
      (o) => o.status === DeliveryStatus.CANCELLED,
    );
    const pending = orders.filter((o) => o.status === DeliveryStatus.PENDING);

    const total_fees = delivered.reduce(
      (sum, o) => sum + Number(o.delivery_fee),
      0,
    );

    return {
      total_orders: orders.length,
      delivered: delivered.length,
      cancelled: cancelled.length,
      pending: pending.length,
      total_fees,
      orders,
    };
  }

  // 8. تقرير التحويلات
  async getTransfersReport(tenant_id: string, filter: ReportFilterDto) {
    const { from, to } = this.getDateRange(filter);

    const transfers = await this.transferRepo.find({
      where: {
        tenant_id,
        created_at: Between(from, to),
      },
      relations: ['items', 'items.product'],
      order: { created_at: 'DESC' },
    });

    const confirmed = transfers.filter(
      (t) => t.status === TransferStatus.CONFIRMED,
    );
    const cancelled = transfers.filter(
      (t) => t.status === TransferStatus.CANCELLED,
    );

    return {
      total_transfers: transfers.length,
      confirmed: confirmed.length,
      cancelled: cancelled.length,
      transfers,
    };
  }

  // 9. تقرير الأرباح والخسائر
  async getProfitReport(tenant_id: string, filter: ReportFilterDto) {
    const { from, to } = this.getDateRange(filter);

    // إجمالي المبيعات
    const salesResult = await this.salesInvoiceRepo
      .createQueryBuilder('invoice')
      .select('SUM(invoice.net_amount)', 'total_sales')
      .where('invoice.tenant_id = :tenant_id', { tenant_id })
      .andWhere('invoice.status = :status', { status: InvoiceStatus.CONFIRMED })
      .andWhere('invoice.created_at BETWEEN :from AND :to', { from, to })
      .getRawOne();

    // إجمالي تكلفة البضاعة المباعة (COGS)
    const cogsResult = await this.salesInvoiceItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.sales_invoice', 'invoice')
      .innerJoin('item.batch', 'batch')
      .select('SUM(item.quantity * batch.purchase_price)', 'total_cogs')
      .where('invoice.tenant_id = :tenant_id', { tenant_id })
      .andWhere('invoice.status = :status', { status: InvoiceStatus.CONFIRMED })
      .andWhere('invoice.created_at BETWEEN :from AND :to', { from, to })
      .getRawOne();

    // إجمالي المرتجعات
    const returnsResult = await this.salesReturnRepo
      .createQueryBuilder('return')
      .select('SUM(return.total_amount)', 'total_returns')
      .where('return.tenant_id = :tenant_id', { tenant_id })
      .andWhere('return.created_at BETWEEN :from AND :to', { from, to })
      .getRawOne();

    const total_sales = Number(salesResult?.total_sales || 0);
    const total_cogs = Number(cogsResult?.total_cogs || 0);
    const total_returns = Number(returnsResult?.total_returns || 0);
    const gross_profit = total_sales - total_cogs - total_returns;

    return {
      total_sales,
      total_cogs,
      total_returns,
      gross_profit,
    };
  }

  // 10. تقرير المستخدمين
  async getUsersReport(tenant_id: string) {
    const users = await this.userRepo.find({
      where: { tenant_id },
      select: [
        'id',
        'name',
        'email',
        'role',
        'branch_id',
        'is_active',
        'created_at',
      ],
      order: { created_at: 'DESC' },
    });

    return {
      total_users: users.length,
      active: users.filter((u) => u.is_active).length,
      inactive: users.filter((u) => !u.is_active).length,
      users,
    };
  }

  // 11. تقرير الفروع
  async getBranchesReport(tenant_id: string) {
    const branches = await this.branchRepo.find({
      where: { tenant_id },
      order: { created_at: 'DESC' },
    });

    return {
      total_branches: branches.length,
      active: branches.filter((b) => b.is_active).length,
      inactive: branches.filter((b) => !b.is_active).length,
      branches,
    };
  }

  // 12. تقرير العروض الحالية
  async getOffersReport(tenant_id: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const offers = await this.offerRepo.find({
      where: { tenant_id, is_active: true },
      relations: ['batch', 'batch.product' as any],
      order: { expiry_date: 'ASC' },
    });

    const active = offers.filter((o) => new Date(o.expiry_date) >= today);
    const expired = offers.filter((o) => new Date(o.expiry_date) < today);

    return {
      total_offers: offers.length,
      active: active.length,
      expired: expired.length,
      offers,
    };
  }

  // 13. تقرير البرومو كود
  async getPromoCodesReport(tenant_id: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const promoCodes = await this.promoCodeRepo.find({
      where: { tenant_id },
      relations: ['usages'],
      order: { created_at: 'DESC' },
    });

    const active = promoCodes.filter(
      (p) =>
        p.is_active &&
        new Date(p.expiry_date) >= today &&
        p.used_count < p.max_uses,
    );
    const expired = promoCodes.filter((p) => new Date(p.expiry_date) < today);
    const exhausted = promoCodes.filter((p) => p.used_count >= p.max_uses);

    return {
      total: promoCodes.length,
      active: active.length,
      expired: expired.length,
      exhausted: exhausted.length,
      promo_codes: promoCodes,
    };
  }

  // 14. تقرير الأصناف الراكدة
  async getSlowMovingReport(tenant_id: string, filter: ReportFilterDto) {
    const { from, to } = this.getDateRange(filter);

    // المنتجات اللي مفيهاش بيع في الفترة دي
    const soldProducts = await this.salesInvoiceItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.sales_invoice', 'invoice')
      .select('DISTINCT item.product_id', 'product_id')
      .where('invoice.tenant_id = :tenant_id', { tenant_id })
      .andWhere('invoice.status = :status', { status: InvoiceStatus.CONFIRMED })
      .andWhere('invoice.created_at BETWEEN :from AND :to', { from, to })
      .getRawMany();

    const soldProductIds = soldProducts.map((p) => p.product_id);

    // الـ batches اللي عندها stock بس مش بتتباع
    const query = this.stockMovementRepo
      .createQueryBuilder('movement')
      .select('movement.product_id', 'product_id')
      .addSelect('movement.batch_id', 'batch_id')
      .addSelect(
        `SUM(CASE WHEN movement.type = 'in' THEN movement.quantity ELSE 0 END) -
         SUM(CASE WHEN movement.type = 'out' THEN movement.quantity ELSE 0 END) -
         SUM(CASE WHEN movement.type = 'reserved' THEN movement.quantity ELSE 0 END)`,
        'stock',
      )
      .where('movement.tenant_id = :tenant_id', { tenant_id })
      .groupBy('movement.product_id')
      .addGroupBy('movement.batch_id')
      .having(
        `SUM(CASE WHEN movement.type = 'in' THEN movement.quantity ELSE 0 END) -
         SUM(CASE WHEN movement.type = 'out' THEN movement.quantity ELSE 0 END) -
         SUM(CASE WHEN movement.type = 'reserved' THEN movement.quantity ELSE 0 END) > 0`,
      );

    if (soldProductIds.length > 0) {
      query.andWhere('movement.product_id NOT IN (:...ids)', {
        ids: soldProductIds,
      });
    }

    const slowMoving = await query.getRawMany();
    return {
      total: slowMoving.length,
      items: slowMoving,
    };
  }

  // 15. تقرير التقفيل اليومي
  async getDailyClosingReport(tenant_id: string, filter: ReportFilterDto) {
    const { from, to } = this.getDateRange(filter);
    const where: any = {
      tenant_id,
      status: InvoiceStatus.CONFIRMED,
      created_at: Between(from, to),
    };
    if (filter.branch_id) where.branch_id = filter.branch_id;

    const invoices = await this.salesInvoiceRepo.find({
      where,
      relations: ['items'],
    });

    // المبيعات حسب طريقة الدفع
    const cash_sales = invoices
      .filter((i) => i.payment_method === 'cash')
      .reduce((sum, i) => sum + Number(i.net_amount) + Number(i.tax_amount), 0);

    const card_sales = invoices
      .filter((i) => i.payment_method === 'card')
      .reduce((sum, i) => sum + Number(i.net_amount) + Number(i.tax_amount), 0);

    const mixed_sales = invoices
      .filter((i) => i.payment_method === 'mixed')
      .reduce((sum, i) => sum + Number(i.net_amount) + Number(i.tax_amount), 0);

    // المبيعات العادية vs التوصيل
    const delivery_sales = invoices
      .filter((i) => i.is_delivery)
      .reduce((sum, i) => sum + Number(i.net_amount) + Number(i.tax_amount), 0);

    const regular_sales = invoices
      .filter((i) => !i.is_delivery)
      .reduce((sum, i) => sum + Number(i.net_amount) + Number(i.tax_amount), 0);

    // الإجماليات
    const total_before_discount = invoices.reduce(
      (sum, i) => sum + Number(i.total_amount),
      0,
    );
    const total_discount = invoices.reduce(
      (sum, i) => sum + Number(i.discount_amount),
      0,
    );
    const total_tax = invoices.reduce(
      (sum, i) => sum + Number(i.tax_amount),
      0,
    );
    const total_net = invoices.reduce(
      (sum, i) => sum + Number(i.net_amount),
      0,
    );
    const total_with_tax = total_net + total_tax;

    // المرتجعات في نفس الفترة
    const returns = await this.salesReturnRepo.find({
      where: { tenant_id, created_at: Between(from, to) },
    });
    const total_returns = returns.reduce(
      (sum, r) => sum + Number(r.total_amount),
      0,
    );

    // صافي الصندوق
    const net_cash = total_with_tax - total_returns;

    return {
      period: { from, to },
      invoices_count: invoices.length,
      payment_methods: {
        cash: cash_sales,
        card: card_sales,
        mixed: mixed_sales,
      },
      sales_types: {
        regular: regular_sales,
        delivery: delivery_sales,
      },
      totals: {
        before_discount: total_before_discount,
        total_discount,
        after_discount: total_net,
        total_tax,
        total_with_tax,
      },
      returns: {
        count: returns.length,
        total_amount: total_returns,
      },
      net_cash,
    };
  }

  // 16. تقرير الأصناف المنتهية والقريبة من الانتهاء
  async getExpiryReport(tenant_id: string, days_ahead: number = 30) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const future = new Date();
    future.setDate(future.getDate() + days_ahead);
    future.setHours(23, 59, 59, 999);

    // الأصناف المنتهية
    const expired = await this.stockMovementRepo
      .createQueryBuilder('movement')
      .innerJoin('movement.batch', 'batch')
      .innerJoin('batch.product', 'product')
      .select('batch.id', 'batch_id')
      .addSelect('batch.lot_number', 'lot_number')
      .addSelect('batch.expiry_date', 'expiry_date')
      .addSelect('product.id', 'product_id')
      .addSelect('product.name_ar', 'product_name')
      .addSelect('product.barcode', 'barcode')
      .addSelect(
        `SUM(CASE WHEN movement.type = 'in' THEN movement.quantity ELSE 0 END) -
         SUM(CASE WHEN movement.type = 'out' THEN movement.quantity ELSE 0 END) -
         SUM(CASE WHEN movement.type = 'reserved' THEN movement.quantity ELSE 0 END)`,
        'stock',
      )
      .where('movement.tenant_id = :tenant_id', { tenant_id })
      .andWhere('batch.expiry_date < :today', { today })
      .groupBy('batch.id')
      .addGroupBy('batch.lot_number')
      .addGroupBy('batch.expiry_date')
      .addGroupBy('product.id')
      .addGroupBy('product.name_ar')
      .addGroupBy('product.barcode')
      .having(
        `SUM(CASE WHEN movement.type = 'in' THEN movement.quantity ELSE 0 END) -
         SUM(CASE WHEN movement.type = 'out' THEN movement.quantity ELSE 0 END) -
         SUM(CASE WHEN movement.type = 'reserved' THEN movement.quantity ELSE 0 END) > 0`,
      )
      .getRawMany();

    // الأصناف القريبة من الانتهاء
    const near_expiry = await this.stockMovementRepo
      .createQueryBuilder('movement')
      .innerJoin('movement.batch', 'batch')
      .innerJoin('batch.product', 'product')
      .select('batch.id', 'batch_id')
      .addSelect('batch.lot_number', 'lot_number')
      .addSelect('batch.expiry_date', 'expiry_date')
      .addSelect('product.id', 'product_id')
      .addSelect('product.name_ar', 'product_name')
      .addSelect('product.barcode', 'barcode')
      .addSelect(
        `SUM(CASE WHEN movement.type = 'in' THEN movement.quantity ELSE 0 END) -
         SUM(CASE WHEN movement.type = 'out' THEN movement.quantity ELSE 0 END) -
         SUM(CASE WHEN movement.type = 'reserved' THEN movement.quantity ELSE 0 END)`,
        'stock',
      )
      .where('movement.tenant_id = :tenant_id', { tenant_id })
      .andWhere('batch.expiry_date BETWEEN :today AND :future', {
        today,
        future,
      })
      .groupBy('batch.id')
      .addGroupBy('batch.lot_number')
      .addGroupBy('batch.expiry_date')
      .addGroupBy('product.id')
      .addGroupBy('product.name_ar')
      .addGroupBy('product.barcode')
      .having(
        `SUM(CASE WHEN movement.type = 'in' THEN movement.quantity ELSE 0 END) -
         SUM(CASE WHEN movement.type = 'out' THEN movement.quantity ELSE 0 END) -
         SUM(CASE WHEN movement.type = 'reserved' THEN movement.quantity ELSE 0 END) > 0`,
      )
      .getRawMany();

    return {
      expired: {
        count: expired.length,
        items: expired,
      },
      near_expiry: {
        count: near_expiry.length,
        days_ahead,
        items: near_expiry,
      },
    };
  }
}
