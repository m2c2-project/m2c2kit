FROM node:18.13.0

WORKDIR /usr/src

COPY testapp.sh /usr/local/bin/testapp.sh
RUN chmod +x /usr/local/bin/testapp.sh

# 3000 is our dev http server; 35729 is for the livereload script
EXPOSE 3000 35729

RUN npm install -g npm@9.2.0

CMD testapp.sh
