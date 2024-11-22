# Frontend Dockerfile
FROM node:lts-alpine

WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN corepack enable && \
    corepack prepare yarn@stable --activate && \
    yarn

# Copy the rest of the frontend code
COPY . .

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at build time
ENV NEXT_TELEMETRY_DISABLED 1

# Start Next.js in development mode
RUN yarn dev
