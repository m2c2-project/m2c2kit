FROM node:16.14

WORKDIR /usr/src/packages

COPY . .

# Configure package.json to use the packages we just built on the local filesystem, and not pull from npm
RUN sed -i 's|"@m2c2kit/core": ".*"|"@m2c2kit/core": "file:/usr/src/packages/core"|' /usr/src/packages/cli/templates/package.json.handlebars
RUN sed -i 's|"@m2c2kit/addons": ".*"|"@m2c2kit/addons": "file:/usr/src/packages/addons"|' /usr/src/packages/cli/templates/package.json.handlebars
RUN sed -i 's|"@m2c2kit/core": ".*"|"@m2c2kit/core": "file:/usr/src/packages/core"|' /usr/src/packages/addons/package.json

WORKDIR /usr/src/packages/cli
RUN npm install
RUN npm run build

WORKDIR /usr/src/packages/core
RUN npm install
RUN npm run build

WORKDIR /usr/src/packages/addons
RUN npm install
RUN npm run build

WORKDIR /usr/src/packages/cli
RUN npm install -g .

WORKDIR /usr
RUN m2 new testApp

WORKDIR /usr/testApp
# localhost did not work in container on windows host, but 0.0.0.0 did
RUN sed -i 's|host: "localhost"|host: "0.0.0.0"|' rollup.config.js
# Because we used local pacakge of @m2c2kit/core, canvaskit-wasm was installed there
# Copy it to where it is expected by our rollup configuration
RUN cp -r /usr/src/packages/core/node_modules/canvaskit-wasm /usr/testApp/node_modules

# 3000 is our dev http server; 35729 is for the livereload script
EXPOSE 3000 35729

CMD ["npm", "run", "serve"]
