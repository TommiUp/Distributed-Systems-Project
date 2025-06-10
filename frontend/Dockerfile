# frontend/Dockerfile

# ───────────────────────
# 1) Build stage
# ───────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Accept NEXT_PUBLIC_* as build-time args
ARG NEXT_PUBLIC_AUTH_HOST
ARG NEXT_PUBLIC_HUB_HOST
ARG NEXT_PUBLIC_CHAT_HOST

# Export them so `next build` can see process.env.NEXT_PUBLIC_… 
ENV NEXT_PUBLIC_AUTH_HOST=$NEXT_PUBLIC_AUTH_HOST
ENV NEXT_PUBLIC_HUB_HOST=$NEXT_PUBLIC_HUB_HOST
ENV NEXT_PUBLIC_CHAT_HOST=$NEXT_PUBLIC_CHAT_HOST

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy everything (including pages/, public/, etc.)
COPY . .

# Build Next.js for production (will embed NEXT_PUBLIC_… into the build)
RUN npm run build

# ───────────────────────
# 2) Run stage
# ───────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only the optimized production output from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose Next.js’s default port
ENV PORT=3000
EXPOSE 3000

# Start the Next.js server (this comes with the “standalone” build)
CMD ["node", "server.js"]
