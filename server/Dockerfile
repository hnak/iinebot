# ベースイメージを指定
FROM node:10.14-alpine

# 環境変数設定
ENV NODE_ENV="development"

# 作業ディレクトリ作成&設定
WORKDIR /server

COPY . .
RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
    
RUN yarn install

CMD ["yarn", "start"]