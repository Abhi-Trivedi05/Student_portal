FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/build ./build
COPY --from=build /app/src ./src
COPY --from=build /app/routes ./routes
COPY --from=build /app/models ./models
COPY --from=build /app/database ./database
COPY --from=build /app/middleware ./middleware

EXPOSE 5000
CMD ["node", "src/server.js"]
