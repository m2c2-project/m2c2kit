FROM node:16.17.0

WORKDIR /usr/src/m2c2kit

COPY . .

RUN npm install concurrently --location=global
RUN npm install

RUN concurrently "npm run build -w @m2c2kit/build-helpers" "npm run build -w @m2c2kit/core" "npm run build -w @m2c2kit/cli"
RUN concurrently "npm run build -w @m2c2kit/addons" "npm run build -w @m2c2kit/survey" "npm run build -w @m2c2kit/sage-research" "npm run build -w @m2c2kit/db"
RUN concurrently "npm run build -w @m2c2kit/assessment-cli-starter" "npm run build -w @m2c2kit/assessment-color-dots" "npm run build -w @m2c2kit/assessment-color-shapes" "npm run build -w @m2c2kit/assessment-grid-memory" "npm run build -w @m2c2kit/assessment-symbol-search"
RUN concurrently "npm run build -w @m2c2kit/assessments-demo" "npm run build-webview -w @m2c2kit/assessments-demo"

CMD ["/bin/bash"]
