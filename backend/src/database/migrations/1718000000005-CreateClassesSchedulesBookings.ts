import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClassesSchedulesBookings1718000000005 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."booking_status_enum" AS ENUM ('confirmed', 'cancelled', 'waitlisted', 'attended', 'no_show')
    `);

    await queryRunner.query(`
      CREATE TABLE "classes" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(150) NOT NULL,
        "description" TEXT,
        "capacity" INT NOT NULL,
        "color" VARCHAR(7),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "schedules" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "classId" UUID NOT NULL,
        "dayOfWeek" INT NOT NULL,
        "startTime" TIME NOT NULL,
        "endTime" TIME NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "schedules"
        ADD CONSTRAINT "fk_schedules_classId"
        FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_schedules_classId" ON "schedules" ("classId")
    `);

    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "classId" UUID NOT NULL,
        "scheduleId" UUID NOT NULL,
        "memberId" UUID NOT NULL,
        "bookingDate" DATE NOT NULL,
        "status" "public"."booking_status_enum" NOT NULL DEFAULT 'confirmed',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings"
        ADD CONSTRAINT "fk_bookings_classId"
        FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings"
        ADD CONSTRAINT "fk_bookings_scheduleId"
        FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings"
        ADD CONSTRAINT "fk_bookings_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_bookings_classId" ON "bookings" ("classId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_bookings_scheduleId" ON "bookings" ("scheduleId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_bookings_memberId" ON "bookings" ("memberId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_bookings_bookingDate" ON "bookings" ("bookingDate")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_bookings_bookingDate"`);
    await queryRunner.query(`DROP INDEX "idx_bookings_memberId"`);
    await queryRunner.query(`DROP INDEX "idx_bookings_scheduleId"`);
    await queryRunner.query(`DROP INDEX "idx_bookings_classId"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "fk_bookings_memberId"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "fk_bookings_scheduleId"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "fk_bookings_classId"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP INDEX "idx_schedules_classId"`);
    await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "fk_schedules_classId"`);
    await queryRunner.query(`DROP TABLE "schedules"`);
    await queryRunner.query(`DROP TABLE "classes"`);
    await queryRunner.query(`DROP TYPE "public"."booking_status_enum"`);
  }
}
