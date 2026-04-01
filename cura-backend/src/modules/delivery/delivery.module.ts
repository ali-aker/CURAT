import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { DeliveryOrder } from './entities/delivery-order.entity';
import { DeliveryDriver } from './entities/delivery-driver.entity';
import { CustomersModule } from '@modules/customers/customers.module';
import { StockMovementsModule } from '@modules/stock-movements/stock-movements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryOrder, DeliveryDriver]),
    CustomersModule,
    StockMovementsModule,
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
