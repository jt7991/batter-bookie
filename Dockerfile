# Stage 1: Build the application
# Use the official Bun image as the base for the build stage.
FROM oven/bun:1 as builder

# Set the working directory inside the container.
WORKDIR /app

# Copy the package.json and bun.lock files to leverage Docker layer caching.
# This ensures that dependencies are re-installed only when these files change.
COPY package.json bun.lock ./

# Install project dependencies.
RUN bun install

# Copy the rest of the application source code.
COPY . .

# Build the Tanstack application.
# The output will typically be in a .output directory (common for Nuxt/Tanstack builds).
RUN bun run build

# --- DEBUGGING STEP ---
# List the contents of the .output directory to verify build artifacts.
# This helps confirm if .output/server/index.mjs is being generated.
RUN ls -laR .output
# --- END DEBUGGING STEP ---

# Stage 2: Create the production-ready image
# Use a fresh, official Bun image for the final production image.
# This keeps the final image size minimal by excluding build-time dependencies.
FROM oven/bun:1

# Set the working directory for the production application.
WORKDIR /app

# Copy only the necessary production assets from the builder stage.
# This includes the build output (e.g., .output/server/index.mjs, .output/public),
# and the package.json/bun.lock for production dependency installation.
COPY --from=builder /app/.output /.output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock

# Install only production dependencies.
RUN bun install --production --frozen-lockfile

# Expose the port that your Tanstack application will listen on.
# Tanstack (and Nuxt) often defaults to port 3000.
EXPOSE 3000

# Define the command to start the application when the container launches.
# We are now telling Bun to execute the "start" script defined in package.json.
# This is generally the correct approach for Bun/Node.js applications.
CMD ["bun", "run", "start"]

