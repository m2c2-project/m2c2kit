#!/bin/sh

# Wait to receive message from publish container that m2c2kit packages have been published
while true; do
  message=$(nc -l -p 80)
  echo "Received message: $message"
  if [ "$message" = "packages-published" ]; then
    break
  fi
done

npm set registry http://registry:4873/

npm install -g @m2c2kit/cli

git config --global init.defaultBranch main
git config --global user.email "ci@example.com"
git config --global user.name "ci"

# npm requires an authToken header, even if it's not used.
# see https://github.com/verdaccio/verdaccio/issues/212
npm config set //registry:4873/:_authToken="none"

m2 new testmodule --module
cd testmodule
npm run build
sed -i 's|"private": true|"private": false|' package.json
npm publish

cd ..
mkdir static-site
cd static-site
cat <<EOF > site-config.mjs
export default {
  configVersion: "0.1.21",
  outDir: "./dist",
  assessments: [
    {
      name: "testmodule",
      versions: ">=1.0.0",
      registryUrl: "http://registry:4873",
      assessmentDependenciesRegistryUrl: "http://registry:4873",
    },
  ]  
};
EOF

m2 static-site --config=site-config.mjs
cd dist
npm install -g http-server
http-server