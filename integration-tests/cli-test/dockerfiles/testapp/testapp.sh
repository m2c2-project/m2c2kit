#!/bin/sh
npm set registry http://registry:4873/

contains() {  if    [ "$1" ] &&            # Is there a source string.
                    [ "$2" ] &&            # Is there a substring.
                    [ -z "${1##*"$2"*}" ]; # Test substring in source.
              then  echo 0;                # Print a "0" for a match.
              else  echo 1;                # Print a "1" if no match.
              fi;
            }
# Below was s="$(timeout 5 npm search @m2c2kit 2>&1)" but npm search results from verdaccio were not working as expected
# Instead use curl to search for packages using the verdaccio search endpoint, which returns a json object
s="$(timeout 5 curl http://registry:4873/-/v1/search?text=%40m2c2kit 2>&1)"
while [ $(contains "$s" "@m2c2kit/core") -eq 1 ] || [ $(contains "$s" "@m2c2kit/session") -eq 1 ] || [ $(contains "$s" "@m2c2kit/addons") -eq 1 ] || [ $(contains "$s" "@m2c2kit/cli") -eq 1 ] || [ $(contains "$s" "@m2c2kit/schematics") -eq 1 ] || [ $(contains "$s" "@m2c2kit/build-helpers") -eq 1 ]
do
    sleep 2
    s="$(timeout 5 curl http://registry:4873/-/v1/search?text=%40m2c2kit 2>&1)"
    echo "packages not yet published in container registry"
done
echo "container registry has @m2c2kit/core, @m2c2kit/session, @m2c2kit/addons, @m2c2kit/cli, @m2c2kit/schematics, @m2c2kit/build-helpers"

s="$(npm install -g @m2c2kit/cli 2>&1)"
while [ $(contains "$s" "ERR!") -eq 0 ]
do
    echo "published packages not yet ready in container registry"
    sleep 2
    s="$(npm install -g @m2c2kit/cli 2>&1)"    
done

git config --global init.defaultBranch main
git config --global user.email "ci@example.com"
git config --global user.name "ci"

m2 new testapp
cd testapp
# localhost did not work in container on windows host, but 0.0.0.0 did
sed -i 's|host: "localhost"|host: "0.0.0.0"|' rollup.config.mjs
npm run serve
sleep 100000