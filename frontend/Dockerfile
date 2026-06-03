# Base node image
FROM node:20-alpine

WORKDIR /app

# Copy dependency mappings and install packages
COPY package*.json ./
RUN npm install

# Copy source code and config files
COPY . .

# Set build-time variable for public client APIs
ENV NEXT_PUBLIC_API_URL=http://localhost:8080

# Build Next.js production bundle
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
