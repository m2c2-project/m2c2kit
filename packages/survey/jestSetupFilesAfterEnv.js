// if we want to mock an actual counter,
// see https://stackoverflow.com/a/57825692
//global.performance = require("perf_hooks").performance;

// The below was needed after I set testEnvironment: "jsdom"
// see https://github.com/inrupt/solid-client-authn-js/issues/1676
const util = require("util");
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;
