# android-simple-webview

This demonstrates how the m2c2kit assessments can be used in a native Android app. All the m2c2kit resources are included within the Android app and does not require a network connection. This Android app will run the same assessments as in `/packages/assessments-demo`.

To build, the bundled m2c2kit JavaScript code (and other assets) must be in the `app/src/main/assets` folder. This will be taken care of by the build process because:

1. `npm run build` was previously executed from the m2c2kit repository root, which built the JavaScript assessment code for webviews in `/packages/assessments-demo`.
2. The `app/build.gradle` file specifies that the `/packages/assessments-demo/dist-webview` folder will be copied to the `app/src/main/assets` folder.
