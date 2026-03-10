const https = require("https");

/**
 * GET /api/turn-credentials
 *
 * Fetches fresh, temporary TURN credentials from the Metered.ca REST API.
 * These short-lived credentials replace the static ones that expire and
 * cause "ICE failed, your TURN server appears to be broken" errors when
 * peers are on different networks.
 *
 * Falls back to the static VITE_TURN_* env-var credentials if the API
 * key is not configured or the upstream request fails.
 */
exports.getTurnCredentials = async (_req, res) => {
  const apiKey = process.env.METERED_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ s: "ok", iceServers: buildStaticFallback() });
  }

  const appName = process.env.METERED_APP_NAME;
  if (!appName) {
    console.warn("⚠️  METERED_APP_NAME is not set — using static TURN fallback");
    return res.status(200).json({ s: "ok", iceServers: buildStaticFallback() });
  }

  const url =
    `https://${encodeURIComponent(appName)}.metered.live/api/v1/turn/credentials?apiKey=${encodeURIComponent(apiKey)}`;

  try {
    const data = await fetchJson(url);
    // Metered returns an array of ICE server objects
    if (Array.isArray(data) && data.length > 0) {
      // Limit to 3 servers (1 STUN + 2 TURN) to prevent excessive
      // ICE candidate gathering
      return res.status(200).json({ s: "ok", iceServers: data.slice(0, 3) });
    }
    // Empty array → fall back
    return res.status(200).json({ s: "ok", iceServers: buildStaticFallback() });
  } catch (err) {
    console.error("⚠️  Metered API error, using static TURN fallback:", err);
    return res.status(200).json({ s: "ok", iceServers: buildStaticFallback() });
  }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildStaticFallback() {
  const servers = [];

  // STUN
  const stunUrls = csvToArray(process.env.VITE_STUN_URLS);
  if (stunUrls.length) {
    servers.push({ urls: stunUrls });
  } else {
    servers.push({
      urls: "stun:stun.relay.metered.ca:80",
    });
  }

  // TURN (static credentials from env)
  const turnUrls = csvToArray(process.env.VITE_TURN_URLS);
  const turnUser = process.env.VITE_TURN_USERNAME;
  const turnCred = process.env.VITE_TURN_CREDENTIAL;
  if (turnUrls.length && turnUser && turnCred) {
    // Each TURN URL as a separate entry (matches Metered's recommended format)
    turnUrls.forEach((url) => {
      servers.push({ urls: url, username: turnUser, credential: turnCred });
    });
  }

  return servers;
}

function csvToArray(value) {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function fetchJson(url, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: timeoutMs }, (resp) => {
      let body = "";
      resp.on("data", (chunk) => (body += chunk));
      resp.on("end", () => {
        if (resp.statusCode < 200 || resp.statusCode >= 300) {
          return reject(new Error(`HTTP ${resp.statusCode}: ${body}`));
        }
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error("Invalid JSON from Metered API"));
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Metered API request timed out"));
    });
  });
}
