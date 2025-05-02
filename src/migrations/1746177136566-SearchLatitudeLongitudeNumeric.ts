import { MigrationInterface, QueryRunner } from "typeorm";

export class SearchLatitudeLongitudeNumeric1746177136566 implements MigrationInterface {
    name = 'SearchLatitudeLongitudeNumeric1746177136566'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "search" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "search" ADD "latitude" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "search" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "search" ADD "longitude" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "search" ADD CONSTRAINT "CHK_fb06fbd76e0ab0755d402bc68c" CHECK (latitude <> 'NaN')`);
        await queryRunner.query(`ALTER TABLE "search" ADD CONSTRAINT "CHK_34d80ff4cb0d9cbf5c52c4d6cd" CHECK (longitude <> 'NaN')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "search" DROP CONSTRAINT "CHK_34d80ff4cb0d9cbf5c52c4d6cd"`);
        await queryRunner.query(`ALTER TABLE "search" DROP CONSTRAINT "CHK_fb06fbd76e0ab0755d402bc68c"`);
        await queryRunner.query(`ALTER TABLE "search" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "search" ADD "longitude" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "search" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "search" ADD "latitude" integer NOT NULL`);
    }

}
