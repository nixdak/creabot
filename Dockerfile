FROM node:6-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
ADD . /usr/src/app/
RUN apk add --no-cache git build-base file nasm autoconf libpng-dev openssl &&\
    yarn
VOLUME /usr/src/app/plugin_code/bookclub/config /usr/src/app/plugin_code/poping/config
CMD yarn start
