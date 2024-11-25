# Originally was FROM node:xx, but in order to use Playwright in cli-test,
# we need ubuntu:noble
# based on https://github.com/microsoft/playwright/blob/main/utils/docker/Dockerfile.noble
FROM ubuntu:noble
# === INSTALL Node.js ===
RUN apt-get update && \
    # Install Node.js
    apt-get install -y curl wget gpg ca-certificates && \
    mkdir -p /etc/apt/keyrings && \
    curl -sL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" >> /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs && \
    # Feature-parity with node.js base images.
    apt-get install -y --no-install-recommends git openssh-client && \
    apt-get install -y netcat-openbsd && \
    npm install -g yarn && \
    # clean apt cache
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/m2c2kit

COPY . .

ENV NODE_OPTIONS=--max_old_space_size=4096

RUN npm ci
RUN npx playwright install --with-deps chromium

# Outside of a container, the next two lines are not needed. When running in
# this container, however, we need to build the schema-util package and
# install it in the monorepo root beforehand for schema-util to be found and
# executed. Otherwise, we get an error "could not determine executable to run"
# when running npm scripts that use schema-util as part of the overall
# monorepo build. This may be related to issues when running npm commands as
# root, see https://github.com/npm/cli/issues/3773 and
# https://github.com/npm/rfcs/issues/546
RUN npm run build -w @m2c2kit/schema-util
RUN npm install -E -D @m2c2kit/schema-util

RUN npm run build
RUN npm test
RUN chmod +x scripts/wait-for-it.sh

CMD ["/bin/bash"]
