import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SalesInvoice,
  InvoiceStatus,
  DiscountType,
} from './entities/sales-invoice.entity';
import { SalesInvoiceItem } from './entities/sales-invoice-item.entity';
import { StockMovementsService } from '@modules/stock-movements/stock-movements.service';
import {
  MovementType,
  ReferenceType,
} from '@modules/stock-movements/entities/stock-movement.entity';
import { OffersService } from '@modules/offers/offers.service';
import { OfferType } from '@modules/offers/entities/offer.entity';
import { PromoCodesService } from '@modules/promo-codes/promo-codes.service';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Product } from '@modules/products/entities/product.entity';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';
import { UpdateSalesInvoiceDto } from './dto/update-sales-invoice.dto';
import { ConfirmSalesInvoiceDto } from './dto/confirm-sales-invoice.dto';

@Injectable()
export class SalesInvoicesService {
  constructor(
    @InjectRepository(SalesInvoice)
    private salesInvoiceRepository: Repository<SalesInvoice>,
    @InjectRepository(SalesInvoiceItem)
    private salesInvoiceItemRepository: Repository<SalesInvoiceItem>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private stockMovementsService: StockMovementsService,
    private offersService: OffersService,
    private promoCodesService: PromoCodesService,
  ) {}

  private generateInvoiceNumber(total: number): string {
    return `DRAFT-${total.toFixed(2)}`;
  }

  private generateConfirmedNumber(): string {
    return `INV-${Date.now()}`;
  }

  private calculateItemDiscount(
    unit_price: number,
    quantity: number,
    discount_value: number,
    discount_type?: DiscountType,
  ): { discount_amount: number; total_price: number } {
    let discount_amount = 0;
    const subtotal = unit_price * quantity;

    if (discount_value && discount_type) {
      if (discount_type === DiscountType.PERCENTAGE) {
        discount_amount = (subtotal * discount_value) / 100;
      } else {
        discount_amount = discount_value;
      }
    }

    return {
      discount_amount,
      total_price: subtotal - discount_amount,
    };
  }

  private calculateInvoiceDiscount(
    total: number,
    discount_value: number,
    discount_type?: DiscountType,
  ): { discount_amount: number; net_amount: number } {
    let discount_amount = 0;

    if (discount_value && discount_type) {
      if (discount_type === DiscountType.PERCENTAGE) {
        discount_amount = (total * discount_value) / 100;
      } else {
        discount_amount = discount_value;
      }
    }

    return {
      discount_amount,
      net_amount: total - discount_amount,
    };
  }

