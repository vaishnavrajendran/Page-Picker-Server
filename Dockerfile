FROM node:18-alpine

RUN addgroup app && adduser -S -R app app

USER app

WORKDIR /app

COPY package*.json ./

USER root

RUN chown -R app:app .

USER app

RUN npm install

COPY . .

EXPOSE 8080

CMD npm start