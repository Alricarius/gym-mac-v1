import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBranchIdToCheckInsPaymentsMembers1718000000008 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    const rows: { id: string }[] = await queryRunner.query(`SELECT id FROM branches LIMIT 1`);
    let defaultBranchId = rows.length > 0 ? rows[0].id : undefined;
    if (!defaultBranchId) {
      const now = new Date().toISOString();
      defaultBranchId = await queryRunner.manager
        .query(`INSERT INTO branches ("name", "createdAt", "updatedAt") VALUES ($1, $2, $3) RETURNING id`, [
          'Sucursal Principal',
          now,
          now,
        ])
        .then((r) => r[0].id);
    }

    await queryRunner.query(`ALTER TABLE check_ins ADD COLUMN "branchId" UUID`);
    await queryRunner.query(`UPDATE check_ins SET "branchId" = $1 WHERE "branchId" IS NULL`, [defaultBranchId]);
    await queryRunner.query(`ALTER TABLE check_ins ALTER COLUMN "branchId" SET NOT NULL`);
    await queryRunner.query(`CREATE INDEX "idx_check_ins_branchId" ON check_ins ("branchId")`);
    await queryRunner.query(`
      ALTER TABLE check_ins
      ADD CONSTRAINT "FK_check_ins_branchId"
      FOREIGN KEY ("branchId") REFERENCES branches(id)
    `);

    await queryRunner.query(`ALTER TABLE payments ADD COLUMN "branchId" UUID`);
    await queryRunner.query(`UPDATE payments SET "branchId" = $1 WHERE "branchId" IS NULL`, [defaultBranchId]);
    await queryRunner.query(`ALTER TABLE payments ALTER COLUMN "branchId" SET NOT NULL`);
    await queryRunner.query(`CREATE INDEX "idx_payments_branchId" ON payments ("branchId")`);
    await queryRunner.query(`
      ALTER TABLE payments
      ADD CONSTRAINT "FK_payments_branchId"
      FOREIGN KEY ("branchId") REFERENCES branches(id)
    `);

    await queryRunner.query(`ALTER TABLE members ADD COLUMN "branchId" UUID`);
    await queryRunner.query(`CREATE INDEX "idx_members_branchId" ON members ("branchId")`);
    await queryRunner.query(`
      ALTER TABLE members
      ADD CONSTRAINT "FK_members_branchId"
      FOREIGN KEY ("branchId") REFERENCES branches(id) ON DELETE SET NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE check_ins DROP CONSTRAINT "FK_check_ins_branchId"`);
    await queryRunner.query(`ALTER TABLE check_ins DROP COLUMN "branchId"`);
    await queryRunner.query(`ALTER TABLE payments DROP CONSTRAINT "FK_payments_branchId"`);
    await queryRunner.query(`ALTER TABLE payments DROP COLUMN "branchId"`);
    await queryRunner.query(`ALTER TABLE members DROP CONSTRAINT "FK_members_branchId"`);
    await queryRunner.query(`ALTER TABLE members DROP COLUMN "branchId"`);
  }
}
