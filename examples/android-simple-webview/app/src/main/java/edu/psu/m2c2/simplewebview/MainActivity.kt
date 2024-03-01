package edu.psu.m2c2.simplewebview

import android.annotation.SuppressLint
import android.content.Context
import android.net.Uri
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.webkit.*
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat

class MainActivity : AppCompatActivity() {
    private val tag = "simplewebview"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val webView: WebView = findViewById(R.id.webView)
        webView.webViewClient = WebViewClient()
        webView.settings.apply {
            javaScriptEnabled = true
        }

        /** Instantiate the JavaScript WebView-to-native interop interface and set the context
         * This class is how the native android app can
         * 1) receive data from the WebView
         * 2) know when the m2c2kit activities (games/surveys) and sessions are ended
         * The methods within this interface are directly called by the javascript code. Look
         * for these methods in the javascript code to understand how this works:
         *   Android.onActivityResults(JSON.stringify(event)) or
         *   Android.onActivityLifecycle(JSON.stringify(event)) or
         *   Android.onSessionLifecycle(JSON.stringify(event))
         * see https://developer.android.com/guide/webapps/webview#BindingJavaScript
         *
         * Note: we're passing event data from JS to Android using JSON strings, but there's probably
         * a safer and more elegant way to deserialize these into well-defined object types as soon
         * as Android receives them?
         * */
        class M2c2Interface(private val mContext: Context) {

            @JavascriptInterface
            fun sessionManualStart(): Boolean {
                // if you want to control execution and custom game parameters, make sure
                // this returns true. Otherwise, the session will automatically start and
                // activities will run with default parameters (which you usually don't want)
                return true
            }

            @JavascriptInterface
            fun onSessionLifecycle(sessionLifecycleEventAsString: String) {
                Log.i(
                    tag,
                    "onSessionLifecycle callback from JavaScript received data: $sessionLifecycleEventAsString"
                )

                // webView.loadUrl("javascript: YOUR JAVASCRIPT CODE HERE") is how we can control the javascript execution
                // from Android once the html content loads.
                //
                // the m2c2 session has just initialized; we can set our custom activity parameters and start the session.
                // in our javascript code, we placed session on window, and thus we can control it from here with loadUrl()
                // (for type safety, we should deserialize this event string into an object, rather than this quick hack to
                // parse the raw json string and look for the initialized event)
                if (sessionLifecycleEventAsString.contains("SessionInitialize")) {
                    webView.post {
                        // use setParameters to override the activity's default parameters
                        // this is how we would take the parameters from a configuration json and insert them into the activities
                        // webView.loadUrl("javascript:window.m2c2kitSession.options.activities[0].setParameters({ TrialNum: 2 });")
                        webView.loadUrl("javascript:window.m2c2kitSession.start();")
                    }
                }

                // we could also check if the session lifecycle event is "ended" -- at which point we could take
                // all the data we've collected and save it to internal storage or post it somewhere, and close this
                // webview, e.g.,
                // if (sessionLifecycleEventAsString.contains("SessionEnd")) { ... }
            }

            @JavascriptInterface
            fun onActivityResults(activityResultsEventAsString: String) {
                // here is where we get data back from the javascript assessments
                // we should save them somewhere in a native data structure, so we can post them
                // when we get the session lifecycle ended event
                Log.i(
                    tag,
                    "onActivityResults callback from JavaScript received data: $activityResultsEventAsString"
                )
            }

            @JavascriptInterface
            fun onActivityLifecycle(activityLifecycleEventAsString: String) {
                Log.i(
                    tag,
                    "onActivityLifecycle callback from JavaScript received data: $activityLifecycleEventAsString"
                )
            }
        }

        // the name of this interface, "AndroidM2c2", must match the declared namespace in our
        // TypeScript code in the @m2c2kit/embedding package.
        webView.addJavascriptInterface(M2c2Interface(this), "AndroidM2c2")

        // see https://developer.android.com/guide/webapps/load-local-content for loading
        // WebView content from app assets
        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
        webView.webViewClient = LocalContentWebViewClient(assetLoader)
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html")

        // alternatively, if assets are not bundled in the app, comment out the lines above (from
        // val assetLoader... through webView.loadUrl()) and load the m2c2kit URL into the web view:
        // webView.loadUrl("https://<replace with the m2c2kit url>")
    }

    // below code is taken from https://developer.android.com/guide/webapps/load-local-content#assetloader
    private class LocalContentWebViewClient(private val assetLoader: WebViewAssetLoader) :
        WebViewClientCompat() {
        override fun shouldInterceptRequest(
            view: WebView,
            request: WebResourceRequest
        ): WebResourceResponse? {
            return assetLoader.shouldInterceptRequest(request.url)
        }

        // to support API < 21
        @Deprecated("Deprecated in Java")
        override fun shouldInterceptRequest(
            view: WebView,
            url: String
        ): WebResourceResponse? {
            return assetLoader.shouldInterceptRequest(Uri.parse(url))
        }
    }
}