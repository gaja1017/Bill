# Build stage for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Install Node.js for Next.js server and supervisor
RUN apt-get update && apt-get install -y \
    curl \
    supervisor \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY backend/ ./backend/
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend standalone build
WORKDIR /app/frontend
COPY --from=frontend-builder /app/frontend/.next/standalone ./
COPY --from=frontend-builder /app/frontend/.next/static ./.next/static
COPY --from=frontend-builder /app/frontend/public ./public

# Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create log directory
RUN mkdir -p /var/log/supervisor

WORKDIR /app

# Hugging Face Spaces uses port 7860
EXPOSE 7860

# Start both services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
