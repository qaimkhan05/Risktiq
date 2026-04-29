import type { TradingProfile } from "@workspace/db/schema";

export type AppTradingProfile = Omit<TradingProfile, "preferredStrategies"> & {
  preferredStrategies: string[];
};

export function parsePreferredStrategies(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    // fall through to legacy comma-separated
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializePreferredStrategies(values: string[]): string {
  return JSON.stringify([...new Set(values.map((v) => v.trim()).filter(Boolean))].slice(0, 100));
}

export function normalizeTradingProfile(profile: TradingProfile | null | undefined): AppTradingProfile | null {
  if (!profile) return null;
  return {
    ...profile,
    preferredStrategies: parsePreferredStrategies(profile.preferredStrategies),
  };
}
