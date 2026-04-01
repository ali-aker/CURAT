import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeliveryAndReservedStock1773228842149 implements MigrationInterface {
    name = 'AddDeliveryAndReservedStock1773228842149'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_invoices" ADD "is_delivery" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TYPE "public"."stock_movements_type_enum" RENAME TO "stock_movements_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."stock_movements_type_enum" AS ENUM('in', 'out', 'reserved')`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ALTER COLUMN "type" TYPE "public"."stock_movements_type_enum" USING "type"::"text"::"public"."stock_movements_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."stock_movements_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."stock_movements_type_enum_old" AS ENUM('in', 'out')`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ALTER COLUMN "type" TYPE "public"."stock_movements_type_enum_old" USING "type"::"text"::"public"."stock_movements_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."stock_movements_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."stock_movements_type_enum_old" RENAME TO "stock_movements_type_enum"`);
        await queryRunner.query(`ALTER TABLE "sales_invoices" DROP COLUMN "is_delivery"`);
    }

}
