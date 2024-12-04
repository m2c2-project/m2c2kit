FROM node:22

WORKDIR /usr/src

RUN apt-get update && apt-get install -y netcat-traditional

COPY testapp.sh /usr/local/bin/testapp.sh
RUN chmod +x /usr/local/bin/testapp.sh

# 3000 is our dev http server; 35729 is for the livereload script
# 80 is listening for the "packages-published" message
EXPOSE 3000 35729 80

CMD testapp.sh
