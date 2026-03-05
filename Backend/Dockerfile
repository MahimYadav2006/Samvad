# ── Backend Production Dockerfile ──────────────────────────────────
FROM node:22-alpine AS production

# Non-root user for security
RUN addgroup -S samvad && adduser -S samvad -G samvad

WORKDIR /app

# Install production dependencies (layer cached unless package files change)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source (config.env excluded via .dockerignore)
COPY . .

# Own everything by the non-root user
RUN chown -R samvad:samvad /app
USER samvad

# Railway injects PORT at runtime; default to 8000 for local Docker
ENV NODE_ENV=production
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-8000}/healthz || exit 1

CMD ["node", "server.js"]
