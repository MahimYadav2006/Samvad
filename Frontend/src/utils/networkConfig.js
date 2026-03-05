import { getPublicEnv } from "./runtimeConfig";

const DEFAULT_BACKEND_URL = "http://localhost:8000";
const DEFAULT_STUN_URLS = [
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
];
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

const trimSlash = (value) => value.replace(/\/+$/, "");

const parseCsv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const dedupeServers = (servers) => {
  const seen = new Set();
  return servers.filter((server) => {
    const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
    const key = JSON.stringify({
      urls: [...urls].sort(),
      username: server.username || "",
      credential: server.credential || "",
    });
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const getBackendUrl = () => {
  const configured = getPublicEnv("VITE_BACKEND_URL");
  if (!configured || !String(configured).trim()) {
    return DEFAULT_BACKEND_URL;
  }

  const normalized = trimSlash(String(configured).trim());

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol === "https:" && LOCAL_HOSTNAMES.has(parsed.hostname)) {
      const appRunsOnHttps =
        typeof window !== "undefined" && window.location?.protocol === "https:";

      // Local backend commonly runs without TLS; avoid hard failure on scheme mismatch.
      if (!appRunsOnHttps) {
        parsed.protocol = "http:";
      }
      return trimSlash(parsed.toString());
    }
    return trimSlash(parsed.toString());
  } catch {
    return normalized;
  }
};

export const getWebRtcIceServers = () => {
  const servers = [];

  const customJson = getPublicEnv("VITE_WEBRTC_ICE_SERVERS");
  if (customJson) {
    try {
      const parsed = JSON.parse(customJson);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (item && item.urls) {
            servers.push(item);
          }
        });
      }
    } catch {
      // Ignore parse errors and continue with fallback servers.
    }
  }

  const stunUrls = parseCsv(getPublicEnv("VITE_STUN_URLS"));
  const effectiveStunUrls = stunUrls.length > 0 ? stunUrls : DEFAULT_STUN_URLS;
  if (effectiveStunUrls.length > 0) {
    servers.push({ urls: effectiveStunUrls });
  }

  const turnUrls = parseCsv(getPublicEnv("VITE_TURN_URLS"));
  const turnUsername = getPublicEnv("VITE_TURN_USERNAME");
  const turnCredential = getPublicEnv("VITE_TURN_CREDENTIAL");
  if (turnUrls.length > 0 && turnUsername && turnCredential) {
    servers.push({
      urls: turnUrls,
      username: turnUsername,
      credential: turnCredential,
    });
  }

  return dedupeServers(servers);
};
