FROM node:18

WORKDIR /usr/src/m2c2kit

COPY . .

ENV NODE_OPTIONS=--max_old_space_size=4096

RUN npm ci
RUN npm run build
RUN npm test

CMD ["/bin/bash"]
