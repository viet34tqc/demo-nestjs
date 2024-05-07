FROM node:21

WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install -g pnpm

RUN pnpm install

COPY . .

RUN npx prisma generate

CMD ["pnpm", "start"]
