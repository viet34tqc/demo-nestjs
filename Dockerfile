FROM node:21

WORKDIR /app

COPY . .

EXPOSE 3000

RUN npm install -g pnpm

RUN pnpm install

RUN npx prisma generate

CMD ["pnpm", "start"]
