FROM node:20

WORKDIR /usr/src

COPY testapp.sh /usr/local/bin/testapp.sh
RUN chmod +x /usr/local/bin/testapp.sh

# 3000 is our dev http server; 35729 is for the livereload script
EXPOSE 3000 35729

CMD testapp.sh
