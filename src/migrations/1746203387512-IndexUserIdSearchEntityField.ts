import { MigrationInterface, QueryRunner } from "typeorm";

export class IndexUserIdSearchEntityField1746203387512 implements MigrationInterface {
    name = 'IndexUserIdSearchEntityField1746203387512'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "search" DROP CONSTRAINT "FK_6ca4eb66f42e6ce3b4a2b329b14"`);
        await queryRunner.query(`ALTER TABLE "search" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_6ca4eb66f42e6ce3b4a2b329b1" ON "search" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "search" ADD CONSTRAINT "FK_6ca4eb66f42e6ce3b4a2b329b14" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "search" DROP CONSTRAINT "FK_6ca4eb66f42e6ce3b4a2b329b14"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6ca4eb66f42e6ce3b4a2b329b1"`);
        await queryRunner.query(`ALTER TABLE "search" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "search" ADD CONSTRAINT "FK_6ca4eb66f42e6ce3b4a2b329b14" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
