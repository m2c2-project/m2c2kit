package edu.m2c2.hostapp

import android.annotation.SuppressLint
import android.content.Context
import android.content.SharedPreferences
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.webkit.*
import androidx.webkit.WebViewAssetLoader
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.features.*
import io.ktor.client.features.json.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import kotlinx.coroutines.*
import java.io.File
import java.security.MessageDigest
import kotlin.coroutines.CoroutineContext
import android.widget.*
import androidx.annotation.RequiresApi

class MainActivity : AppCompatActivity(), CoroutineScope {
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Main
    private val mainActivityContext = this
    private val tag = "HostApp"
    private val client = HttpClient(CIO) {
        install(JsonFeature)
    }

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
         * This is how the native android app can
         * 1) receive data from the WebView
         * 2) know when the m2c2kit game and session is ended
         * The methods within this interface are directly called by the javascript code. Look
         * for these methods in the javascript code to understand how this works:
         *   Android.onActivityDataCreate(JSON.stringify(event)) or
         *   Android.onSessionLifecycleChange(JSON.stringify(event))
         * see https://developer.android.com/guide/webapps/webview#BindingJavaScript
         * */
        class M2c2Interface(private val mContext: Context) {

            @JavascriptInterface
            fun sessionManualStart(): Boolean {
                // if you want to control execution and custom game parameters, make sure
                // this returns true. Otherwise, the session will automatically start and
                // games will run with default parameters.
                return true;
            }

            @JavascriptInterface
            fun onSessionLifecycleChange(sessionLifecycleEventAsString: String) {
                Log.i(
                    tag,
                    "onSessionLifecycleChange callback from JavaScript received data: $sessionLifecycleEventAsString"
                )

                // the m2c2 session has just initialized; we can set our custom game parameters and start the session.
                // in our javascript code, we placed session on window, and thus we can control it from here with loadUrl()
                // (for type safety, we should deserialize this event string into an object, rather than try to parse the raw json string)
                if (sessionLifecycleEventAsString.contains("\"initialized\":true")) {
                    webView.post(Runnable {
                        // use setParameters to override the game's default parameters
                        // this is how we would take the parameters from a configuration json and insert them into the games
                        webView.loadUrl("javascript:window.session.options.activities[0].setParameters({ TrialNum: 2 });");
                        webView.loadUrl("javascript:window.session.start();");
                    })
                }
            }

            @JavascriptInterface
            fun onActivityDataCreate(activityDataEventAsString: String) {
                Log.i(
                    tag,
                    "onActivityDataCreate callback from JavaScript received data: $activityDataEventAsString"
                )
            }

            @JavascriptInterface
            fun onActivityLifecycleChange(activityLifecycleEventAsString: String) {
                Log.i(
                    tag,
                    "onActivityLifecycleChange callback from JavaScript received data: $activityLifecycleEventAsString"
                )
            }
        }

        webView.addJavascriptInterface(M2c2Interface(this), "Android")

        val urlEditText = findViewById<EditText>(R.id.urlEditText)
        val loadButton = findViewById<Button>(R.id.loadButton)
        val sharedPref = this.getPreferences(Context.MODE_PRIVATE)
        val savedUrl = sharedPref.getString("url", "") ?: ""
        urlEditText.setText(savedUrl)

        if (savedUrl != "") {
            val studyCode = getStudyCodeFromUrl(savedUrl)
            loadPage(webView, studyCode)
        }

        urlEditText.setOnEditorActionListener { v, actionId, _ ->
            return@setOnEditorActionListener when (actionId) {
                EditorInfo.IME_ACTION_NEXT -> {
                    closeSoftKeyboard(v)
                    updateResources(urlEditText, sharedPref, webView)
                    true
                }
                else -> false
            }
        }

        loadButton.setOnClickListener {
            closeSoftKeyboard(loadButton)
            updateResources(urlEditText, sharedPref, webView)
        }
    }

    private fun closeSoftKeyboard(v: TextView) {
        val inputMethodManager = this.getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
        inputMethodManager.hideSoftInputFromWindow(v.windowToken, 0)
    }

    private fun updateResources(
        urlEditText: EditText,
        sharedPref: SharedPreferences,
        webView: WebView
    ) {
        val progressBar = findViewById<ProgressBar>(R.id.progressBar)
        progressBar.visibility = View.VISIBLE
        val url = urlEditText.text.toString()
        val studyCode = getStudyCodeFromUrl(url)
        with(sharedPref.edit()) {
            putString("url", url)
            apply()
        }
        val serverUrl = getServerUrlFromUrl(url)

        this.launch {
            var resources: MutableList<FileResource>
            try {
                resources = getResourcesList(this@MainActivity,serverUrl, studyCode).fileResources.toMutableList()
            } catch (e: Exception) {
                Log.e(
                    tag,
                    "Exception getting study resources list: " + e.message
                )

                showToast("Error getting resources from $url")
                progressBar.visibility = View.INVISIBLE
                return@launch
            }

            val totalResources = resources.size
            Log.i(
                tag,
                "Retrieved list of $totalResources file resources for study $studyCode."
            )
            val folder = filesDir
            val studyFolder = File(folder, studyCode)
            studyFolder.mkdir()

            // filter list to only resource that have changed (different md5)
            resources = (resources.map {
                val file = File(studyFolder, it.filename)
                if (!file.exists()) {
                    it
                } else {
                    val bytes = file.readBytes()
                    val messageDigest = MessageDigest.getInstance("MD5")
                    messageDigest.update(bytes)
                    val md5 = messageDigest.digest()
                        .joinToString(separator = "") { eachByte -> "%02x".format(eachByte) }
                    if (md5 != it.md5) {
                        it
                    } else {
                        // set filename to empty string if we don't want to fetch it
                        FileResource("", 0, "")
                    }
                }
            }).filter { it.filename != "" } as MutableList<FileResource>

            Log.i(
                tag,
                "${resources.size} file resources have been changed and need to be downloaded."
            )

            try {
                val downloadRequests =
                    resources.map {
                        requestDownloadFileAsync(
                            this@MainActivity,
                            serverUrl, studyCode, it.filename
                        )
                    }
                        .awaitAll() zip resources.map { it.filename }
                downloadRequests.forEach {
                    val destFolder: File
                    val filename: String
                    if (it.second.contains("/")) {
                        val nestedFolderName = it.second.replace("/(?!.*/).*".toRegex(), "")
                        val nestedFolder = File(studyFolder, nestedFolderName)
                        nestedFolder.mkdirs()
                        destFolder = nestedFolder
                        filename = it.second.replace("$nestedFolderName/", "")
                    } else {
                        destFolder = studyFolder
                        filename = it.second
                    }

                    val file = File(destFolder, filename)
                    //val file = File(studyFolder, it.second)
                    val bytes = it.first.readBytes()
                    file.writeBytes(bytes)
                    Log.i(
                        tag,
                        "Downloaded " + bytes.size + " bytes and wrote to " + it.second
                    )
                }
            } catch (e: Exception) {
                Log.e(
                    tag,
                    "Exception downloading resources: " + e.message
                )
                showToast("Error while downloading resources")
                progressBar.visibility = View.INVISIBLE
                return@launch
            }

            showToast("Total resources: $totalResources. Updated: ${resources.size}")
            progressBar.visibility = View.INVISIBLE
            loadPage(webView, studyCode)
            return@launch
        }
    }

    private fun loadPage(webView: WebView, studyCode: String) {
        webView.webViewClient = createLocalStorageWebViewClient(studyCode)
        webView.loadUrl("https://appassets.androidplatform.net/$studyCode/index.html")
    }

    private fun showToast(text: String) {
        val toast = Toast.makeText(
            mainActivityContext,
            text,
            Toast.LENGTH_SHORT
        )
        toast.show()
    }

    private fun getServerUrlFromUrl(url: String): String {
        var serverUrl = "^.*/".toRegex().find(url)?.value
        if (serverUrl == null) {
            return ""
        }
        serverUrl = serverUrl.replace("/\$".toRegex(), "")
        if (!serverUrl.startsWith("http")) {
            serverUrl = "https://$serverUrl"
        }
        return serverUrl
    }

    private fun getStudyCodeFromUrl(url: String): String {
        var studyCode = "/.*\$".toRegex().find(url)?.value
        if (studyCode == null) {
            return ""
        }
        //var studyCode = url.replace("/$".toRegex(), "")
        studyCode = studyCode.replace("/", "")
        return studyCode
    }

