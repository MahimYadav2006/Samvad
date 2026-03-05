const DEFAULT_DEV_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const normalizeOrigins = (value) =>
  String(value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const getAllowedOrigins = () => {
  const configuredOrigins = normalizeOrigins(process.env.CORS_ORIGIN);
  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  return DEFAULT_DEV_ORIGINS;
};

const isWildcardOriginEnabled = (allowedOrigins) =>
  allowedOrigins.includes("*");

const isOriginAllowed = (origin, allowedOrigins, allowWildcard) => {
  // Non-browser clients may omit Origin.
  if (!origin) {
    return true;
  }

  if (allowWildcard) {
    return true;
  }

  return allowedOrigins.includes(origin);
};

module.exports = {
  DEFAULT_DEV_ORIGINS,
  getAllowedOrigins,
  isWildcardOriginEnabled,
  isOriginAllowed,
};
