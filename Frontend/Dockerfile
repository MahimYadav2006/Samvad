# ── Stage 1: Build the Vite/React app ─────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install all dependencies (devDeps needed for the build)
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# Copy source (includes .env so Vite can inline VITE_* vars)
COPY . .

# Allow overriding the backend URL at build time
ARG VITE_BACKEND_URL=http://localhost:8000
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default nginx site
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom config and built assets
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
