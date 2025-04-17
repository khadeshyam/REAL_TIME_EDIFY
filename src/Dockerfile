FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy backend source
COPY . .

# Build React app (inside /client)
WORKDIR /app/client
RUN npm install
RUN npm run build

# Move build to backend public directory (you must serve it from Express)
WORKDIR /app
RUN mkdir -p public && cp -r client/build/* public/

# Set environment variables (if needed)
ENV PORT=5000

EXPOSE 5000

# Start the Node.js server
CMD ["node", "server.js"]
