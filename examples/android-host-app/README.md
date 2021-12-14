# android-host-app

This app is an example of how cognitive tasks using the m2c2kit engine can be hosted in a webview. This example works in conjunction with the demo-server.

## Quick start

After the `@m2c2kit/cli` package is installed globally:

```
m2 new myapp
cd myapp
npm run build
m2 upload
```

When running `m2 upload` for the first time, it will ask for the demo server url. Currently it is running at `https://m2c2-demo-server.azurewebsites.net`. You will also need to provide a username and password.

When finished, it will say something similar to:

```
Study can be viewed with browser at https://m2c2-demo-server.azurewebsites.net/studies/AAUU2
```

Record the 5 digit study code (e.g., AAUU2). When the Android app starts, enter the server URL and study code in the address bar using the format `SERVER-WITHOUT-HTTPS/STUDYCODE` and click LOAD. This will download study resources from the server and save them. After loading, internet access can be removed, and the webview will use the saved resources.

**Important!** With the above example:

- In the the Android app, enter `m2c2-demo-server.azurewebsites.net/AAUU2` (note the lack of `https://` and `/studies/`)
- For viewing via a browser, enter `https://m2c2-demo-server.azurewebsites.net/studies/AAUU2`
