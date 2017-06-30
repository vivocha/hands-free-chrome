FROM ubuntu:trusty

# Use bash
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# install basic tools
RUN apt-get update && apt-get install -y curl wget python make g++ && apt-get -y autoclean

# nvm environment variables
ENV NVM_DIR /usr/local/nvm
# change Node.js versione here, if required
ENV NODE_VERSION 8.1.3

# install nvm
# https://github.com/creationix/nvm#install-script
RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash

# install Node.js 
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# add node and npm to PATH
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# install Chrome, latest version to use headless feature
RUN apt-get install -y gconf-service libasound2 libatk1.0-0 libcairo2 libcups2 libfontconfig1 libfreetype6 libgconf-2-4 libgdk-pixbuf2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libx11-xcb1 libxcomposite1 libxdamage1 libxcursor1 libxfixes3 libxss1 fonts-liberation libappindicator1 libnss3 xdg-utils
RUN curl https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb --output google-chrome-stable_current_amd64.deb
RUN dpkg --force-depends-version -i ./google-chrome-stable_current_amd64.deb
RUN rm google-chrome-stable_current_amd64.deb

# test node installation
RUN node -v
RUN npm -v

# Copy src/dist code and install required packages
COPY . /usr/src/app
RUN rm -rf node_modules && npm i

# Run API server, change exposed port and PORT env var if required
EXPOSE 8000
ENV NODE_ENV production 
ENV PORT 8000 
CMD [ "node", "./dist/api" ]



