import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1718000000006 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."notification_type_enum" AS ENUM ('subscription_expiring', 'booking_reminder', 'check_in_alert')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."notification_channel_enum" AS ENUM ('email', 'whatsapp', 'in_app')
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "memberId" UUID,
        "type" notification_type_enum NOT NULL,
        "channel" notification_channel_enum NOT NULL,
        "subject" VARCHAR(255) NOT NULL,
        "body" TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "sentAt" TIMESTAMP NOT NULL DEFAULT now(),
        "readAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_notifications_memberId" ON "notifications" ("memberId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_notifications_type" ON "notifications" ("type")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_notifications_sentAt" ON "notifications" ("sentAt")
    `);

    await queryRunner.query(`
      ALTER TABLE "notifications"
      ADD CONSTRAINT "FK_notifications_memberId"
      FOREIGN KEY ("memberId") REFERENCES "members"("id")
      ON DELETE SET NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notification_channel_enum"`);
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
  }
}
