#!/bin/sh
cd /usr/src/m2c2kit
npm set registry http://registry:4873/
# npm requires an authToken header, even if it's not used.
# see https://github.com/verdaccio/verdaccio/issues/212
npm config set //registry:4873/:_authToken="none"

npm publish -w @m2c2kit/core &
npm publish -w @m2c2kit/addons &
npm publish -w @m2c2kit/cli &
npm publish -w @m2c2kit/build-helpers &

wait

echo "npm publish to container registry complete: @m2c2kit/core, @m2c2kit/addons, @m2c2kit/cli, @m2c2kit/build-helpers"