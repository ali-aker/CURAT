import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOffers1773302253412 implements MigrationInterface {
    name = 'CreateOffers1773302253412'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."offers_type_enum" AS ENUM('percentage', 'fixed', 'buy_x_get_y')`);
        await queryRunner.query(`CREATE TABLE "offers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "batch_id" uuid NOT NULL, "type" "public"."offers_type_enum" NOT NULL, "discount_value" numeric(10,4), "max_discount_amount" numeric(15,2), "buy_quantity" integer, "free_quantity" integer, "free_batch_id" uuid, "expiry_date" date NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_2cf6d09bc6c9719ceebe3b31b4d" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_37927fe6552b3c5ec7ab0b5bf20" FOREIGN KEY ("free_batch_id") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_37927fe6552b3c5ec7ab0b5bf20"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_2cf6d09bc6c9719ceebe3b31b4d"`);
        await queryRunner.query(`DROP TABLE "offers"`);
        await queryRunner.query(`DROP TYPE "public"."offers_type_enum"`);
    }

}
