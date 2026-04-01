import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesInvoicesService } from './sales-invoices.service';
import { SalesInvoicesController } from './sales-invoices.controller';
import { SalesInvoice } from './entities/sales-invoice.entity';
import { SalesInvoiceItem } from './entities/sales-invoice-item.entity';
import { Batch } from '@modules/products/entities/batch.entity';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Product } from '@modules/products/entities/product.entity';
import { StockMovementsModule } from '@modules/stock-movements/stock-movements.module';
import { OffersModule } from '@modules/offers/offers.module';
import { PromoCodesModule } from '@modules/promo-codes/promo-codes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesInvoice,
      SalesInvoiceItem,
      Batch,
      Tenant,
      Product,
    ]),
    StockMovementsModule,
    OffersModule,
    PromoCodesModule,
  ],
  controllers: [SalesInvoicesController],
  providers: [SalesInvoicesService],
  exports: [SalesInvoicesService],
})
export class SalesInvoicesModule {}
