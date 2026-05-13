FROM node:20-alpine
ENV CI=true
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install
EXPOSE 3000
CMD ["pnpm", "dev", "--host"]
