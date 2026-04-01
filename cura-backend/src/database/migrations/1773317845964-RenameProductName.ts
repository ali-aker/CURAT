import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameProductName1773317845964 implements MigrationInterface {
  name = 'RenameProductName1773317845964';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "name_ar" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "name_en" character varying(255)`,
    );
    // ننقل البيانات القديمة
    await queryRunner.query(
      `UPDATE "products" SET "name_ar" = "name", "name_en" = "scientific_name"`,
    );
    // نعمل name_ar NOT NULL بعد ما اتملت
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "name_ar" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "name"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "name" character varying(255)`,
    );
    await queryRunner.query(`UPDATE "products" SET "name" = "name_ar"`);
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "name_en"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "name_ar"`);
  }
}
