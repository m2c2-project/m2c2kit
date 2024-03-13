import { M2Event, M2EventType, ActivityEvent } from "@m2c2kit/core";
import { SessionEvent, SessionEventType } from "@m2c2kit/session";

/**
 * When running within an Android WebView, the below defines how the session
 * can communicate events back to the Sage Android app. Note: names of this Android
 * namespace and its functions must match the corresponding Android code
 * in addJavascriptInterface() and @JavascriptInterface
 * In the Android code you can see that we called the namespace "Android" and it
 * matches our declared namespace here, but it could have been called anything,
 * as long as they match.
 * */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Android {
  function onActivityResults(activityResultsEventAsString: string): void;
  function onActivityLifecycle(activityLifecycleEventAsString: string): void;
  function onSessionLifecycle(sessionLifecycleEventAsString: string): void;
  /**
   * If the Android native app will control the session execution and be
   * able to set custom game parameters (which is probably what you want),
   * be sure that sessionManualStart() in the native code returns true
   * */
  function sessionManualStart(): boolean;
}

/**
 * When running on iOS, webkit is available on window, and iOSManualStart()
 * is defined by the Sage iOS app.
 */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkit: any;
  }
  function iOSManualStart(): boolean;
}

export class SageResearch {
  /**
   * Determines if the current javascript context is an Android WebView.
   *
   * @returns true if Android WebView
   */
  public static contextIsAndroidWebView(): boolean {
    return typeof Android !== "undefined";
  }

  /**
   * Propagates events from m2c2kit to the native Android app.
   *
   * @param event - the m2c2kit event to send to the Android app.
   */
  public static sendEventToAndroid(
    event: M2Event<SessionEvent | ActivityEvent>,
  ): void {
    this.removeCircularReferencesFromEvent(event);
    switch (event.type) {
      case SessionEventType.SessionStart:
      case SessionEventType.SessionEnd:
      case SessionEventType.SessionInitialize: {
        Android.onSessionLifecycle(JSON.stringify(event));
        break;
      }
      case M2EventType.ActivityData: {
        Android.onActivityResults(JSON.stringify(event));
        break;
      }
      case M2EventType.ActivityStart:
      case M2EventType.ActivityEnd:
      case M2EventType.ActivityCancel: {
        Android.onActivityLifecycle(JSON.stringify(event));
        break;
      }
      default:
        throw new Error(
          `attempt to send unknown event ${event.type} to Android`,
        );
    }
  }

  /**
   * Determines if the current javascript context is an iOS WebView.
   *
   * @returns true if iOS WebView
   */
  public static contextIsIOSWebView(): boolean {
    return (
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.iOS
    );
  }

  /**
   * Propagates events from m2c2kit to the native iOS app.
   *
   * @param event - the m2c2kit event to send to the iOS app.
   */
  public static sendEventToIOS(
    event: M2Event<SessionEvent | ActivityEvent>,
  ): void {
    this.removeCircularReferencesFromEvent(event);
    window.webkit.messageHandlers.iOS.postMessage(event);
  }

  /**
   * Determines if the current javascript context is a mobile WebView.
   *
   * @returns true if iOS or Android WebView
   */
  public static contextIsWebView(): boolean {
    return (
      SageResearch.contextIsAndroidWebView() ||
      SageResearch.contextIsIOSWebView()
    );
  }

  /**
   * Propagates events from m2c2kit to the native app.
   *
   * @param event - the m2c2kit event to send to the native app.
   */
  public static sendEventToWebView(
    event: M2Event<SessionEvent | ActivityEvent>,
  ): void {
    if (SageResearch.contextIsAndroidWebView()) {
      SageResearch.sendEventToAndroid(event);
    } else if (SageResearch.contextIsIOSWebView()) {
      SageResearch.sendEventToIOS(event);
    } else {
      console.log(event);
    }
  }

  /**
   * Determines if the session should be started manually by the native app.
   *
   * @remarks To begin a session, the javascript code must first call
   * Session.initialize() to initialize resources. When this is finished, a callback
   * is made to whatever function was passed into onSessionLifecycleChange in
   * the SessionOptions. When running in a browser, we typically immediately
   * call Session.start() to start the session. However, when running in a
   * native app, we might want to set some per-user parameters for the
   * activities (games), if we don't want to use the built-in default
   * parameters. Game parameters can be set AFTER Session.initialize() but
   * BEFORE Session.start(). When sessionManualStart() returns true, it is a
   * signal to the javascript code NOT to automatically call Session.start(),
   * so that the native app can set the parameters and then call
   * Session.start() when it wants to. In sum, the native functions that are
   * mapped to Android.sessionManualStart() and iOSManualStart() should
   * in nearly all situations return TRUE.
   *
   * @returns true if the game should be started manually
   */
  public static sessionManualStart(): boolean {
    if (SageResearch.contextIsAndroidWebView()) {
      return Android.sessionManualStart();
    } else if (SageResearch.contextIsIOSWebView()) {
      return iOSManualStart();
    } else {
      return false;
    }
  }

  /**
   * Removes circular references from event object.
   *
   * @remarks event.target is the object that fired the event, which is an
   * Activity, Session, or M2Node. These objects have circular references,
   * which will cause problems when serializing. Thus, before we pass the
   * event to Android or iOS, retain just target's type and name.
   *
   * @param event
   */
  private static removeCircularReferencesFromEvent(
    event: M2Event<SessionEvent | ActivityEvent>,
  ): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    event.target = { type: event.target.type, name: event.target.name };
  }

  /**
   * Intercepts fetch of WebAssembly resources and modifies the response.
   *
   * @remarks WKWebView doesn't receive the proper MIME type and status code
   * when fetch() gets resources from local bundle. Normally, this is OK,
   * but WebAssembly binaries must be application/wasm, otherwise they cannot
   * be compiled and instantiated. Run this method before session.initialize() to
   * ensure that when m2c2kit fetches a WebAssembly resource, it has the
   * proper reponse. The method will not make any modifications when fetching
   * non-wasm resources or when running on Android.
   */
  public static ConfigureWasmFetchInterceptor(): void {
    // no need to modify fetch if not running in iOS WebView
    if (!SageResearch.contextIsIOSWebView()) {
      return;
    }

    // the below syntax unpacks fetch from window and assigns it to origFetch
    const { fetch: origFetch } = window;

    window.fetch = async (...args) => {
      /**
       * Fix up the MIME type and status code only if
       *   1) we're in iOS webview and
       *   2) fetch() was called with arguments and
       *   3) we're fetching a wasm binary (first fetch() argument ends
       *      with .wasm or .WASM)
       */
      if (
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.iOS &&
        args.length > 0 &&
        (args[0] as string).toLowerCase().endsWith(".wasm")
      ) {
        const response: Response = await origFetch(...args).catch((error) => {
          return new Promise(function (resolve) {
            resolve(
              new Response(null, {
                status: 500,
                statusText: JSON.stringify(error),
              }),
            );
          });
        });

        const headers = new Headers();
        headers.append("content-type", "application/wasm");
        return new Promise(function (resolve) {
          return response.blob().then(function (blob) {
            // response is immutable, so we have to create a new one with our
            // desired headers and status code.
            resolve(
              new Response(blob, {
                status: 200,
                statusText: response.statusText,
                headers: headers,
              }),
            );
          });
        });
      } else {
        // Not fetching WebAssembly binary from local bundle for WKWebView.
        // Proceed as normal.
        return await origFetch(...args);
      }
    };
  }
}
