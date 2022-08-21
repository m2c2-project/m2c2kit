# ios-simple-webview

This demonstrates how the m2c2kit assessments can be used in a native iOS app. All the m2c2kit resources are included within the iOS app and does not require a network connection. This iOS app will run the same assessments as in `/packages/assessments-demo`.

To build, make sure that `npm run build` was previously executed from the m2c2kit repository root, which built the JavaScript assessment code for webviews in `/packages/assessments-demo`. This Xcode project will directly copy the files from `/packages/assessments-demo/dist-webview`.
