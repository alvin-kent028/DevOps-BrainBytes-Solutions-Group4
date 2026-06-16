## Start app locally: open [Start instructions](../README_START.md) in VS Code Markdown preview and click the launcher link
FROM node:14-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]