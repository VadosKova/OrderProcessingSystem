FROM node:18
WORKDIR /app
COPY order-status-updater/package*.json ./
RUN npm install
COPY ../shared ./shared
COPY order-status-updater .
CMD ["node", "server.js"]