FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY common/package*.json ./common/

RUN npm install --workspace backend --workspace common

COPY common ./common
COPY backend ./backend

WORKDIR /app/backend

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start"]