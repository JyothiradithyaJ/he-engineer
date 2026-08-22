FROM node:22.5.0-slim
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .
RUN mkdir -p data
EXPOSE 5000
CMD ["node", "server.js"]
