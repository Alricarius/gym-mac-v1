import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMembers1718000000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."members_gender_enum" AS ENUM ('male', 'female', 'other')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."members_status_enum" AS ENUM ('active', 'inactive')
    `);
    await queryRunner.query(`
      CREATE TABLE "members" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "fullName" VARCHAR(150) NOT NULL,
        "email" VARCHAR(100) UNIQUE,
        "phone" VARCHAR(20),
        "birthDate" DATE,
        "gender" "public"."members_gender_enum",
        "address" TEXT,
        "photoUrl" VARCHAR(500),
        "notes" TEXT,
        "status" "public"."members_status_enum" NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_members_fullName" ON "members" ("fullName")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "members"`);
    await queryRunner.query(`DROP TYPE "public"."members_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."members_gender_enum"`);
  }
}
