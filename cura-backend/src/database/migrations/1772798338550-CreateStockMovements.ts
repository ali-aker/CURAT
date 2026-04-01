import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStockMovements1772798338550 implements MigrationInterface {
    name = 'CreateStockMovements1772798338550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."stock_movements_type_enum" AS ENUM('in', 'out')`);
        await queryRunner.query(`CREATE TYPE "public"."stock_movements_reference_type_enum" AS ENUM('purchase_order', 'sales_invoice', 'transfer_in', 'transfer_out', 'return_purchase', 'return_sales', 'adjustment')`);
        await queryRunner.query(`CREATE TABLE "stock_movements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "branch_id" uuid NOT NULL, "product_id" uuid NOT NULL, "batch_id" uuid NOT NULL, "type" "public"."stock_movements_type_enum" NOT NULL, "quantity" integer NOT NULL, "reference_type" "public"."stock_movements_reference_type_enum" NOT NULL, "reference_id" uuid NOT NULL, "created_by" uuid NOT NULL, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_57a26b190618550d8e65fb860e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_30dd9acc22dcb6ae51d7d34f16d" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_b85448ca9ec4bb8fc5eefb0c29d" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_2c1bb05b80ddcc562cd28d826c6" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_64c67f927d872a7e19700ab6637" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_64c67f927d872a7e19700ab6637"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_2c1bb05b80ddcc562cd28d826c6"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_b85448ca9ec4bb8fc5eefb0c29d"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_30dd9acc22dcb6ae51d7d34f16d"`);
        await queryRunner.query(`DROP TABLE "stock_movements"`);
        await queryRunner.query(`DROP TYPE "public"."stock_movements_reference_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."stock_movements_type_enum"`);
    }

}
