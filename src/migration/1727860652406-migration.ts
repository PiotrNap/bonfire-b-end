import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1727860652406 implements MigrationInterface {
    name = 'migration1727860652406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_entity" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "event_entity" ADD "description" character varying(300) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_entity" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "event_entity" ADD "description" character varying(150) NOT NULL`);
    }

}
