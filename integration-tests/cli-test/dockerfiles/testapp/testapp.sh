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

m2 new testapp
cd testapp
# localhost did not work in container on windows host, but 0.0.0.0 did
sed -i 's|host: "localhost"|host: "0.0.0.0"|' rollup.config.mjs
npm run serve
