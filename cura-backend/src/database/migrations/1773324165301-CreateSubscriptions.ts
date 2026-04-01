import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSubscriptions1773324165301 implements MigrationInterface {
    name = 'CreateSubscriptions1773324165301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_plan_enum" AS ENUM('basic', 'pro')`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('active', 'expired', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "plan" "public"."subscriptions_plan_enum" NOT NULL, "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'active', "start_date" date NOT NULL, "end_date" date NOT NULL, "amount_paid" numeric(10,2) NOT NULL DEFAULT '0', "created_by" uuid, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."subscription_payments_payment_method_enum" AS ENUM('cash', 'bank_transfer', 'paymob', 'fawry', 'stripe', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."subscription_payments_status_enum" AS ENUM('pending', 'completed', 'failed', 'refunded')`);
        await queryRunner.query(`CREATE TABLE "subscription_payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "subscription_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "payment_method" "public"."subscription_payments_payment_method_enum" NOT NULL DEFAULT 'cash', "status" "public"."subscription_payments_status_enum" NOT NULL DEFAULT 'completed', "transaction_id" character varying(255), "gateway_response" character varying(255), "created_by" uuid, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1b7a76365fd477de59cba0ab957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_f6ac03431c311ccb8bbd7d3af18" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscription_payments" ADD CONSTRAINT "FK_c88b099ca8b490a859836fd5ae7" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscription_payments" ADD CONSTRAINT "FK_3d76b7ca2d964925a54ad9fd516" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_payments" DROP CONSTRAINT "FK_3d76b7ca2d964925a54ad9fd516"`);
        await queryRunner.query(`ALTER TABLE "subscription_payments" DROP CONSTRAINT "FK_c88b099ca8b490a859836fd5ae7"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_f6ac03431c311ccb8bbd7d3af18"`);
        await queryRunner.query(`DROP TABLE "subscription_payments"`);
        await queryRunner.query(`DROP TYPE "public"."subscription_payments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."subscription_payments_payment_method_enum"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_plan_enum"`);
    }

}
