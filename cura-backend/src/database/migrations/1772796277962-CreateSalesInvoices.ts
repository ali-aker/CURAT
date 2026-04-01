import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSalesInvoices1772796277962 implements MigrationInterface {
    name = 'CreateSalesInvoices1772796277962'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sales_invoice_items_discount_type_enum" AS ENUM('percentage', 'fixed')`);
        await queryRunner.query(`CREATE TABLE "sales_invoice_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sales_invoice_id" uuid NOT NULL, "product_id" uuid NOT NULL, "batch_id" uuid NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(15,2) NOT NULL, "discount_value" numeric(10,4) NOT NULL DEFAULT '0', "discount_type" "public"."sales_invoice_items_discount_type_enum", "discount_amount" numeric(15,2) NOT NULL, "total_price" numeric(15,2) NOT NULL, CONSTRAINT "PK_fd69cf6c3d4df27b0a62ddf8137" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sales_invoices_status_enum" AS ENUM('draft', 'confirmed', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."sales_invoices_payment_method_enum" AS ENUM('cash', 'card', 'mixed')`);
        await queryRunner.query(`CREATE TYPE "public"."sales_invoices_discount_type_enum" AS ENUM('percentage', 'fixed')`);
        await queryRunner.query(`CREATE TABLE "sales_invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "branch_id" uuid NOT NULL, "customer_id" uuid, "cashier_id" uuid NOT NULL, "invoice_number" character varying(50), "status" "public"."sales_invoices_status_enum" NOT NULL DEFAULT 'draft', "payment_method" "public"."sales_invoices_payment_method_enum" NOT NULL DEFAULT 'cash', "promo_code_id" uuid, "points_redeemed" integer NOT NULL DEFAULT '0', "total_amount" numeric(15,2) NOT NULL DEFAULT '0', "discount_value" numeric(10,4) NOT NULL DEFAULT '0', "discount_type" "public"."sales_invoices_discount_type_enum", "discount_amount" numeric(15,2) NOT NULL DEFAULT '0', "net_amount" numeric(15,2) NOT NULL DEFAULT '0', "paid_amount" numeric(15,2) NOT NULL DEFAULT '0', "change_amount" numeric(15,2) NOT NULL DEFAULT '0', "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_be0576afbf66c353a8a4435a45b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sales_invoice_items" ADD CONSTRAINT "FK_5437e6e8bb89a721bfaea639259" FOREIGN KEY ("sales_invoice_id") REFERENCES "sales_invoices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales_invoice_items" ADD CONSTRAINT "FK_07bc0d99ebfadb569006a7606b8" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales_invoice_items" ADD CONSTRAINT "FK_efe2fd27862416755f0792385c3" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales_invoices" ADD CONSTRAINT "FK_72bb8892c34935a147c3ca77a8c" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales_invoices" ADD CONSTRAINT "FK_ad9ebb5b30038d6d862b3587bcb" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales_invoices" ADD CONSTRAINT "FK_981522d00bb232199509a3b8776" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_invoices" DROP CONSTRAINT "FK_981522d00bb232199509a3b8776"`);
        await queryRunner.query(`ALTER TABLE "sales_invoices" DROP CONSTRAINT "FK_ad9ebb5b30038d6d862b3587bcb"`);
        await queryRunner.query(`ALTER TABLE "sales_invoices" DROP CONSTRAINT "FK_72bb8892c34935a147c3ca77a8c"`);
        await queryRunner.query(`ALTER TABLE "sales_invoice_items" DROP CONSTRAINT "FK_efe2fd27862416755f0792385c3"`);
        await queryRunner.query(`ALTER TABLE "sales_invoice_items" DROP CONSTRAINT "FK_07bc0d99ebfadb569006a7606b8"`);
        await queryRunner.query(`ALTER TABLE "sales_invoice_items" DROP CONSTRAINT "FK_5437e6e8bb89a721bfaea639259"`);
        await queryRunner.query(`DROP TABLE "sales_invoices"`);
        await queryRunner.query(`DROP TYPE "public"."sales_invoices_discount_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sales_invoices_payment_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sales_invoices_status_enum"`);
        await queryRunner.query(`DROP TABLE "sales_invoice_items"`);
        await queryRunner.query(`DROP TYPE "public"."sales_invoice_items_discount_type_enum"`);
    }

}
