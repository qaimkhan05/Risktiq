import { type TradingProfile } from "@prisma/client";

export type AppTradingProfile = Omit<TradingProfile, "preferredStrategies"> & {
  preferredStrategies: string[];
};

export function parsePreferredStrategies(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    // Fall back to comma-separated parsing for legacy values.
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializePreferredStrategies(values: string[]) {
  return JSON.stringify(
    [...new Set(values.map((value) => value.trim()).filter(Boolean))].slice(0, 100)
  );
}

export function normalizeTradingProfile(profile: TradingProfile | null): AppTradingProfile | null {
  if (!profile) {
    return null;
  }

  return {
    ...profile,
    preferredStrategies: parsePreferredStrategies(profile.preferredStrategies)
  };
}
