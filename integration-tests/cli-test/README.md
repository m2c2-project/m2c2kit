# cli integration tests

These tests are meant to run along with other services specified by `docker-compose.yml` to test the cli. From the repository root, execute `npm run integration-test`.

The `publish` service will publish the m2c2kit packages to a local npm registry running in the `registry` service. The `testapp` service will install the cli from the registry, create a test app with the cli, and serve the app. The `m2c2kit` service will run the tests in this package to control Playwright and check that the cli built an app that has a canvas of the correct size and that the first and second scenes match, pixel for pixel, what is expected.
