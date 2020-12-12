FROM node:alpine

WORKDIR /app
COPY package.json .
RUN npm install --only=prod
RUN npm install pm2 -g
RUN npm run build
COPY ./build .

CMD ["pm2-runtime","index.js"]