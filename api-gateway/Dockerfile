FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ../shared ./shared
COPY api-gateway .
CMD ["node", "server.js"]