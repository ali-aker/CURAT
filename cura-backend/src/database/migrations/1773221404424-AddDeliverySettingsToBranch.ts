import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeliverySettingsToBranch1773221404424 implements MigrationInterface {
    name = 'AddDeliverySettingsToBranch1773221404424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "delivery_drivers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "branch_id" uuid NOT NULL, "name" character varying NOT NULL, "phone" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4dd4af220a2bc6d27785662bbde" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."delivery_orders_status_enum" AS ENUM('pending', 'processing', 'picked_up', 'on_the_way', 'delivered', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."delivery_orders_delivery_type_enum" AS ENUM('internal', 'external')`);
        await queryRunner.query(`CREATE TABLE "delivery_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "branch_id" uuid NOT NULL, "sales_invoice_id" uuid NOT NULL, "customer_id" uuid, "driver_id" uuid, "delivery_number" character varying NOT NULL, "status" "public"."delivery_orders_status_enum" NOT NULL DEFAULT 'pending', "delivery_type" "public"."delivery_orders_delivery_type_enum" NOT NULL DEFAULT 'internal', "customer_name" character varying NOT NULL, "customer_phone" character varying NOT NULL, "delivery_address" text NOT NULL, "delivery_fee" numeric(15,2) NOT NULL DEFAULT '0', "notes" text, "cancellation_reason" text, "cancelled_by" uuid, "cancelled_at" TIMESTAMP, "delivered_at" TIMESTAMP, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d6cb10f36b3dcfafb2635c8968d" UNIQUE ("delivery_number"), CONSTRAINT "PK_29e637736a0b5f36946edec3650" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "branches" ADD "delivery_enabled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "branches" ADD "external_shipping_enabled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "branches" ADD "delivery_fee" numeric(15,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "branches" ADD "free_delivery_min_amount" numeric(15,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "delivery_drivers" ADD CONSTRAINT "FK_1428516f5db2210b5ec47754624" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_drivers" ADD CONSTRAINT "FK_696020cd79d044f0305769b7f7b" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_orders" ADD CONSTRAINT "FK_2b958c31853c1981250a9ea21aa" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_orders" ADD CONSTRAINT "FK_a21f4bd05a0ba531d43a6d4c72e" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_orders" ADD CONSTRAINT "FK_3267d5862ab89b88c2dc2d7f11f" FOREIGN KEY ("sales_invoice_id") REFERENCES "sales_invoices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_orders" ADD CONSTRAINT "FK_a303f80865f095605a2dd2085e9" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "delivery_orders" ADD CONSTRAINT "FK_a605ccebd784b0a4cd685e378ab" FOREIGN KEY ("driver_id") REFERENCES "delivery_drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delivery_orders" DROP CONSTRAINT "FK_a605ccebd784b0a4cd685e378ab"`);
        await queryRunner.query(`ALTER TABLE "delivery_orders" DROP CONSTRAINT "FK_a303f80865f095605a2dd2085e9"`);
        await queryRunner.query(`ALTER TABLE "delivery_orders" DROP CONSTRAINT "FK_3267d5862ab89b88c2dc2d7f11f"`);
        await queryRunner.query(`ALTER TABLE "delivery_orders" DROP CONSTRAINT "FK_a21f4bd05a0ba531d43a6d4c72e"`);
        await queryRunner.query(`ALTER TABLE "delivery_orders" DROP CONSTRAINT "FK_2b958c31853c1981250a9ea21aa"`);
        await queryRunner.query(`ALTER TABLE "delivery_drivers" DROP CONSTRAINT "FK_696020cd79d044f0305769b7f7b"`);
        await queryRunner.query(`ALTER TABLE "delivery_drivers" DROP CONSTRAINT "FK_1428516f5db2210b5ec47754624"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "free_delivery_min_amount"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "delivery_fee"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "external_shipping_enabled"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "delivery_enabled"`);
        await queryRunner.query(`DROP TABLE "delivery_orders"`);
        await queryRunner.query(`DROP TYPE "public"."delivery_orders_delivery_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."delivery_orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "delivery_drivers"`);
    }

}
