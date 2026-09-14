FROM node:22-alpine
ENV CI=true
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install --ignore-scripts
EXPOSE 3000
CMD ["pnpm", "dev", "--host"]
