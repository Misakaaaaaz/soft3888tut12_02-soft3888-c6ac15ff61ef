FROM node:lts-alpine AS base

# All deps stage
FROM base AS deps
WORKDIR /app
ADD package.json ./
RUN corepack enable && \
    corepack prepare yarn@stable --activate && \
    yarn

# Production only deps stage
FROM base AS production-deps
WORKDIR /app
ADD package.json ./
ENV NODE_ENV=production
RUN corepack enable && \
    corepack prepare yarn@stable --activate && \
    yarn

# Build stage
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
RUN corepack enable && \
    corepack prepare yarn@stable --activate && \
    yarn build

# Production stage
FROM base
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app

CMD ["node", "./bin/server.js"]
