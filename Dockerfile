FROM node:alpine

ENV PORT 3000

WORKDIR /app

# install dependencies
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install

# Copy source files
COPY . ./

# Start the app
RUN yarn start

# The port that this container will listen to
EXPOSE 3000

# Set the environment variables
ENV PORT=3000
ENV MONGO_URI=MONGO_URI

# Running the app
CMD [ "node", "server.js" ]