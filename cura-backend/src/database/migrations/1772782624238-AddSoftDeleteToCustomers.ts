import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToCustomers1772782624238 implements MigrationInterface {
    name = 'AddSoftDeleteToCustomers1772782624238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "deleted_at"`);
    }

}
