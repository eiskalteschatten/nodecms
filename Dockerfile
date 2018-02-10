FROM node:9-alpine

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

WORKDIR /app

RUN npm install

COPY . /app

CMD ["npm", "run", "start:prod"]
