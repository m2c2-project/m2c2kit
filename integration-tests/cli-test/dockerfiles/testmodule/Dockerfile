FROM node:20

WORKDIR /usr/src

COPY testmodule.sh /usr/local/bin/testmodule.sh
RUN chmod +x /usr/local/bin/testmodule.sh

# 8080 is where we'll serve the static site
EXPOSE 8080

CMD testmodule.sh
