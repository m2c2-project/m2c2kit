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
while [ $(contains "$s" "@m2c2kit/core") -eq 1 ] || [ $(contains "$s" "@m2c2kit/session") -eq 1 ] || [ $(contains "$s" "@m2c2kit/addons") -eq 1 ] || [ $(contains "$s" "@m2c2kit/cli") -eq 1 ] || [ $(contains "$s" "@m2c2kit/schematics") -eq 1 ] || [ $(contains "$s" "@m2c2kit/build-helpers") -eq 1 ] || [ $(contains "$s" "@m2c2kit/schema-util") -eq 1 ]
do
    sleep 2
    s="$(timeout 5 curl http://registry:4873/-/v1/search?text=%40m2c2kit 2>&1)"
    echo "packages not yet published in container registry"
done
echo "container registry has @m2c2kit/core, @m2c2kit/session, @m2c2kit/addons, @m2c2kit/cli, @m2c2kit/schematics, @m2c2kit/build-helpers, @m2c2kit/schema-util"

# sometimes, the packages will return in the search results but npm install will fail because the packages are not yet ready
# so we will retry npm install a few times. Typically only 1 retry is needed, but we will retry up to 10 times.
max_retries=10
retries=0
while [ $retries -lt $max_retries ]
do
    npm install -g @m2c2kit/cli
    exit_code=$?
    if [ $exit_code -eq 0 ]; then
        break
    fi
    echo "published packages not yet ready in container registry ('npm install -g @m2c2kit/cli' failed). Retrying..."
    sleep 2
    retries=$((retries + 1))
done

if [ $retries -ge $max_retries ]; then
    echo "Max retries reached for 'npm install -g @m2c2kit/cli'. Exiting."
    exit 1
fi

git config --global init.defaultBranch main
git config --global user.email "ci@example.com"
git config --global user.name "ci"

m2 new testapp
cd testapp
# localhost did not work in container on windows host, but 0.0.0.0 did
sed -i 's|host: "localhost"|host: "0.0.0.0"|' rollup.config.mjs
npm run serve
sleep 100000