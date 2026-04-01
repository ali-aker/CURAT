import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToSuppliers1772782739173 implements MigrationInterface {
    name = 'AddSoftDeleteToSuppliers1772782739173'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "suppliers" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN "deleted_at"`);
    }

}
