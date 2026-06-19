import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCheckIns1718000000004 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."check_in_type_enum" AS ENUM ('entry', 'exit')
    `);

    await queryRunner.query(`
      CREATE TABLE "check_ins" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "memberId" UUID NOT NULL,
        "type" "public"."check_in_type_enum" NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "check_ins"
        ADD CONSTRAINT "fk_check_ins_memberId"
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_check_ins_memberId" ON "check_ins" ("memberId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_check_ins_createdAt" ON "check_ins" ("createdAt")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_check_ins_createdAt"`);
    await queryRunner.query(`DROP INDEX "idx_check_ins_memberId"`);
    await queryRunner.query(`ALTER TABLE "check_ins" DROP CONSTRAINT "fk_check_ins_memberId"`);
    await queryRunner.query(`DROP TABLE "check_ins"`);
    await queryRunner.query(`DROP TYPE "public"."check_in_type_enum"`);
  }
}
