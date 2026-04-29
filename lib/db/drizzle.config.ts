import { defineConfig } from "drizzle-kit";
import path from "path";

const url = process.env.DATABASE_URL;
const isValidPostgresUrl = url && /^postgres(ql)?:\/\//.test(url);

const dbCredentials = isValidPostgresUrl
  ? { url: url! }
  : {
      host: process.env.PGHOST!,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      user: process.env.PGUSER!,
      password: process.env.PGPASSWORD!,
      database: process.env.PGDATABASE!,
      ssl: false,
    };

if (!isValidPostgresUrl && (!process.env.PGHOST || !process.env.PGUSER || !process.env.PGDATABASE)) {
  throw new Error("DATABASE_URL must be a postgres URL, or PG* env vars must be set");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials,
});
