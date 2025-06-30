# Stage 1: Build the application
FROM docker.io/oven/bun:1 as builder

# Set the working directory inside the container
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy the rest of the application source code
COPY . .

# Set permissions for the app directory
RUN chown -R bun:bun /app

# Switch to non-root user
USER bun

# Build the application
RUN bun run build

# List contents for debugging
RUN ls -laR .output

# Stage 2: Production image
FROM docker.io/oven/bun:1

WORKDIR /app

# Copy built assets and config files from builder
COPY --from=builder --chown=bun:bun /app/.output /.output
COPY --from=builder --chown=bun:bun /app/package.json ./package.json
COPY --from=builder --chown=bun:bun /app/bun.lock ./bun.lock

# Switch to non-root user
USER bun

# Install production dependencies
RUN bun install --production --frozen-lockfile

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", ".output/server/index.mjs"]

