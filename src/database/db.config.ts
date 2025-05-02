import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import * as entities from "./entities";
import * as migrations from "./migrations";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";

export const dbConfig: PostgresConnectionOptions = {
  type: "postgres",
  port: 5432,
  synchronize: false,
  migrationsRun: true,
  namingStrategy: new SnakeNamingStrategy(),
  logging: false,
  host: "0.0.0.0",
  username: "postgres",
  password: "postgres",
  extra: { max: 3 }, // Limit the postgres connection pool size (1 master and 2 slaves per pool)
  database: "db",
  entities: Object.values(entities),
  migrations: Object.values(migrations),
};

export default new DataSource({
  type: "postgres",
  port: 5432,
  synchronize: false,
  migrationsRun: true,
  namingStrategy: new SnakeNamingStrategy(),
  logging: false,
  host: "0.0.0.0",
  username: "postgres",
  password: "postgres",
  database: "db",
  entities: Object.values(entities),
  migrations: Object.values(migrations),
});
