const JWT_TOKEN_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

export const sanitizeToken = (token) => {
  if (typeof token !== "string") return null;
  const normalized = token.trim();
  if (!normalized) return null;
  if (normalized.toLowerCase() === "null") return null;
  if (normalized.toLowerCase() === "undefined") return null;
  return normalized;
};

export const isJwtToken = (token) => {
  const normalized = sanitizeToken(token);
  return Boolean(normalized && JWT_TOKEN_REGEX.test(normalized));
};

export const toBearerHeader = (token) => {
  const normalized = sanitizeToken(token);
  if (!normalized) return null;
  return `bearer ${normalized}`;
};
