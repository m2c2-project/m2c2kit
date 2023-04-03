FROM node:18.15.0

WORKDIR /usr/src/m2c2kit

COPY . .

RUN npm install
RUN npm run build
RUN npm test

CMD ["/bin/bash"]
