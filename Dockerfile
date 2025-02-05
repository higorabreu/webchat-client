# Development Stage: Use Node.js 18 on Alpine Linux for Angular development
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy project configuration files to install dependencies
COPY package.json package-lock.json ./

# Install project-specific dependencies
RUN npm i

# Copy the full frontend source code into the container
COPY . .

# Expose port 4200 for the Angular development server
EXPOSE 4200

# Run the Angular development server in the container
CMD ["npm", "start", "--", "--host", "0.0.0.0"]