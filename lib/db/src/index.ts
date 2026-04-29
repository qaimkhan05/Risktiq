import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function buildConnectionConfig() {
  const url = process.env.DATABASE_URL;
  const isValidPostgresUrl = url && /^postgres(ql)?:\/\//.test(url);

  if (isValidPostgresUrl) {
    return { connectionString: url };
  }

  const host = process.env.PGHOST;
  const port = process.env.PGPORT;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const database = process.env.PGDATABASE;

  if (!host || !user || !database) {
    throw new Error(
      "DATABASE_URL must be a postgres URL, or PGHOST/PGUSER/PGDATABASE must be set. Did you forget to provision a database?",
    );
  }

  return {
    host,
    port: port ? Number(port) : 5432,
    user,
    password,
    database,
  };
}

export const pool = new Pool(buildConnectionConfig());
export const db = drizzle(pool, { schema });

export * from "./schema";
