import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class UserBaseAddressMigration1702656684272 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename column baseAddress to testnetBaseAddress
    await queryRunner.renameColumn("user", "baseAddress", "testnetBaseAddress")

    // Add new column mainnetBaseAddress
    await queryRunner.addColumn(
      "user",
      new TableColumn({
        name: "mainnetBaseAddress",
        type: "varchar",
        isNullable: true, // or false, based on your requirements
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the changes: rename testnetBaseAddress back to baseAddress
    await queryRunner.renameColumn("user", "testnetBaseAddress", "baseAddress")

    // Remove the column mainnetBaseAddress
    await queryRunner.dropColumn("user", "mainnetBaseAddress")
  }
}
