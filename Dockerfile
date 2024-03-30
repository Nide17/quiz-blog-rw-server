FROM node:alpine

ENV PORT 3000

WORKDIR /app

# install dependencies
COPY package*.json ./
COPY package-lock.json ./
RUN npm install

# Copy source files
COPY . ./

# Start the app
RUN npm start

# The port that this container will listen to
EXPOSE 3000

# Set the environment variables
ENV PORT=3000
ENV MONGO_URI=MONGO_URI

# Running the app
CMD [ "node", "server.js" ]