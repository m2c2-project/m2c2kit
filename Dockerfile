FROM node:16.13.1

WORKDIR /usr/src/m2c2kit

COPY . .

RUN npm install
RUN npm run build -w @m2c2kit/build-helpers
RUN npm run build -w @m2c2kit/core
RUN npm run build -w @m2c2kit/addons
RUN npm run build -w @m2c2kit/sage-research
RUN npm run build -w @m2c2kit/cli

RUN npm run build -w @m2c2kit/assessment-cli-starter
RUN npm run build -w @m2c2kit/assessment-color-dots
RUN npm run build -w @m2c2kit/assessment-grid-memory
RUN npm run build -w @m2c2kit/assessment-symbol-search

CMD ["/bin/bash"]
