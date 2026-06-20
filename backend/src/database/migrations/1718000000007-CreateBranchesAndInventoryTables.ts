import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBranchesAndInventoryTables1718000000007 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "branches" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(150) NOT NULL,
        "address" TEXT,
        "phone" VARCHAR(20),
        "email" VARCHAR(100),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_branches_email" ON "branches" ("email") WHERE "email" IS NOT NULL`);

    await queryRunner.query(`
      CREATE TABLE "inventory_items" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "branchId" UUID NOT NULL,
        "name" VARCHAR(150) NOT NULL,
        "description" TEXT,
        "totalQuantity" INTEGER NOT NULL DEFAULT 1,
        "availableQuantity" INTEGER NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_inventory_items_branchId" ON "inventory_items" ("branchId")`);
    await queryRunner.query(`
      ALTER TABLE "inventory_items"
      ADD CONSTRAINT "FK_inventory_items_branchId"
      FOREIGN KEY ("branchId") REFERENCES "branches"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE TABLE "inventory_loans" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "inventoryItemId" UUID NOT NULL,
        "memberId" UUID NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "loanedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "returnedAt" TIMESTAMP,
        "notes" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_inventory_loans_itemId" ON "inventory_loans" ("inventoryItemId")`);
    await queryRunner.query(`CREATE INDEX "idx_inventory_loans_memberId" ON "inventory_loans" ("memberId")`);
    await queryRunner.query(`
      ALTER TABLE "inventory_loans"
      ADD CONSTRAINT "FK_inventory_loans_inventoryItemId"
      FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id")
      ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "inventory_loans"
      ADD CONSTRAINT "FK_inventory_loans_memberId"
      FOREIGN KEY ("memberId") REFERENCES "members"("id")
      ON DELETE CASCADE
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inventory_loans"`);
    await queryRunner.query(`DROP TABLE "inventory_items"`);
    await queryRunner.query(`DROP TABLE "branches"`);
  }
}
