# Build stage (Node 24 LTS)
FROM node:24-bookworm-slim AS builder

WORKDIR /app

# API URL for browser (when running via docker-compose, backend is at host:9559)
ARG VITE_API_URL=http://localhost:9559/api
ENV VITE_API_URL=$VITE_API_URL

# Install deps (no lockfile required)
COPY package.json ./
RUN npm install

# Copy app source and build
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
