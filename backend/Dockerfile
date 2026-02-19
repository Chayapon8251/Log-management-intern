FROM node:22-bookworm-slim

# อัปเดตและติดตั้ง OpenSSL ที่ Prisma ต้องการ
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .