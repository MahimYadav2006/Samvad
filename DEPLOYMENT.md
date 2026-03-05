# Samvad Production Deployment (GitHub Actions + GHCR + Railway)

## 1. Target Architecture

```text
git push main
   -> GitHub Actions (lint + tests)
   -> Build Docker images
   -> Tag images as latest + commit SHA
   -> Push to GHCR
   -> Railway services track :latest and auto-redeploy
```

Images:

- `ghcr.io/<owner>/samvad-backend:latest`
- `ghcr.io/<owner>/samvad-backend:<commit-sha>`
- `ghcr.io/<owner>/samvad-frontend:latest`
- `ghcr.io/<owner>/samvad-frontend:<commit-sha>`

## 2. CI/CD Workflow

Workflow file: `.github/workflows/ci-cd.yml`

On every PR/push to `main`:

1. `backend-ci`
2. `frontend-ci`

On pushes to `main` only:

1. build backend image
2. build frontend image
3. push both images to GHCR with `latest` and `${{ github.sha }}`

## 3. Required GitHub Configuration

No custom registry credentials are needed inside Actions for GHCR push because `GITHUB_TOKEN` is used.

Repository settings to verify:

1. Actions enabled
2. Workflow permissions allow `Read and write permissions` for packages
3. Packages visibility (private/public) matches your Railway pull strategy

## 4. Railway Setup

Create two Railway services:

1. `samvad-backend`
2. `samvad-frontend`

Configure each service to deploy from image:

- backend image: `ghcr.io/<owner>/samvad-backend:latest`
- frontend image: `ghcr.io/<owner>/samvad-frontend:latest`

Enable automatic redeploy on new image digest for both services.

If GHCR packages are private, configure registry credentials in Railway with a GitHub token that has `read:packages`.

## 5. Runtime Environment Variables

### Backend Railway Variables

```env
NODE_ENV=production
PORT=8000
MONGO_URI=...
TOKEN_KEY=...
CORS_ORIGIN=https://<frontend-service>.up.railway.app
NODEMAILER_USER=...
NODEMAILER_APP_PASSWORD=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GOOGLE_CLIENT_ID=...
```

Notes:

- `CORS_ORIGIN` supports comma-separated origins.
- Set exact frontend URL(s), no trailing slash.

### Frontend Railway Variables

Frontend now loads public config at container startup from `runtime-config.js`.

```env
VITE_BACKEND_URL=https://<backend-service>.up.railway.app
VITE_GOOGLE_CLIENT_ID=...
VITE_STUN_URLS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
VITE_TURN_URLS=...
VITE_TURN_USERNAME=...
VITE_TURN_CREDENTIAL=...
VITE_WEBRTC_ICE_SERVERS=
VITE_GIPHY_API_KEY=...
```

## 6. Frontend ↔ Backend Connectivity

- API and Socket.IO both use `VITE_BACKEND_URL`.
- Backend Express CORS and Socket.IO CORS both use `CORS_ORIGIN`.
- Same allowlist policy is shared for HTTP + WebSocket transport.
- Railway TLS (`https://`) works with Socket.IO upgrade automatically.

## 7. Local Docker Compose

```bash
docker compose up --build
```

Default local URLs:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8000`

`docker-compose.yml` keeps local behavior intact and injects frontend runtime config through container env.

## 8. Rollback Strategy

To roll back, set Railway image tag to a previous commit SHA:

- `ghcr.io/<owner>/samvad-backend:<old-sha>`
- `ghcr.io/<owner>/samvad-frontend:<old-sha>`

## 9. Security Checklist

1. Keep `Backend/config.env` and `Frontend/.env` out of git.
2. Never place private secrets in `VITE_*` variables (they are public client-side).
3. Rotate any credentials/tokens that were ever shared in plain text.
