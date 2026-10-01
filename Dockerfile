FROM node:20-bookworm-slim AS deps

WORKDIR /app

COPY santa-ui/package*.json ./

RUN npm ci

FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY santa-ui/package*.json ./
COPY santa-ui/next.config.ts ./
COPY santa-ui/postcss.config.mjs ./
COPY santa-ui/tsconfig.json ./
COPY santa-ui/proxy.ts ./
COPY santa-ui/app ./app
COPY santa-ui/components ./components
COPY santa-ui/lib ./lib
COPY santa-ui/public ./public

RUN npm run build \
  && npm prune --omit=dev

FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY santa-ui/package*.json ./
COPY santa-ui/next.config.ts ./
COPY santa-ui/proxy.ts ./

EXPOSE 3000

CMD ["npm", "run", "start"]
