# ==============================================================================
# STAGE 1: Build Expo SDK 57 React Native Web Static Bundle
# ==============================================================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy dependency locks and project manifest
COPY package.json bun.lock app.json tsconfig.json ./

# Install dependencies using Bun
RUN bun install --frozen-lockfile

# Copy source tree and static assets
COPY . .

# Set production environment variables for web compilation
ENV EXPO_PUBLIC_API_URL=/api
ENV EXPO_PUBLIC_WS_URL=/ws
ENV EXPO_PUBLIC_APP_ENV=production
ENV CI=true

# Export static production bundle
RUN bunx expo export --platform web

# ==============================================================================
# STAGE 2: Nginx Edge Web Server for Production Distribution
# ==============================================================================
FROM nginx:alpine AS runner

# Remove default static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built mobile web static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy production Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
