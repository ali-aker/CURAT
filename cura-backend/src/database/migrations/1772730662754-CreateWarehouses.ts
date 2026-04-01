import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWarehouses1772730662754 implements MigrationInterface {
    name = 'CreateWarehouses1772730662754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."warehouses_category_enum" AS ENUM('medicines', 'cosmetics', 'general')`);
        await queryRunner.query(`CREATE TABLE "warehouses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "address" text, "phone" character varying(20), "category" "public"."warehouses_category_enum" NOT NULL DEFAULT 'general', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_56ae21ee2432b2270b48867e4be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "warehouses" ADD CONSTRAINT "FK_09106b8068aeaf74fa33666df8f" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "warehouses" DROP CONSTRAINT "FK_09106b8068aeaf74fa33666df8f"`);
        await queryRunner.query(`DROP TABLE "warehouses"`);
        await queryRunner.query(`DROP TYPE "public"."warehouses_category_enum"`);
    }

}
