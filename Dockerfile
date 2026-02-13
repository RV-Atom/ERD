# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built assets and server code
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# Ensure projects directory exists
RUN mkdir -p projects

EXPOSE 8085

CMD ["node", "server/index.js"]
