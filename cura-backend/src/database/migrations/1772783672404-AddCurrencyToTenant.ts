import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCurrencyToTenant1772783672404 implements MigrationInterface {
    name = 'AddCurrencyToTenant1772783672404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" ADD "currency" character varying(3) NOT NULL DEFAULT 'EGP'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "currency"`);
    }

}
