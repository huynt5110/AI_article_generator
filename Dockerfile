# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Install all dependencies (including dev dependencies for build)
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/
RUN npm ci

# Copy application code
COPY . .

# Generate Prisma client and build
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate
RUN npm run build

# Stage 2: Install production dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev

RUN npx prisma generate

# Stage 3: Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules and built application
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main"]
