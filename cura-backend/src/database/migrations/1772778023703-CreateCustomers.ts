import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomers1772778023703 implements MigrationInterface {
    name = 'CreateCustomers1772778023703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "phone" character varying(20), "address" text, "points" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_97913f35ac2e435a4463fb50a01" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_97913f35ac2e435a4463fb50a01"`);
        await queryRunner.query(`DROP TABLE "customers"`);
    }

}
