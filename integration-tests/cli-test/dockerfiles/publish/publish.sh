#!/bin/sh
cd /usr/src/m2c2kit
npm set registry http://registry:4873/
# npm requires an authToken header, even if it's not used.
# see https://github.com/verdaccio/verdaccio/issues/212
npm config set //registry:4873/:_authToken="none"

npm publish -w @m2c2kit/core &
npm publish -w @m2c2kit/session &
npm publish -w @m2c2kit/addons &
npm publish -w @m2c2kit/physics &
npm publish -w @m2c2kit/survey &
npm publish -w @m2c2kit/cli &
npm publish -w @m2c2kit/schematics &
npm publish -w @m2c2kit/build-helpers &
npm publish -w @m2c2kit/schema-util &
npm publish -w @m2c2kit/assessment-cli-starter &
npm publish -w @m2c2kit/assessment-color-dots &
npm publish -w @m2c2kit/assessment-grid-memory &
npm publish -w @m2c2kit/assessment-symbol-search &
npm publish -w @m2c2kit/assessment-color-shapes &

wait

echo "npm publish to container registry complete: @m2c2kit/core, \
@m2c2kit/session, @m2c2kit/addons, @m2c2kit/physics, @m2c2kit/survey, \
@m2c2kit/cli, @m2c2kit/schematics, @m2c2kit/build-helpers, \
@m2c2kit/schema-util, @m2c2kit/assessment-color-dots, \
@m2c2kit/assessment-color-shapes, @m2c2kit/assessment-grid-memory, \
@m2c2kit/assessment-symbol-search, @m2c2kit/assessment-cli-starter"

# let the verdaccio registry settle down for a few seconds
sleep 5

# messages the testapp and testmodule containers to let them know that the packages have been published
# and they can now install m2c2kit packages
echo -n "packages-published" | nc -q 0 testapp 80
echo -n "packages-published" | nc -q 0 testmodule 80

sleep 100000
