# ## Start app locally: open [Start instructions](../README_START.md) in VS Code Markdown preview and click the launcher link
# FROM node:14-alpine
# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install
# COPY . .
# EXPOSE 3000
# CMD ["npm", "run", "dev"]

#TEST DEBUG

FROM node:18-alpine

WORKDIR /app

# Copy package files from the current folder (which is /frontend)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend application files
COPY . .

# CRITICAL: Pull the Railway variable into the Docker build environment
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Build the Next.js production app with the variable baked in
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]