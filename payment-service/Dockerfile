FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ../shared ./shared
COPY payment-service .
CMD ["node", "server.js"]