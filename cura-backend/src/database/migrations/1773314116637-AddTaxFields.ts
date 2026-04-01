import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaxFields1773314116637 implements MigrationInterface {
    name = 'AddTaxFields1773314116637'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenants" ADD "tax_rate" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "is_taxable" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "sales_invoices" ADD "tax_amount" numeric(15,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD "tax_amount" numeric(15,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_orders" DROP COLUMN "tax_amount"`);
        await queryRunner.query(`ALTER TABLE "sales_invoices" DROP COLUMN "tax_amount"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "is_taxable"`);
        await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "tax_rate"`);
    }

}
