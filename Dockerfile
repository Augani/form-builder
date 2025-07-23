# ---- Build stage ----
FROM node:20-slim AS builder

# Install dependencies for canvas & Prisma generation
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Optional: install Prisma globally if CLI use needed
RUN npm install -g prisma

# Install app dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy app files
COPY . .

# Copy env
# COPY .env .env
ENV DATABASE_URL=postgresql://postgres:postgres@postgres:5432/snapform
ENV NEXTAUTH_URL=https://snapform.live
ENV NEXTAUTH_SECRET=LKSMdf943nnfii43nfd3ef0ewnfnd2we9

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build


# ---- Production stage ----
FROM node:20-slim AS runner

# Install minimal deps for PostgreSQL and canvas runtime
RUN apt-get update && apt-get install -y \
  postgresql-client \
  libcairo2 \
  libpango-1.0-0 \
  libjpeg62-turbo \
  libgif7 \
  librsvg2-2 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy built assets and configs
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package.json ./package.json

# Copy and make entrypoint script executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "start"]
