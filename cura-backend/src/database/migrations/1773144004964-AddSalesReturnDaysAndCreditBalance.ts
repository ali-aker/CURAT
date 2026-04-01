import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSalesReturnDaysAndCreditBalance1773144004964 implements MigrationInterface {
    name = 'AddSalesReturnDaysAndCreditBalance1773144004964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sales_return_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sales_return_id" uuid NOT NULL, "product_id" uuid NOT NULL, "batch_id" uuid NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(15,2) NOT NULL, "total_price" numeric(15,2) NOT NULL, CONSTRAINT "PK_5beda5693c86f5f183d95eae76f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sales_returns_status_enum" AS ENUM('pending', 'confirmed', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."sales_returns_refund_method_enum" AS ENUM('cash', 'credit', 'both')`);
        await queryRunner.query(`CREATE TABLE "sales_returns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "branch_id" uuid NOT NULL, "customer_id" uuid, "sales_invoice_id" uuid NOT NULL, "return_number" character varying NOT NULL, "status" "public"."sales_returns_status_enum" NOT NULL DEFAULT 'pending', "refund_method" "public"."sales_returns_refund_method_enum", "total_amount" numeric(15,2) NOT NULL DEFAULT '0', "cash_amount" numeric(15,2) NOT NULL DEFAULT '0', "credit_amount" numeric(15,2) NOT NULL DEFAULT '0', "notes" text, "cancellation_reason" text, "cancelled_by" uuid, "cancelled_at" TIMESTAMP, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ffa3b94951ab9244d4252d4ad66" UNIQUE ("return_number"), CONSTRAINT "PK_7910eebccdade339a4e49fb002f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "purchase_return_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "purchase_return_id" uuid NOT NULL, "product_id" uuid NOT NULL, "batch_id" uuid NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(15,2) NOT NULL, "total_price" numeric(15,2) NOT NULL, CONSTRAINT "PK_b392d1493da8d20117cc5f0c135" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."purchase_returns_status_enum" AS ENUM('pending', 'confirmed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "purchase_returns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "warehouse_id" uuid NOT NULL, "supplier_id" uuid NOT NULL, "purchase_order_id" uuid NOT NULL, "return_number" character varying NOT NULL, "status" "public"."purchase_returns_status_enum" NOT NULL DEFAULT 'pending', "total_amount" numeric(15,2) NOT NULL DEFAULT '0', "refund_amount" numeric(15,2) NOT NULL DEFAULT '0', "notes" text, "cancellation_reason" text, "cancelled_by" uuid, "cancelled_at" TIMESTAMP, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_63548e2f28464f17bf1c2cb675b" UNIQUE ("return_number"), CONSTRAINT "PK_cc2ea54a32938fc38a4e5442330" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "sales_return_days" integer NOT NULL DEFAULT '7'`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "credit_balance" numeric(15,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "sales_return_items" ADD CONSTRAINT "FK_0d4984e821ca7fa71deb0f3490e" FOREIGN KEY ("sales_return_id") REFERENCES "sales_returns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales_return_items" ADD CONSTRAINT "FK_52d257a582e5aa09971b6edbf4e" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales_return_items" ADD CONSTRAINT "FK_62d6e6d96cb17f4db0bc2e10dce" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales_returns" ADD CONSTRAINT "FK_082f9dd8328330ba3f9a58c6ef7" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales_returns" ADD CONSTRAINT "FK_9ab81badd4ba0ab0aa44b5cc9d2" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales_returns" ADD CONSTRAINT "FK_6372eb54e8600566b14709716f5" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales_returns" ADD CONSTRAINT "FK_8bb0437defc959c3b8a785c5eb0" FOREIGN KEY ("sales_invoice_id") REFERENCES "sales_invoices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_return_items" ADD CONSTRAINT "FK_9a68dc0c9f15501f6ce7a31b969" FOREIGN KEY ("purchase_return_id") REFERENCES "purchase_returns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_return_items" ADD CONSTRAINT "FK_0d0de1a0fceb2ca709521541830" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_return_items" ADD CONSTRAINT "FK_21c156c75006455e24c9cfe6652" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_returns" ADD CONSTRAINT "FK_58a94f6347902b408538c62f989" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_returns" ADD CONSTRAINT "FK_7042f8103fa903c22b32e43e656" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_returns" ADD CONSTRAINT "FK_8c67adeb896936f85272e7e8b16" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_returns" ADD CONSTRAINT "FK_5e91deccf80f31959f9e1aaac21" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_returns" DROP CONSTRAINT "FK_5e91deccf80f31959f9e1aaac21"`);
        await queryRunner.query(`ALTER TABLE "purchase_returns" DROP CONSTRAINT "FK_8c67adeb896936f85272e7e8b16"`);
        await queryRunner.query(`ALTER TABLE "purchase_returns" DROP CONSTRAINT "FK_7042f8103fa903c22b32e43e656"`);
        await queryRunner.query(`ALTER TABLE "purchase_returns" DROP CONSTRAINT "FK_58a94f6347902b408538c62f989"`);
        await queryRunner.query(`ALTER TABLE "purchase_return_items" DROP CONSTRAINT "FK_21c156c75006455e24c9cfe6652"`);
        await queryRunner.query(`ALTER TABLE "purchase_return_items" DROP CONSTRAINT "FK_0d0de1a0fceb2ca709521541830"`);
        await queryRunner.query(`ALTER TABLE "purchase_return_items" DROP CONSTRAINT "FK_9a68dc0c9f15501f6ce7a31b969"`);
        await queryRunner.query(`ALTER TABLE "sales_returns" DROP CONSTRAINT "FK_8bb0437defc959c3b8a785c5eb0"`);
        await queryRunner.query(`ALTER TABLE "sales_returns" DROP CONSTRAINT "FK_6372eb54e8600566b14709716f5"`);
        await queryRunner.query(`ALTER TABLE "sales_returns" DROP CONSTRAINT "FK_9ab81badd4ba0ab0aa44b5cc9d2"`);
        await queryRunner.query(`ALTER TABLE "sales_returns" DROP CONSTRAINT "FK_082f9dd8328330ba3f9a58c6ef7"`);
        await queryRunner.query(`ALTER TABLE "sales_return_items" DROP CONSTRAINT "FK_62d6e6d96cb17f4db0bc2e10dce"`);
        await queryRunner.query(`ALTER TABLE "sales_return_items" DROP CONSTRAINT "FK_52d257a582e5aa09971b6edbf4e"`);
        await queryRunner.query(`ALTER TABLE "sales_return_items" DROP CONSTRAINT "FK_0d4984e821ca7fa71deb0f3490e"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "credit_balance"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "sales_return_days"`);
        await queryRunner.query(`DROP TABLE "purchase_returns"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_returns_status_enum"`);
        await queryRunner.query(`DROP TABLE "purchase_return_items"`);
        await queryRunner.query(`DROP TABLE "sales_returns"`);
        await queryRunner.query(`DROP TYPE "public"."sales_returns_refund_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sales_returns_status_enum"`);
        await queryRunner.query(`DROP TABLE "sales_return_items"`);
    }

}
