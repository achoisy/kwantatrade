FROM node:alpine AS node

# Builder stage
FROM node AS builder
WORKDIR /app

COPY package.json ./
RUN npm install 
COPY . .

RUN npm run build

# Final stage
FROM node AS final

RUN mkdir -p /app/build
WORKDIR /app

COPY package.json ./
RUN npm install --only=prod

# Install pm2
RUN npm install pm2 -g
RUN pm2 install pm2-metrics

COPY --from=builder /app/build ./build

CMD ["pm2-runtime","./build/index.js"]