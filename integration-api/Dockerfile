FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

COPY server.js ./

EXPOSE 3333

CMD ["npm", "start"]
