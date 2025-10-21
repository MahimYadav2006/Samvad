# Stage 1: Build the Vite app
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependencies and install
COPY package*.json ./
RUN npm ci

# Copy all source code
COPY . .

# Build production output
RUN npm run build


# Stage 2: Serve with Nginx on port 5173
FROM nginx:alpine

# Copy the built Vite app to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom Nginx config to serve on port 5173
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
