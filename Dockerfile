# 1. Use Node.js version 20 as the base image
FROM node:20

# 2. Create app working directory
WORKDIR /usr/src/app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the source code
COPY . .

# 5. Expose the port the app runs on
EXPOSE 5000

# 6. Command to start the app
CMD [ "node", "src/index.js" ]
