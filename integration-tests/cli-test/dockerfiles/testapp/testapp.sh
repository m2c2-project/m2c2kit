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

# m2 new requires git to be configured
git config --global init.defaultBranch main
git config --global user.email "ci@example.com"
git config --global user.name "ci"

m2 new testapp
cd testapp
# Must bind to 0.0.0.0 to be accessible from another container running the tests
sed -i 's|host: "localhost"|host: "0.0.0.0"|' rolldown.config.mjs
npm run serve
