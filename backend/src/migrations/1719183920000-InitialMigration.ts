import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1719183920000 implements MigrationInterface {
  name = 'InitialMigration1719183920000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create Enums
    await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM('admin', 'user')`);
    await queryRunner.query(`CREATE TYPE "reservations_action_enum" AS ENUM('reserve', 'cancel')`);

    // 2. Create Users Table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "full_name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "role" "users_role_enum" NOT NULL DEFAULT 'user',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88383d50ad0d39e3b777" UNIQUE ("email"),
        CONSTRAINT "PK_a3c148ecf5d4485b95b41c3ade0" PRIMARY KEY ("id")
      )
    `);

    // 3. Create Concerts Table
    await queryRunner.query(`
      CREATE TABLE "concerts" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "total_seats" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_5ab914041b3ab03cb29cf65cfd2" PRIMARY KEY ("id")
      )
    `);

    // 4. Create Reservations Table
    await queryRunner.query(`
      CREATE TABLE "reservations" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "concert_id" integer NOT NULL,
        "action" "reservations_action_enum" NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_da95c32c2538129fa56985473e6" PRIMARY KEY ("id")
      )
    `);

    // 5. Create Foreign Key Constraints
    await queryRunner.query(`
      ALTER TABLE "reservations" 
      ADD CONSTRAINT "FK_5db9d31d4548480b06385f0ef98" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "reservations" 
      ADD CONSTRAINT "FK_280f55cf6a74c43a3d5e23cc348" 
      FOREIGN KEY ("concert_id") REFERENCES "concerts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop Foreign Keys
    await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_280f55cf6a74c43a3d5e23cc348"`);
    await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_5db9d31d4548480b06385f0ef98"`);

    // Drop Tables
    await queryRunner.query(`DROP TABLE "reservations"`);
    await queryRunner.query(`DROP TABLE "concerts"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop Enums
    await queryRunner.query(`DROP TYPE "reservations_action_enum"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
  }
}
