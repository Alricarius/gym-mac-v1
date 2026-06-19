import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePayments1718000000003 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."payments_method_enum" AS ENUM ('cash', 'card', 'transfer')
    `);

    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "subscriptionId" UUID NOT NULL,
        "memberId" UUID NOT NULL,
        "amount" DECIMAL(10,2) NOT NULL,
        "method" "public"."payments_method_enum" NOT NULL,
        "reference" VARCHAR(100),
        "notes" TEXT,
        "paidAt" TIMESTAMP NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
        ADD CONSTRAINT "fk_payments_subscriptionId"
        FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
        ADD CONSTRAINT "fk_payments_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_payments_subscriptionId" ON "payments" ("subscriptionId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_payments_memberId" ON "payments" ("memberId")
    `);

    await queryRunner.query(`
      ALTER TABLE "subscriptions"
        ADD COLUMN "lastPaymentAt" TIMESTAMP
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "lastPaymentAt"`);
    await queryRunner.query(`DROP INDEX "idx_payments_memberId"`);
    await queryRunner.query(`DROP INDEX "idx_payments_subscriptionId"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "fk_payments_memberId"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "fk_payments_subscriptionId"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payments_method_enum"`);
  }
}
