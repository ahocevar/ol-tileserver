FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:20-alpine AS final

RUN apk add --no-cache chromium ca-certificates
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

WORKDIR /app
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/index.js ./
COPY package.json .
COPY package-lock.json .
RUN npm ci --omit-dev
CMD ["npm", "start"]
