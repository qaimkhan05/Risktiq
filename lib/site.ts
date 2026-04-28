function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
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

  if (process.env.VERCEL_URL) {
    return trimTrailingSlash(`https://${process.env.VERCEL_URL}`);
  }

  return "http://localhost:3000";
}

export function getSupportEmail() {
  return process.env.SUPPORT_EMAIL || process.env.PERMANENT_ADMIN_EMAIL || "support@risktiq.app";
}
