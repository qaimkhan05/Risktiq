import { networkInterfaces } from "node:os";
import { spawn } from "node:child_process";
import path from "node:path";

function getLanIpAddress() {
  const interfaces = networkInterfaces();

  for (const interfaceAddresses of Object.values(interfaces)) {
    for (const address of interfaceAddresses || []) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }

  return null;
}

function resolveMode() {
  const mode = process.argv[2];

  if (mode === "dev" || mode === "start" || mode === "info") {
    return mode;
  }

  return "dev";
}

function shouldOverrideUrl(value) {
  if (!value) {
    return true;
  }

  return value.includes("localhost") || value.includes("127.0.0.1");
}

function getReplitUrl() {
  const deploymentDomain = process.env.REPLIT_DOMAINS?.split(",")
    .map((value) => value.trim())
    .find(Boolean);

  if (deploymentDomain) {
    return `https://${deploymentDomain}`;
  }

  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }

  return null;
}

function printUrls(localUrl, networkUrl, replitUrl) {
  console.log("");
  console.log("Risktiq access");
  console.log(`Local:   ${localUrl}`);

  if (networkUrl) {
    console.log(`Network: ${networkUrl}`);
  } else {
    console.log("Network: No LAN IPv4 address detected on this machine.");
  }

  if (replitUrl) {
    console.log(`Replit:  ${replitUrl}`);
  } else {
    console.log("Replit:  No Replit domain detected in the environment.");
  }

  console.log("");
}

const mode = resolveMode();
const port = Number(process.env.PORT || "3000");
const lanIpAddress = getLanIpAddress();
const localUrl = `http://localhost:${port}`;
const networkUrl = lanIpAddress ? `http://${lanIpAddress}:${port}` : null;
const replitUrl = getReplitUrl();

if (shouldOverrideUrl(process.env.APP_URL)) {
  process.env.APP_URL = replitUrl || networkUrl || localUrl;
}

if (shouldOverrideUrl(process.env.NEXTAUTH_URL)) {
  process.env.NEXTAUTH_URL = replitUrl || networkUrl || localUrl;
}

if (mode === "info") {
  printUrls(localUrl, networkUrl, replitUrl);
  process.exit(0);
}

const nextExecutable = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextExecutable, mode, "-H", "0.0.0.0", "-p", String(port)], {
  stdio: "inherit",
  env: process.env
});

printUrls(localUrl, networkUrl, replitUrl);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
