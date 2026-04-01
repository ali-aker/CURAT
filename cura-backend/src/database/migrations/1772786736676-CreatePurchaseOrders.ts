import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePurchaseOrders1772786736676 implements MigrationInterface {
    name = 'CreatePurchaseOrders1772786736676'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "purchase_order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "purchase_order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "lot_number" character varying(255), "manufacture_date" date, "expiry_date" date, "quantity" integer NOT NULL, "purchase_price" numeric(15,2) NOT NULL, "selling_price" numeric(15,2) NOT NULL, "total_price" numeric(15,2) NOT NULL, CONSTRAINT "PK_e8b7568d25c41e3290db596b312" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."purchase_orders_status_enum" AS ENUM('pending', 'received', 'partial', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "purchase_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "warehouse_id" uuid NOT NULL, "supplier_id" uuid NOT NULL, "order_number" character varying(50) NOT NULL, "status" "public"."purchase_orders_status_enum" NOT NULL DEFAULT 'pending', "total_amount" numeric(15,2) NOT NULL DEFAULT '0', "notes" text, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_b297010fff05faf7baf4e67afa7" UNIQUE ("order_number"), CONSTRAINT "PK_05148947415204a897e8beb2553" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "currency" character varying(3) NOT NULL DEFAULT 'EGP'`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" ADD CONSTRAINT "FK_3f92bb44026cedfe235c8b91244" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" ADD CONSTRAINT "FK_d5089517fc19b1b9fb04454740c" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_237678c98436e0abb48b3060c82" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_74e4ce03ba3f8bc13de20fc594e" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_d16a885aa88447ccfd010e739b0" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_orders" DROP CONSTRAINT "FK_d16a885aa88447ccfd010e739b0"`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" DROP CONSTRAINT "FK_74e4ce03ba3f8bc13de20fc594e"`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" DROP CONSTRAINT "FK_237678c98436e0abb48b3060c82"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" DROP CONSTRAINT "FK_d5089517fc19b1b9fb04454740c"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" DROP CONSTRAINT "FK_3f92bb44026cedfe235c8b91244"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "currency"`);
        await queryRunner.query(`DROP TABLE "purchase_orders"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "purchase_order_items"`);
    }

}
