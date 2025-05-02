# STAGE 1 - Build
FROM node:18 as builder
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE 2 - Runtime
FROM node:18
WORKDIR /usr/app
COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /usr/app/dist ./dist
COPY --from=builder /usr/app/dist/ormconfig.docker.js ./dist/ormconfig.js

# Expose port
EXPOSE 8080

# Default command
CMD ["node", "dist/src/server.js"]
