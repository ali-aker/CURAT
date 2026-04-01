import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSuppliers1772780780006 implements MigrationInterface {
    name = 'CreateSuppliers1772780780006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "suppliers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "phone" character varying(20), "email" character varying(255), "address" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "suppliers" ADD CONSTRAINT "FK_b0d0350059126fa08fddc3c7a46" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "suppliers" DROP CONSTRAINT "FK_b0d0350059126fa08fddc3c7a46"`);
        await queryRunner.query(`DROP TABLE "suppliers"`);
    }

}
