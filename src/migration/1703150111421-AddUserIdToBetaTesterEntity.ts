import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddUserIdToBetaTesterEntity1703150111421 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "beta_testers_entity",
      new TableColumn({
        name: "userId",
        type: "uuid",
        isNullable: true,
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("beta_testers_entity", "userId")
  }
}
