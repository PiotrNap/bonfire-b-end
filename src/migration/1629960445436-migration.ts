import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1629960445436 implements MigrationInterface {
    name = 'migration1629960445436'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isActive" boolean NOT NULL DEFAULT true, "isArchived" boolean NOT NULL DEFAULT false, "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdBy" character varying(300) NOT NULL, "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lastChangedBy" character varying(300) NOT NULL, "internalComment" character varying(300), "username" character varying NOT NULL, "publicKey" character varying NOT NULL, "calendarToken" character varying NOT NULL, "refreshToken" character varying NOT NULL, "bio" character varying(65535), "userType" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_03bb2f4ae327fc5257d9d677b7" ON "user" ("userType") `);
        await queryRunner.query(`CREATE TABLE "event" ("id" SERIAL NOT NULL, "description" text NOT NULL, "place" character varying NOT NULL, "time" character varying NOT NULL, "url" character varying NOT NULL, "organizer" character varying NOT NULL, "attendees" character varying NOT NULL, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "event"`);
        await queryRunner.query(`DROP INDEX "IDX_03bb2f4ae327fc5257d9d677b7"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
