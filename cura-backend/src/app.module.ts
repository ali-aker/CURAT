import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import appConfig from '@config/app/app.config';
import databaseConfig from '@config/database/database.config';
import redisConfig from '@config/redis/redis.config';
import { AuthModule } from '@modules/auth/auth.module';
import { TenantsModule } from '@modules/tenants/tenants.module';
import { BranchesModule } from '@modules/branches/branches.module';
import { WarehousesModule } from '@modules/warehouses/warehouses.module';
import { UsersModule } from '@modules/users/users.module';
import { CustomersModule } from '@modules/customers/customers.module';
import { ProductsModule } from '@modules/products/products.module';
import { SuppliersModule } from '@modules/suppliers/suppliers.module';
import { PurchaseOrdersModule } from '@modules/purchase-orders/purchase-orders.module';
import { SalesInvoicesModule } from '@modules/sales-invoices/sales-invoices.module';
import { StockMovementsModule } from '@modules/stock-movements/stock-movements.module';
import { TransfersModule } from '@modules/transfers/transfers.module';
import { ReturnsModule } from '@modules/returns/returns.module';
import { DeliveryModule } from '@modules/delivery/delivery.module';
import { OffersModule } from './modules/offers/offers.module';
import { PromoCodesModule } from './modules/promo-codes/promo-codes.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: configService.get('app.env') === 'development',
      }),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    AuthModule,
    TenantsModule,
    BranchesModule,
    WarehousesModule,
    UsersModule,
    CustomersModule,
    ProductsModule,
    SuppliersModule,
    PurchaseOrdersModule,
    SalesInvoicesModule,
    StockMovementsModule,
    TransfersModule,
    ReturnsModule,
    DeliveryModule,
    OffersModule,
    PromoCodesModule,
    ReportsModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
