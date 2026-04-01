import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProducts1772779540159 implements MigrationInterface {
    name = 'CreateProducts1772779540159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f9749dd3bffd880a497d007e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "catalogs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1883399275415ee6107413fe6c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "brands" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."products_discount_type_enum" AS ENUM('percentage', 'fixed')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "catalog_id" uuid, "section_id" uuid, "brand_id" uuid, "name" character varying(255) NOT NULL, "scientific_name" character varying(255), "barcode" character varying(255), "unit" character varying(50) NOT NULL, "sub_unit" character varying(50), "sub_unit_qty" integer, "min_stock_alert" integer NOT NULL DEFAULT '0', "discount_value" numeric(10,2), "discount_type" "public"."products_discount_type_enum", "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "batches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "branch_id" uuid NOT NULL, "lot_number" character varying(255), "manufacture_date" date, "expiry_date" date, "purchase_price" numeric(10,2) NOT NULL, "selling_price" numeric(10,2) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_55e7ff646e969b61d37eea5be7a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sections" ADD CONSTRAINT "FK_e8e1797548b0082d513138f1047" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "catalogs" ADD CONSTRAINT "FK_f5c236c4b6a7c96e439dd9792ae" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "brands" ADD CONSTRAINT "FK_33bb5b1b1a3a7e8b9787cd87784" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9c365ebf78f0e8a6d9e4827ea70" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_85ab225a5a310076c5ac78672bb" FOREIGN KEY ("catalog_id") REFERENCES "catalogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_1a6940588b5eb415a820d6f53f8" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "batches" ADD CONSTRAINT "FK_07ad38527d0d87601f3b05a6a22" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batches" DROP CONSTRAINT "FK_07ad38527d0d87601f3b05a6a22"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_1a6940588b5eb415a820d6f53f8"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_85ab225a5a310076c5ac78672bb"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9c365ebf78f0e8a6d9e4827ea70"`);
        await queryRunner.query(`ALTER TABLE "brands" DROP CONSTRAINT "FK_33bb5b1b1a3a7e8b9787cd87784"`);
        await queryRunner.query(`ALTER TABLE "catalogs" DROP CONSTRAINT "FK_f5c236c4b6a7c96e439dd9792ae"`);
        await queryRunner.query(`ALTER TABLE "sections" DROP CONSTRAINT "FK_e8e1797548b0082d513138f1047"`);
        await queryRunner.query(`DROP TABLE "batches"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_discount_type_enum"`);
        await queryRunner.query(`DROP TABLE "brands"`);
        await queryRunner.query(`DROP TABLE "catalogs"`);
        await queryRunner.query(`DROP TABLE "sections"`);
    }

}
