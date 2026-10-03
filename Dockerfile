FROM node:20-bookworm-slim AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci

FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY tsconfig.json ./
COPY proxy.ts ./
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY public ./public

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
COPY package*.json ./
COPY next.config.ts ./
COPY proxy.ts ./

EXPOSE 3000

CMD ["npm", "run", "start"]

