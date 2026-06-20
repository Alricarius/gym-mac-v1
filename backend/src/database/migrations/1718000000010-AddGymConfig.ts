import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGymConfig1718000000010 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE gym_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "gymName" VARCHAR(200) NOT NULL,
        address TEXT NULL,
        phone VARCHAR(20) NULL,
        "openingHours" JSONB NULL,
        "cancellationPolicy" TEXT NULL,
        "graceDays" INT DEFAULT 0,
        "taxRate" DECIMAL(5,2) DEFAULT 0,
        timezone VARCHAR(50) DEFAULT 'America/La_Paz',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      INSERT INTO gym_config ("gymName", address, phone, "openingHours", "cancellationPolicy", "graceDays", "taxRate", timezone)
      VALUES ('Mi Gimnasio', '', '', NULL, '', 0, 0, 'America/La_Paz');
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS gym_config;`);
  }
}
