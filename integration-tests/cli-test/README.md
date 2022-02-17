# cli integration tests

To run these tests:

1. Execute `docker-compose up` to bring up a container that serves a simple test app built with the cli as well as a container running selenium/standalone-chrome.
2. Execute `npm run test`.

These tests will check that the cli built an app that has a canvas of the correct size and that the first and second scenes match, pixel for pixel, what is expected.
