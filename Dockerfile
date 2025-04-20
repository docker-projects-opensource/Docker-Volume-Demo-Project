FROM node:16-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Create a directory for our persistent data
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]