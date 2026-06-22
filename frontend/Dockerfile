## Start app locally: open [Start instructions](../README_START.md) in VS Code Markdown preview and click the launcher link
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ENV NODE_ENV=production
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
