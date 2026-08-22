# ==============================================================================
# STAGE 1: Build Vite React Production Bundle
# ==============================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json ./

# Install dependencies
RUN npm install --no-package-lock --no-audit --no-fund

# Copy source files
COPY . .

# Build production assets
ENV VITE_API_URL=/api
ENV VITE_WS_URL=/ws
RUN npm run build

# ==============================================================================
# STAGE 2: Nginx Web Server for Production Distribution
# ==============================================================================
FROM nginx:alpine AS runner

# Remove default static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built SPA assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy production Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
