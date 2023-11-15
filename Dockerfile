# Originally was FROM node:xx, but in order to use Playwright in cli-test,
# we need ubuntu:jammy
# based on https://github.com/microsoft/playwright/blob/main/utils/docker/Dockerfile.jammy
FROM ubuntu:jammy
# === INSTALL Node.js ===
RUN apt-get update && \
    # Install Node.js
    apt-get install -y curl wget gpg ca-certificates && \
    mkdir -p /etc/apt/keyrings && \
    curl -sL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" >> /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs && \
    # Feature-parity with node.js base images.
    apt-get install -y --no-install-recommends git openssh-client && \
    npm install -g yarn && \
    # clean apt cache
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/m2c2kit

COPY . .

ENV NODE_OPTIONS=--max_old_space_size=4096

RUN npm ci
RUN npx playwright install --with-deps chromium
RUN npm run build
RUN npm test
RUN chmod +x scripts/wait-for-it.sh

CMD ["/bin/bash"]
