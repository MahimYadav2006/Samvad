# 1️⃣ Base image — lightweight Node.js
FROM node:18-alpine

# 2️⃣ Create and set working directory inside container
WORKDIR /app

# 3️⃣ Copy only package files first (for better caching)
COPY package*.json ./

# 4️⃣ Install dependencies
RUN npm ci --only=production

# 5️⃣ Copy the rest of your backend source code
COPY . .

# 6️⃣ Expose backend port
EXPOSE 8000

# 7️⃣ Define environment variable
ENV NODE_ENV=production
ENV PORT=8000

# 8️⃣ Start the backend server
CMD ["node", "server.js"]
