FROM node:18
WORKDIR /app
COPY order-service/package*.json ./
RUN npm install
COPY ../shared ./shared
COPY order-service .
CMD ["node", "server.js"]