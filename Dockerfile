# Use the official Bun image
FROM oven/bun:1 as base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1

WORKDIR /app

# Copy built assets from base stage
COPY --from=base /app/.output /.output
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/bun.lock ./bun.lock

# Install production dependencies only
RUN bun install --production

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", ".output/server/index.mjs"]

