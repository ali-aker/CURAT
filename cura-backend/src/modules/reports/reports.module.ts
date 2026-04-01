import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { SalesInvoice } from '@modules/sales-invoices/entities/sales-invoice.entity';
import { SalesInvoiceItem } from '@modules/sales-invoices/entities/sales-invoice-item.entity';
import { PurchaseOrder } from '@modules/purchase-orders/entities/purchase-order.entity';
import { SalesReturn } from '@modules/returns/entities/sales-return.entity';
import { PurchaseReturn } from '@modules/returns/entities/purchase-return.entity';
import { DeliveryOrder } from '@modules/delivery/entities/delivery-order.entity';
import { Transfer } from '@modules/transfers/entities/transfer.entity';
import { StockMovement } from '@modules/stock-movements/entities/stock-movement.entity';
import { User } from '@modules/users/entities/user.entity';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Offer } from '@modules/offers/entities/offer.entity';
import { PromoCode } from '@modules/promo-codes/entities/promo-code.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesInvoice,
      SalesInvoiceItem,
      PurchaseOrder,
      SalesReturn,
      PurchaseReturn,
      DeliveryOrder,
      Transfer,
      StockMovement,
      User,
      Branch,
      Offer,
      PromoCode,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
