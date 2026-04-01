import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProductPrecision1772783803899 implements MigrationInterface {
    name = 'UpdateProductPrecision1772783803899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "discount_value" TYPE numeric(10,4)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "discount_value" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "tenants" ADD "currency" character varying(3) NOT NULL DEFAULT 'EGP'`);
    }

}
