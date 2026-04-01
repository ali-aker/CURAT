import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransfers1772960170643 implements MigrationInterface {
    name = 'CreateTransfers1772960170643'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transfer_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transfer_id" uuid NOT NULL, "product_id" uuid NOT NULL, "batch_id" uuid NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "PK_d7258a0518246eabb01bffd56a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transfers_from_type_enum" AS ENUM('branch', 'warehouse')`);
        await queryRunner.query(`CREATE TYPE "public"."transfers_to_type_enum" AS ENUM('branch', 'warehouse')`);
        await queryRunner.query(`CREATE TYPE "public"."transfers_status_enum" AS ENUM('pending', 'confirmed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "transfers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "transfer_number" character varying NOT NULL, "from_type" "public"."transfers_from_type_enum" NOT NULL, "from_id" uuid NOT NULL, "to_type" "public"."transfers_to_type_enum" NOT NULL, "to_id" uuid NOT NULL, "status" "public"."transfers_status_enum" NOT NULL DEFAULT 'pending', "notes" text, "cancellation_reason" text, "cancelled_by" uuid, "cancelled_at" TIMESTAMP, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f3f4feed579ba2bf60b750b5778" UNIQUE ("transfer_number"), CONSTRAINT "PK_f712e908b465e0085b4408cabc3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transfer_items" ADD CONSTRAINT "FK_fc49d37b7156137bffe903a8199" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transfer_items" ADD CONSTRAINT "FK_ae7fbcacbd14c5422ec0b7175f6" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transfer_items" ADD CONSTRAINT "FK_caa09d6932946c3b2b5c98eaebc" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transfers" ADD CONSTRAINT "FK_b90c9f9cebff707929a250d40e1" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfers" DROP CONSTRAINT "FK_b90c9f9cebff707929a250d40e1"`);
        await queryRunner.query(`ALTER TABLE "transfer_items" DROP CONSTRAINT "FK_caa09d6932946c3b2b5c98eaebc"`);
        await queryRunner.query(`ALTER TABLE "transfer_items" DROP CONSTRAINT "FK_ae7fbcacbd14c5422ec0b7175f6"`);
        await queryRunner.query(`ALTER TABLE "transfer_items" DROP CONSTRAINT "FK_fc49d37b7156137bffe903a8199"`);
        await queryRunner.query(`DROP TABLE "transfers"`);
        await queryRunner.query(`DROP TYPE "public"."transfers_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transfers_to_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transfers_from_type_enum"`);
        await queryRunner.query(`DROP TABLE "transfer_items"`);
    }

}
