import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedByToAllTables1718000000009 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    const adminId = await queryRunner.query(`SELECT id FROM users LIMIT 1`).then((r) => r[0]?.id);
    if (!adminId) return;

    const addCreatedBy = async (table: string, nullable = false) => {
      await queryRunner.query(`ALTER TABLE ${table} ADD COLUMN "createdById" UUID`);
      if (!nullable) {
        await queryRunner.query(`UPDATE ${table} SET "createdById" = $1 WHERE "createdById" IS NULL`, [adminId]);
        await queryRunner.query(`ALTER TABLE ${table} ALTER COLUMN "createdById" SET NOT NULL`);
      }
      await queryRunner.query(`CREATE INDEX "idx_${table}_createdById" ON ${table} ("createdById")`);
      await queryRunner.query(`
        ALTER TABLE ${table}
        ADD CONSTRAINT "FK_${table}_createdById"
        FOREIGN KEY ("createdById") REFERENCES users(id)
      `);
    };

    await addCreatedBy('refresh_tokens');
    await addCreatedBy('notifications', true);
    await addCreatedBy('subscription_plans');
    await addCreatedBy('branches');
    await addCreatedBy('bookings');
    await addCreatedBy('members');
    await addCreatedBy('check_ins');
    await addCreatedBy('subscriptions');
    await addCreatedBy('schedules');
    await addCreatedBy('classes');
    await addCreatedBy('inventory_items');
    await addCreatedBy('inventory_loans');
    await addCreatedBy('payments');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'refresh_tokens', 'notifications', 'subscription_plans', 'branches',
      'bookings', 'members', 'check_ins', 'subscriptions', 'schedules',
      'classes', 'inventory_items', 'inventory_loans', 'payments',
    ];
    for (const table of tables) {
      await queryRunner.query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS "FK_${table}_createdById"`);
      await queryRunner.query(`DROP INDEX IF EXISTS "idx_${table}_createdById"`);
      await queryRunner.query(`ALTER TABLE ${table} DROP COLUMN "createdById"`);
    }
  }
}
