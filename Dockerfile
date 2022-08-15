FROM node:16.16.0

WORKDIR /usr/src/m2c2kit

COPY . .

RUN npm install -g concurrently
RUN npm install

RUN concurrently "npm run build -w @m2c2kit/build-helpers" "npm run build -w @m2c2kit/core" "npm run build -w @m2c2kit/cli"
RUN concurrently "npm run build -w @m2c2kit/addons" "npm run build -w @m2c2kit/sage-research"
RUN concurrently "npm run build -w @m2c2kit/assessment-cli-starter" "npm run build -w @m2c2kit/assessment-color-dots" "npm run build -w @m2c2kit/assessment-grid-memory" "npm run build -w @m2c2kit/assessment-symbol-search"

CMD ["/bin/bash"]
