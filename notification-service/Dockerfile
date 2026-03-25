FROM node:18
WORKDIR /app
COPY notification-service/package*.json ./
RUN npm install
COPY ../shared ./shared
COPY notification-service .
CMD ["node", "server.js"]