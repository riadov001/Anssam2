/**
 * Dev start wrapper for the Noor Expo app.
 *
 * The Replit workflow system detects readiness by checking if the configured
 * PORT opens. Expo's Metro bundler takes ~8-10 seconds to bind that port, which
 * can race with the workflow detector. This wrapper solves it by:
 *
 *  1. Immediately binding PORT on 0.0.0.0 with a lightweight proxy server
 *     so the workflow detector sees the port as open within milliseconds.
 *  2. Starting Metro on an internal port (PORT+1) in the background.
 *  3. Once Metro passes its health check, switching the proxy to forward all
 *     requests to Metro.
 *
 * This means the workflow starts cleanly while Metro bundles in the background.
 */

const http = require("http");
const { spawn } = require("child_process");

const PORT = parseInt(process.env.PORT || "8099", 10);
const METRO_PORT = PORT + 1;

let metroReady = false;

function log(msg) {
  process.stdout.write(`[dev-start] ${msg}\n`);
}

function checkMetroHealth() {
  return new Promise((resolve) => {
    const req = http.get(
      { hostname: "127.0.0.1", port: METRO_PORT, path: "/status", timeout: 3000 },
      (res) => {
        let body = "";
        res.on("data", (d) => (body += d));
        res.on("end", () => resolve(body.includes("running")));
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
  });
}

async function waitForMetro(maxWaitMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const healthy = await checkMetroHealth();
    if (healthy) return true;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

function proxyRequest(req, res) {
  if (!metroReady) {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("packager-status:running");
    return;
  }

  const options = {
    hostname: "127.0.0.1",
    port: METRO_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${METRO_PORT}` },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(502);
      res.end("Metro not ready");
    }
  });

  req.pipe(proxyReq, { end: true });
}

const server = http.createServer(proxyRequest);
server.listen(PORT, "0.0.0.0", () => {
  log(`Proxy listening on port ${PORT} (Metro will start on ${METRO_PORT})`);
});

const metroEnv = {
  ...process.env,
  PORT: String(METRO_PORT),
};

const metroArgs = [
  "exec", "expo", "start",
  "--localhost",
  "--port", String(METRO_PORT),
];

if (process.env.METRO_WEB) {
  metroArgs.push("--web");
}

log(`Starting Metro on port ${METRO_PORT}...`);
const metro = spawn("pnpm", metroArgs, {
  env: metroEnv,
  stdio: "inherit",
  cwd: process.cwd(),
});

metro.on("exit", (code) => {
  log(`Metro exited with code ${code}`);
  server.close();
  process.exit(code || 0);
});

function shutdown() {
  log("Shutting down...");
  metro.kill("SIGTERM");
  server.close();
  setTimeout(() => process.exit(0), 2000);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("SIGHUP", shutdown);

waitForMetro(120000).then((ready) => {
  if (ready) {
    metroReady = true;
    log(`Metro ready — proxying all traffic from :${PORT} to :${METRO_PORT}`);
  } else {
    log("Metro did not become healthy within 120s — proxy will still forward attempts");
    metroReady = true;
  }
});
