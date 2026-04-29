function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getReplitBaseUrl() {
  const deploymentDomain = process.env.REPLIT_DOMAINS?.split(",")
    .map((value) => value.trim())
    .find(Boolean);

  if (deploymentDomain) {
    return trimTrailingSlash(`https://${deploymentDomain}`);
  }

  if (process.env.REPLIT_DEV_DOMAIN) {
    return trimTrailingSlash(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  }

  return null;
}

export function getBaseUrl(request?: Request) {
  const forwardedHost = request?.headers.get("x-forwarded-host");
  const forwardedProto = request?.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    return trimTrailingSlash(`${forwardedProto || "https"}://${forwardedHost}`);
  }

  if (request) {
    return trimTrailingSlash(new URL(request.url).origin);
  }

  if (process.env.APP_URL) {
    return trimTrailingSlash(process.env.APP_URL);
  }

  if (process.env.NEXTAUTH_URL) {
    return trimTrailingSlash(process.env.NEXTAUTH_URL);
  }

  const replitBaseUrl = getReplitBaseUrl();

  if (replitBaseUrl) {
    return replitBaseUrl;
  }

  if (process.env.VERCEL_URL) {
    return trimTrailingSlash(`https://${process.env.VERCEL_URL}`);
  }

  return "http://localhost:3000";
}

export function getSupportEmail() {
  return process.env.SUPPORT_EMAIL || process.env.PERMANENT_ADMIN_EMAIL || "support@risktiq.app";
}
