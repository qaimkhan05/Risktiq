import type { Request } from "express";

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getBaseUrl(req?: Request) {
  if (req) {
    const forwardedHost = req.get("x-forwarded-host");
    const forwardedProto = req.get("x-forwarded-proto");
    if (forwardedHost) {
      return trimTrailingSlash(`${forwardedProto || "https"}://${forwardedHost}`);
    }
    const host = req.get("host");
    if (host) {
      const proto = req.protocol;
      return trimTrailingSlash(`${proto}://${host}`);
    }
  }
  if (process.env.APP_URL) return trimTrailingSlash(process.env.APP_URL);
  const deploymentDomain = process.env.REPLIT_DOMAINS?.split(",")
    .map((v) => v.trim())
    .find(Boolean);
  if (deploymentDomain) return trimTrailingSlash(`https://${deploymentDomain}`);
  if (process.env.REPLIT_DEV_DOMAIN) return trimTrailingSlash(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  return "http://localhost:3000";
}
