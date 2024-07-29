FROM node:20-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

RUN pnpm install

COPY . .

RUN pnpm build

FROM node:20-alpine

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# chmod the file, otherwise it cannot be excecuted
COPY startup.sh ./startup.sh
USER root
RUN chmod +x ./startup.sh

# Make sure to save your bash file in UNIX format
ENTRYPOINT ["sh","./startup.sh"]
