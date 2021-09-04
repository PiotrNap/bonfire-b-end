import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1630680799036 implements MigrationInterface {
    name = 'migration1630680799036'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."user" ALTER COLUMN "profileType" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."user" ALTER COLUMN "profileType" DROP NOT NULL`);
    }

}
