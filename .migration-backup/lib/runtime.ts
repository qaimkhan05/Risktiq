export function isBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());
}

export function canUseDatabaseAtRuntime() {
  return hasDatabaseUrl() && !isBuildPhase();
}
