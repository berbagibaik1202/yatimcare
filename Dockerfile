FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json backend/

RUN npm ci
RUN npm --prefix backend ci

COPY . .

RUN npm run build:release

FROM node:22-alpine AS runtime

WORKDIR /app/release/backend

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

COPY --from=build /app/release /app/release

EXPOSE 4000

CMD ["node", "server.js"]
