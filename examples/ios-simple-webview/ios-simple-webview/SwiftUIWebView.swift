//
//  SwiftUIWebView.swift
//  ios-simple-webview
//
//  Created on 8/20/22.
//

import SwiftUI
import WebKit

struct SwiftUIWebView: UIViewRepresentable  {
    typealias UIViewType = WKWebView
    
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        let userContentController = WKUserContentController()
        config.userContentController = userContentController
        
        let manualStartSource = "const IOSM2c2 = { sessionManualStart: () => { return true; } };"
        let manualStartScript = WKUserScript(source: manualStartSource, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        userContentController.addUserScript(manualStartScript)
        
        // setting allowFileAccessFromFileURLs is needed so that index.html (which we load in webView.loadFileURL)
        // can itself load other files (that is, using the file scheme, file://).
        // see https://stackoverflow.com/questions/46996292/ios-wkwebview-cross-origin-requests-are-only-supported-for-http
        // If this undocumented key is removed or stops working in future OS versions, the alternative will be to write
        // custom scheme handlers (WKURLSchemeHandler) and modify our m2c2kit code to fetch resources with a
        // prefaced custom m2c2kit scheme.
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        
        let webView = WKWebView(frame: .zero, configuration: config)
        
        let messageHandler = ScriptMessageHandler(webView: webView)
        // name is "iOSM2c2" because in the @m2c2kit/embedding package we post messages with
        // window.webkit.messageHandlers.iOSM2c2.postMessage(event);
        webView.configuration.userContentController.add(messageHandler, name: "iOSM2c2")
        
        let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "dist-webview")!
        webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        // alternatively, if assets are not bundled in the app, comment out the 2 lines above
        // and load the m2c2kit URL into the web view:
        // let url = URL(string: "https://<replace with the m2c2kit url>")!
        // webView.load(URLRequest(url: url, cachePolicy: .reloadRevalidatingCacheData ))

        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
    }
}

// m2c2kit events have other properties (see the source code for @m2c2kit/core), but
// for this example app, we just need type. A more robust app should deserialize
// the events coming from JavaScript into strongly typed objects.
struct M2C2Event: Codable {
    var type: String
}

enum EventKeys : String, CodingKey, Codable {
    case type
}

class ScriptMessageHandler: NSObject, WKScriptMessageHandler, ObservableObject {
    
    var webView: WKWebView
    
    init(webView: WKWebView) {
        self.webView = webView
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "iOSM2c2" {
            
            guard let dictionary = message.body as? [String : Any] else {
                assertionFailure("Received message from JavaScript with unexpected format.")
                return
            }
            let eventType = dictionary[EventKeys.type.rawValue] as? String
            
            print("Event: \(eventType!)")
            
            if (eventType == "SessionInitialize") {
                // After initialization is complete, you can modify the default parameters before starting the session.
                // For example, if we uncomment the below, we can change the number of trials for the first activity
                // to be only 1. See the source code for each assessment for its configurable parameters and defaults.
                //self.webView.evaluateJavaScript("window.m2c2kitSession.options.activities[0].setParameters({\"number_of_trials\": 1});", completionHandler: nil)
                
                self.webView.evaluateJavaScript("window.m2c2kitSession.start();", completionHandler: nil)
            }
            
            if (eventType == "ActivityData") {
                // for ActivityData event, body will also contain trial data
                print(message.body)
            }
        }
    }
}
