FROM node:22

WORKDIR /usr/src

RUN apt-get update && apt-get install -y netcat-openbsd

COPY testmodule.sh /usr/local/bin/testmodule.sh
RUN chmod +x /usr/local/bin/testmodule.sh

# 8080 is where we'll serve the static site
# 80 is listening for the "packages-published" message
EXPOSE 8080 80

CMD testmodule.sh
