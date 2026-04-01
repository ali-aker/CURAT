import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStockMovementsAndBatches1772805033231 implements MigrationInterface {
    name = 'UpdateStockMovementsAndBatches1772805033231'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batches" ADD "warehouse_id" uuid`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD "warehouse_id" uuid`);
        await queryRunner.query(`ALTER TABLE "batches" ALTER COLUMN "branch_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_b85448ca9ec4bb8fc5eefb0c29d"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ALTER COLUMN "branch_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_b85448ca9ec4bb8fc5eefb0c29d" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_e7831147f5a8ee3c42e6eaeee2e" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_e7831147f5a8ee3c42e6eaeee2e"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_b85448ca9ec4bb8fc5eefb0c29d"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ALTER COLUMN "branch_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_b85448ca9ec4bb8fc5eefb0c29d" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "batches" ALTER COLUMN "branch_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP COLUMN "warehouse_id"`);
        await queryRunner.query(`ALTER TABLE "batches" DROP COLUMN "warehouse_id"`);
    }

}
