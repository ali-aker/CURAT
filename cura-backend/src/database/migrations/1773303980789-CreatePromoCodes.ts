import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePromoCodes1773303980789 implements MigrationInterface {
    name = 'CreatePromoCodes1773303980789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "promo_code_usages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "promo_code_id" uuid NOT NULL, "customer_id" uuid NOT NULL, "sales_invoice_id" uuid NOT NULL, "used_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_23c4867b2c9e4bbcf82d677c50b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."promo_codes_discount_type_enum" AS ENUM('percentage', 'fixed')`);
        await queryRunner.query(`CREATE TABLE "promo_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "code" character varying NOT NULL, "discount_type" "public"."promo_codes_discount_type_enum" NOT NULL, "discount_value" numeric(10,4) NOT NULL, "max_discount_amount" numeric(15,2), "minimum_amount" numeric(15,2) NOT NULL DEFAULT '0', "max_uses" integer NOT NULL, "used_count" integer NOT NULL DEFAULT '0', "expiry_date" date NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c7b4f01710fda5afa056a2b4a35" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "promo_code_usages" ADD CONSTRAINT "FK_e44c9f212a0ac8c77868f6c0bac" FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "promo_code_usages" DROP CONSTRAINT "FK_e44c9f212a0ac8c77868f6c0bac"`);
        await queryRunner.query(`DROP TABLE "promo_codes"`);
        await queryRunner.query(`DROP TYPE "public"."promo_codes_discount_type_enum"`);
        await queryRunner.query(`DROP TABLE "promo_code_usages"`);
    }

}
