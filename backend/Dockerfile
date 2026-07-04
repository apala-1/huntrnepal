FROM node:20-alpine

WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of source
COPY . .

# Expose API port
EXPOSE 5000

CMD ["npm", "run", "dev"]