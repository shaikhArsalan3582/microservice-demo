FROM node:18-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

ENV NODE_ENV=development

CMD ["node", "server.js"]
