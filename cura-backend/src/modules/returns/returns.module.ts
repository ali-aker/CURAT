import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnsService } from './returns.service';
import { ReturnsController } from './returns.controller';
import { SalesReturn } from './entities/sales-return.entity';
import { SalesReturnItem } from './entities/sales-return-item.entity';
import { PurchaseReturn } from './entities/purchase-return.entity';
import { PurchaseReturnItem } from './entities/purchase-return-item.entity';
import { StockMovementsModule } from '@modules/stock-movements/stock-movements.module';
import { TenantsModule } from '@modules/tenants/tenants.module';
import { CustomersModule } from '@modules/customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesReturn,
      SalesReturnItem,
      PurchaseReturn,
      PurchaseReturnItem,
    ]),
    StockMovementsModule,
    TenantsModule,
    CustomersModule,
  ],
  controllers: [ReturnsController],
  providers: [ReturnsService],
  exports: [ReturnsService],
})
export class ReturnsModule {}
