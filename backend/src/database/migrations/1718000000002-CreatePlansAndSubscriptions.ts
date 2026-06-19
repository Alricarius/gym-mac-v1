import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlansAndSubscriptions1718000000002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."subscriptions_status_enum" AS ENUM ('active', 'paused', 'cancelled', 'expired')
    `);

    await queryRunner.query(`
      CREATE TABLE "subscription_plans" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(150) NOT NULL,
        "duration" INTEGER NOT NULL,
        "price" DECIMAL(10,2) NOT NULL,
        "classCount" INTEGER,
        "description" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "subscriptions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "memberId" UUID NOT NULL,
        "planId" UUID NOT NULL,
        "startDate" DATE NOT NULL,
        "endDate" DATE NOT NULL,
        "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'active',
        "pausedAt" DATE,
        "pausedDays" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "subscriptions"
        ADD CONSTRAINT "fk_subscriptions_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "subscriptions"
        ADD CONSTRAINT "fk_subscriptions_planId"
        FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_subscriptions_memberId" ON "subscriptions" ("memberId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_subscriptions_planId" ON "subscriptions" ("planId")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_subscriptions_planId"`);
    await queryRunner.query(`DROP INDEX "idx_subscriptions_memberId"`);
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "fk_subscriptions_planId"`);
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "fk_subscriptions_memberId"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TABLE "subscription_plans"`);
    await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
  }
}
