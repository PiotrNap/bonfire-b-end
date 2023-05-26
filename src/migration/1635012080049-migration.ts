import { MigrationInterface, QueryRunner } from "typeorm"

export class migration1635012080049 implements MigrationInterface {
  name = "migration1635012080049"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_entity" ADD "fromDate" TIMESTAMP WITH TIME ZONE NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "event_entity" ADD "toDate" TIMESTAMP WITH TIME ZONE NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event_entity" DROP COLUMN "toDate"`)
    await queryRunner.query(`ALTER TABLE "event_entity" DROP COLUMN "fromDate"`)
  }
}
