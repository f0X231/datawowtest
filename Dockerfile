FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx nx build api --configuration=production

# ─── Production image ────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist/backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist/backend .

EXPOSE 3000

CMD ["node", "main.js"]
