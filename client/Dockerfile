FROM node:20-alpine

ENV NODE_ENV=development
ENV HOST=0.0.0.0

WORKDIR /app

COPY package*.json ./

RUN npm install --force

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]
