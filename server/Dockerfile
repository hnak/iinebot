# ベースイメージを指定
FROM node:10.14-alpine

# 環境変数設定
ENV NODE_ENV="development"

# 作業ディレクトリ作成&設定
WORKDIR /server

RUN apk add --no-cache --virtual .gyp python make g++ \
    && apk --no-cache add avahi-dev \
    && yarn add mdns \
    && apk del .gyp
    
RUN apk update && apk upgrade && \
    apk add --no-cache git

COPY . .
RUN yarn install
CMD ["yarn", "start"]