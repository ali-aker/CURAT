import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { Supplier } from './entities/supplier.entity';
import { PurchaseOrder } from '@modules/purchase-orders/entities/purchase-order.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Supplier, PurchaseOrder])],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
