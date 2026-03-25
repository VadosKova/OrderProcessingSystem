FROM node:18
WORKDIR /app
COPY api-gateway/package*.json ./
RUN npm install
COPY api-gateway .
CMD ["node", "server.js"]