  async create(
    dto: CreateSalesInvoiceDto,
    cashier_id: string,
  ): Promise<SalesInvoice> {
    // جيب الـ tax_rate من الـ tenant
    const tenant = await this.tenantRepository.findOne({
      where: { id: dto.tenant_id },
    });
    const tax_rate = Number(tenant?.tax_rate || 0);

    const items: SalesInvoiceItem[] = [];

    for (const item of dto.items) {
      const offer = await this.offersService.findActiveOfferForBatch(
        dto.tenant_id,
        item.batch_id,
      );

      let discount_value = item.discount_value || 0;
      let discount_type = item.discount_type;
      let discount_amount = 0;
      let total_price = 0;
      const subtotal = item.unit_price * item.quantity;

      if (offer) {
        if (offer.type === OfferType.PERCENTAGE) {
          discount_amount = (subtotal * Number(offer.discount_value)) / 100;
          if (offer.max_discount_amount) {
            discount_amount = Math.min(
              discount_amount,
              Number(offer.max_discount_amount),
            );
          }
          discount_value = Number(offer.discount_value);
          discount_type = DiscountType.PERCENTAGE;
          total_price = subtotal - discount_amount;
        } else if (offer.type === OfferType.FIXED) {
          discount_amount = Math.min(Number(offer.discount_value), subtotal);
          discount_value = Number(offer.discount_value);
          discount_type = DiscountType.FIXED;
          total_price = subtotal - discount_amount;
        } else if (offer.type === OfferType.BUY_X_GET_Y) {
          const times = Math.floor(
            item.quantity / (offer.buy_quantity + offer.free_quantity),
          );
          const free_qty = times * offer.free_quantity;
          const paid_qty = item.quantity - free_qty;

          discount_amount = free_qty * item.unit_price;
          discount_value = 0;
          discount_type = undefined;
          total_price = paid_qty * item.unit_price;

          if (
            offer.free_batch_id &&
            offer.free_batch_id !== item.batch_id &&
            free_qty > 0
          ) {
            const freeItem = this.salesInvoiceItemRepository.create({
              product_id: offer.free_batch?.product_id || item.product_id,
              batch_id: offer.free_batch_id,
              quantity: free_qty,
              unit_price: 0,
              discount_value: 0,
              discount_amount: 0,
              total_price: 0,
            });
            items.push(freeItem);
            discount_amount = 0;
            total_price = subtotal;
          }
        }
      } else {
        const calculated = this.calculateItemDiscount(
          item.unit_price,
          item.quantity,
          discount_value,
          discount_type,
        );
        discount_amount = calculated.discount_amount;
        total_price = calculated.total_price;
      }

      const invoiceItem = this.salesInvoiceItemRepository.create({
        ...item,
        discount_value,
        discount_type,
        discount_amount,
        total_price,
      });
      items.push(invoiceItem);
    }

    // حساب الإجمالي
    const total_amount = items.reduce(
      (sum, item) => sum + Number(item.total_price),
      0,
    );

    // تطبيق الـ promo code
    let promo_discount = 0;
    let promo_code_id: string | undefined;

    if (dto.promo_code && dto.customer_id) {
      const itemsWithoutOffer = await Promise.all(
        dto.items.map(async (item) => {
          const offer = await this.offersService.findActiveOfferForBatch(
            dto.tenant_id,
            item.batch_id,
          );
          return offer ? 0 : item.unit_price * item.quantity;
        }),
      );
      const amountWithoutOffer = itemsWithoutOffer.reduce(
        (sum, a) => sum + a,
        0,
      );

      if (amountWithoutOffer > 0) {
        const { promoCode, discount_amount } =
          await this.promoCodesService.validate(dto.tenant_id, {
            code: dto.promo_code,
            amount: amountWithoutOffer,
            customer_id: dto.customer_id,
          });
        promo_discount = discount_amount;
        promo_code_id = promoCode.id;
      }
    }

    // حساب خصم الفاتورة
    const { discount_amount, net_amount } = this.calculateInvoiceDiscount(
      total_amount,
      dto.discount_value || 0,
      dto.discount_type,
    );

    const after_discount = net_amount - promo_discount;

    // حساب الضريبة على الأصناف الخاضعة للضريبة فقط
    let tax_amount = 0;
    if (tax_rate > 0) {
      for (const item of dto.items) {
        const product = await this.productRepository.findOne({
          where: { id: item.product_id },
        });
        if (product?.is_taxable) {
          const itemTotal = item.unit_price * item.quantity;
          tax_amount += (itemTotal * tax_rate) / 100;
        }
      }
    }

    const final_net = after_discount + tax_amount;

    const invoice = this.salesInvoiceRepository.create({
      ...dto,
      cashier_id,
      status: InvoiceStatus.DRAFT,
      invoice_number: this.generateInvoiceNumber(final_net),
      total_amount,
      discount_amount: discount_amount + promo_discount,
      net_amount: after_discount,
      tax_amount,
      paid_amount: 0,
      change_amount: 0,
      promo_code_id,
      items,
    });

    return this.salesInvoiceRepository.save(invoice);
  }

