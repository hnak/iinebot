# ベースイメージを指定
FROM node:10.14-alpine

# 環境変数設定
ENV NODE_ENV="development"

# 作業ディレクトリ作成&設定
WORKDIR /app

RUN apk add --no-cache --virtual .gyp python make g++ \
    && apk --no-cache add avahi-dev \
    && npm install mdns \
    && apk del .gyp

CMD ["sh", "-c", "pwd && ls -l && cd /app && yarn install && yarn start"]