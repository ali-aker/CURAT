import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Batch } from '@modules/products/entities/batch.entity';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Product } from '@modules/products/entities/product.entity';
import { StockMovementsModule } from '@modules/stock-movements/stock-movements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchaseOrder,
      PurchaseOrderItem,
      Batch,
      Tenant,
      Product,
    ]),
    StockMovementsModule,
  ],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