//    private fun getStudyCodeFromUrl(url: String): String {
//        var studyCode = url.replace("/$".toRegex(), "")
//        studyCode = studyCode.replace(".*/".toRegex(), "")
//        return studyCode
//    }

    private fun createLocalStorageWebViewClient(studyCode: String): WebViewClient {
        val folder = filesDir
        val studyFolder = File(folder, studyCode)

        // see https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader.InternalStoragePathHandler
        val assetLoader: WebViewAssetLoader = WebViewAssetLoader.Builder()
            .addPathHandler(
                "/$studyCode/",
                WebViewAssetLoader.InternalStoragePathHandler(
                    mainActivityContext,
                    studyFolder
                )
            )
            .build()

        // see https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader
        val webViewClient = object : WebViewClient() {

            @RequiresApi(21)
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? {
                return assetLoader.shouldInterceptRequest(request.url)
            }
        }
        return webViewClient
    }

    companion object {
        private suspend fun getResourcesList(
            mainActivity: MainActivity,
            serverUrl: String,
            studyCode: String
        ): StudyResources {
            val resourcesRequest: Deferred<StudyResources> =
                mainActivity.async { mainActivity.client.get("$serverUrl/api/studies/$studyCode/resources") }
            return resourcesRequest.await()
        }

        private suspend fun requestDownloadFileAsync(
            mainActivity: MainActivity, serverUrl: String, studyCode: String,
            filename: String
        ): Deferred<HttpResponse> {
            //return mainActivity.async { mainActivity.client.get("$url?file=$filename") }
            return mainActivity.async { mainActivity.client.get("$serverUrl/api/studies/$studyCode/files/$filename") }
        }
    }
}
