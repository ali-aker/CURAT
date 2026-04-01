import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { Batch } from './entities/batch.entity';
import { Catalog } from './entities/catalog.entity';
import { Section } from './entities/section.entity';
import { Brand } from './entities/brand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Batch, Catalog, Section, Brand]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
