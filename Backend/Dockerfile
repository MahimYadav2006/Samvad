# ── Backend Production Dockerfile ──────────────────────────────────
FROM node:22-alpine AS production

# Non-root user for security
RUN addgroup -S samvad && adduser -S samvad -G samvad

WORKDIR /app

# Install production dependencies (layer cached unless package files change)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source
COPY . .

# Own everything by the non-root user
RUN chown -R samvad:samvad /app
USER samvad

EXPOSE 8000

CMD ["node", "server.js"]
