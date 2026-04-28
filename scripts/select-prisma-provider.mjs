import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDirectory = process.cwd();
const prismaDirectory = path.join(rootDirectory, "prisma");
const schemaPath = path.join(prismaDirectory, "schema.prisma");

const templateMap = {
  sqlite: path.join(prismaDirectory, "schema.sqlite.prisma"),
  postgresql: path.join(prismaDirectory, "schema.postgresql.prisma")
};

function resolveProvider() {
  const explicitProvider = process.env.DATABASE_PROVIDER?.trim().toLowerCase();

  if (explicitProvider === "postgres" || explicitProvider === "postgresql") {
    return "postgresql";
  }

  if (explicitProvider === "sqlite") {
    return "sqlite";
  }

  const databaseUrl = process.env.DATABASE_URL?.trim().toLowerCase();

  if (databaseUrl?.startsWith("postgresql://") || databaseUrl?.startsWith("postgres://")) {
    return "postgresql";
  }

  return "sqlite";
}

async function main() {
  const provider = resolveProvider();
  const templatePath = templateMap[provider];
  const templateContents = await readFile(templatePath, "utf8");
  const currentContents = await readFile(schemaPath, "utf8").catch(() => "");

  if (currentContents !== templateContents) {
    await writeFile(schemaPath, templateContents, "utf8");
  }

  console.log(`[prisma] Active provider: ${provider}`);

  if (process.env.VERCEL && provider === "sqlite") {
    console.warn(
      "[prisma] SQLite is not persistent on Vercel. For production deployment, set DATABASE_PROVIDER=postgresql and use a hosted PostgreSQL DATABASE_URL."
    );
  }
}

main().catch((error) => {
  console.error("[prisma] Failed to prepare schema.", error);
  process.exit(1);
});
