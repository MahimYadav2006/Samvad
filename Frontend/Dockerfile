# ── Stage 1: Build the Vite/React app ─────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install all dependencies (devDeps needed for the build)
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# Copy source
COPY . .

RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default nginx site
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom config and built assets
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/runtime-config.template.js /usr/share/nginx/html/runtime-config.template.js
COPY docker/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
