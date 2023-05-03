// // if we want to mock an actual counter,
// // see https://stackoverflow.com/a/57825692
// //global.performance = require("perf_hooks").performance;

// // The below was needed after I set testEnvironment: "jsdom"
// // see https://github.com/inrupt/solid-client-authn-js/issues/1676
// import { TextEncoder, TextDecoder } from "util";

// declare global {
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore
//   let TextEncoder: typeof TextEncoder;
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore
//   let TextDecoder: typeof TextDecoder;
// }

// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
// globalThis.TextEncoder = TextEncoder;
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
// globalThis.TextDecoder = TextDecoder;
