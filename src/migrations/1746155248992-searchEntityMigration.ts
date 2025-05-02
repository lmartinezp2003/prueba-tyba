import { MigrationInterface, QueryRunner } from "typeorm";

export class SearchEntityMigration1746155248992 implements MigrationInterface {
    name = 'SearchEntityMigration1746155248992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "search" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "latitude" integer NOT NULL, "longitude" integer NOT NULL, "city" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_0bdd0dc9f37fc71a6050de7ae7f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "search" ADD CONSTRAINT "FK_6ca4eb66f42e6ce3b4a2b329b14" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "search" DROP CONSTRAINT "FK_6ca4eb66f42e6ce3b4a2b329b14"`);
        await queryRunner.query(`DROP TABLE "search"`);
    }

}
