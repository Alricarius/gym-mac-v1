import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersAndRefreshTokens1718000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM ('admin', 'receptionist', 'trainer')
    `);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" VARCHAR(100) NOT NULL UNIQUE,
        "fullName" VARCHAR(100) NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'receptionist',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "tokenHash" VARCHAR(255) NOT NULL UNIQUE,
        "expiresAt" TIMESTAMP NOT NULL,
        "isRevoked" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_refresh_tokens_userId" ON "refresh_tokens" ("userId")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