  async findAll(
    tenant_id: string,
    status?: InvoiceStatus,
  ): Promise<SalesInvoice[]> {
    const where: any = { tenant_id };
    if (status) where.status = status;

    return this.salesInvoiceRepository.find({
      where,
      relations: [
        'customer',
        'branch',
        'items',
        'items.product',
        'items.batch',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, tenant_id: string): Promise<SalesInvoice> {
    const invoice = await this.salesInvoiceRepository.findOne({
      where: { id, tenant_id },
      relations: [
        'customer',
        'branch',
        'items',
        'items.product',
        'items.batch',
      ],
    });
    if (!invoice) throw new NotFoundException('الفاتورة غير موجودة');
    return invoice;
  }

  async findByNumber(
    tenant_id: string,
    invoice_number: string,
  ): Promise<SalesInvoice> {
    const invoice = await this.salesInvoiceRepository.findOne({
      where: { invoice_number, tenant_id },
      relations: [
        'customer',
        'branch',
        'items',
        'items.product',
        'items.batch',
      ],
    });
    if (!invoice) throw new NotFoundException('الفاتورة غير موجودة');
    return invoice;
  }

  async update(
    id: string,
    tenant_id: string,
    dto: UpdateSalesInvoiceDto,
  ): Promise<SalesInvoice> {
    const invoice = await this.findOne(id, tenant_id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('لا يمكن تعديل فاتورة مؤكدة أو ملغية');
    }

    if (dto.items) {
      const items = dto.items.map((item) => {
        const { discount_amount, total_price } = this.calculateItemDiscount(
          item.unit_price,
          item.quantity,
          item.discount_value || 0,
          item.discount_type,
        );

        return this.salesInvoiceItemRepository.create({
          ...item,
          discount_amount,
          total_price,
        });
      });

      const total_amount = items.reduce(
        (sum, item) => sum + Number(item.total_price),
        0,
      );
      const { discount_amount, net_amount } = this.calculateInvoiceDiscount(
        total_amount,
        dto.discount_value || 0,
        dto.discount_type,
      );

      invoice.items = items;
      invoice.total_amount = total_amount;
      invoice.discount_amount = discount_amount;
      invoice.net_amount = net_amount;
      invoice.invoice_number = this.generateInvoiceNumber(net_amount);
    }

    Object.assign(invoice, dto);
    return this.salesInvoiceRepository.save(invoice);
  }

  async confirm(
    id: string,
    tenant_id: string,
    dto: ConfirmSalesInvoiceDto,
  ): Promise<SalesInvoice> {
    const invoice = await this.findOne(id, tenant_id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('الفاتورة مش في حالة Draft');
    }

    for (const item of invoice.items) {
      const stock = await this.stockMovementsService.getStock(
        invoice.tenant_id,
        invoice.branch_id,
        item.product_id,
        item.batch_id,
        'branch',
      );

      if (stock < item.quantity) {
        throw new BadRequestException(
          `الكمية المطلوبة غير متوفرة للمنتج ${item.product?.name_ar || item.product_id}`,
        );
      }
    }

    // حساب الباقي (بيشمل الـ tax_amount)
    const total_due = Number(invoice.net_amount) + Number(invoice.tax_amount);
    const change_amount = dto.paid_amount - total_due;
    if (change_amount < 0) {
      throw new BadRequestException('المبلغ المدفوع أقل من إجمالي الفاتورة');
    }

    for (const item of invoice.items) {
      await this.stockMovementsService.create(
        {
          tenant_id: invoice.tenant_id,
          branch_id: invoice.branch_id,
          product_id: item.product_id,
          batch_id: item.batch_id,
          type: invoice.is_delivery ? MovementType.RESERVED : MovementType.OUT,
          quantity: item.quantity,
          reference_type: ReferenceType.SALES_INVOICE,
          reference_id: invoice.id,
          notes: invoice.is_delivery
            ? `حجز مخزون لفاتورة توصيل ${invoice.invoice_number}`
            : `بيع فاتورة ${invoice.invoice_number}`,
        },
        invoice.cashier_id,
      );
    }

    if (invoice.promo_code_id && invoice.customer_id) {
      await this.promoCodesService.applyUsage(
        invoice.promo_code_id,
        invoice.customer_id,
        invoice.id,
      );
    }

    invoice.status = InvoiceStatus.CONFIRMED;
    invoice.invoice_number = this.generateConfirmedNumber();
    invoice.payment_method = dto.payment_method;
    invoice.paid_amount = dto.paid_amount;
    invoice.change_amount = change_amount;
    invoice.points_redeemed = dto.points_redeemed || 0;

    return this.salesInvoiceRepository.save(invoice);
  }

  async cancel(id: string, tenant_id: string): Promise<SalesInvoice> {
    const invoice = await this.findOne(id, tenant_id);

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('الفاتورة ملغية بالفعل');
    }

    invoice.status = InvoiceStatus.CANCELLED;
    return this.salesInvoiceRepository.save(invoice);
  }

  async findDrafts(
    tenant_id: string,
    branch_id: string,
  ): Promise<SalesInvoice[]> {
    return this.salesInvoiceRepository.find({
      where: { tenant_id, branch_id, status: InvoiceStatus.DRAFT },
      relations: ['customer', 'items', 'items.product', 'items.batch'],
      order: { updated_at: 'DESC' },
    });
  }

  async softDelete(id: string, tenant_id: string): Promise<void> {
    const invoice = await this.findOne(id, tenant_id);
    if (invoice.status === InvoiceStatus.CONFIRMED) {
      throw new BadRequestException('لا يمكن حذف فاتورة مؤكدة');
    }
    await this.salesInvoiceRepository.softRemove(invoice);
  }
}
