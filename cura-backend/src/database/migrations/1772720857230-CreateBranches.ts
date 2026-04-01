import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBranches1772720857230 implements MigrationInterface {
    name = 'CreateBranches1772720857230'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "address" text, "phone" character varying(20), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_fda619979f40a6a44fc9baf02c3" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_fda619979f40a6a44fc9baf02c3"`);
        await queryRunner.query(`DROP TABLE "branches"`);
    }

}
