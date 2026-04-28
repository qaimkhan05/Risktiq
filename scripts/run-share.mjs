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

function printUrls(localUrl, networkUrl) {
  console.log("");
  console.log("Risktiq network access");
  console.log(`Local:   ${localUrl}`);

  if (networkUrl) {
    console.log(`Network: ${networkUrl}`);
    console.log("Open the Network link on other devices connected to the same Wi-Fi/LAN.");
  } else {
    console.log("Network: No LAN IPv4 address detected on this machine.");
  }

  console.log("");
}

const mode = resolveMode();
const port = Number(process.env.PORT || "3000");
const lanIpAddress = getLanIpAddress();
const localUrl = `http://localhost:${port}`;
const networkUrl = lanIpAddress ? `http://${lanIpAddress}:${port}` : null;

if (shouldOverrideUrl(process.env.APP_URL)) {
  process.env.APP_URL = networkUrl || localUrl;
}

if (shouldOverrideUrl(process.env.NEXTAUTH_URL)) {
  process.env.NEXTAUTH_URL = networkUrl || localUrl;
}

if (mode === "info") {
  printUrls(localUrl, networkUrl);
  process.exit(0);
}

const nextExecutable = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextExecutable, mode, "-H", "0.0.0.0", "-p", String(port)], {
  stdio: "inherit",
  env: process.env
});

printUrls(localUrl, networkUrl);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
