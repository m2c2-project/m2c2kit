import { M2EventType, ActivityEvent } from "@m2c2kit/core";
import { Session, SessionEvent, SessionEventType } from "@m2c2kit/session";
import { EmbeddingOptions } from "./EmbeddingOptions";

/**
 * When running within an Android WebView, the below defines how the session
 * can communicate events back to the native Android app. Note: names of this Android
 * namespace and its functions must match the corresponding Android code
 * in addJavascriptInterface() and @JavascriptInterface
 * In the Android code you can see that we called the namespace "AndroidM2c2" and it
 * matches our declared namespace here, but it could have been called anything,
 * as long as they match.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace AndroidM2c2 {
  function onActivityResults(activityResultsEventAsString: string): void;
  function onActivityLifecycle(activityLifecycleEventAsString: string): void;
  function onSessionLifecycle(sessionLifecycleEventAsString: string): void;
  /**
   * If the Android native app will control the session execution and be
   * able to set custom game parameters (which is probably what you want),
   * be sure that sessionManualStart() in the native code returns true
   */
  function sessionManualStart(): boolean;
}

/**
 * When running on iOS, webkit is available on window.
 * The message handler "iOSM2c2" and function IOSM2c2.sessionManualStart() is defined
 * by the iOS app. Message handler could have been called anything, but the
 * iOS app defined it as "iOSM2c2".
 */
declare global {
  interface Window {
    webkit: {
      messageHandlers: {
        iOSM2c2: {
          postMessage: (event: SessionEvent | ActivityEvent) => void;
        };
      };
    };
  }
}
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace IOSM2c2 {
  function sessionManualStart(): boolean;
}

export class Embedding {
  /**
   * Configures the m2c2kit session to run embedded in a "host" such as a
   * mobile webview.
   *
   * @remarks Call this method after the session has been created, but before
   * it has been initialized with Session.initialize().
   * For embedding to work, the host must be specifically programmed to expect
   * m2c2kit events and to control the m2c2kit session.
   *
   * @param session - the session to embed.
   * @param options - options for embedding, such as the type of host.
   * @returns
   */
  public static initialize(session: Session, options: EmbeddingOptions): void {
    /**
     * Make session also available on window in case we want to control
     * the session through another means, such as other javascript or
     * browser code, or a mobile WebView.
     *
     * We call it m2c2kitSession to avoid name conflicts with other
     * javascript code that might use the name "session".
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as unknown as any).m2c2kitSession = session;

    if (options.host === "MobileWebView") {
      session.options.autoStartAfterInit = !(
        Embedding.contextIsWebView() && Embedding.sessionManualStart() === true
      );
      this.configureWasmFetchInterceptor();

      /**
       * note: we do not need to set up Session.onData() events, because they
       * will be sent by the individual Activity.onData() events, below.
       */
      session.onInitialize((ev: SessionEvent) => {
        Embedding.sendEventToWebView(ev);
      });
      session.onStart((ev: SessionEvent) => {
        Embedding.sendEventToWebView(ev);
      });
      session.onEnd((ev: SessionEvent) => {
        Embedding.sendEventToWebView(ev);
      });

      session.options.activities.forEach((activity) => {
        activity.onStart((ev) => {
          Embedding.sendEventToWebView(ev);
        });
        activity.onData((ev) => {
          Embedding.sendEventToWebView(ev);
        });
        activity.onCancel((ev) => {
          Embedding.sendEventToWebView(ev);
        });
        activity.onEnd((ev) => {
          Embedding.sendEventToWebView(ev);
        });
      });
      return;
    }

    throw new Error(`Unknown embedding host: ${options.host}`);
  }

  /**
   * Determines if the current javascript context is an Android WebView.
   *
   * @returns true if Android WebView
   */
  public static contextIsAndroidWebView(): boolean {
    return typeof AndroidM2c2 !== "undefined";
  }

  /**
   * Propagates events from m2c2kit to the native Android app.
   *
   * @param event - the m2c2kit event to send to the Android app.
   */
  public static sendEventToAndroid(event: SessionEvent | ActivityEvent): void {
    switch (event.type) {
      case SessionEventType.SessionStart:
      case SessionEventType.SessionEnd:
      case SessionEventType.SessionInitialize: {
        AndroidM2c2.onSessionLifecycle(JSON.stringify(event));
        break;
      }
      case M2EventType.ActivityData: {
        AndroidM2c2.onActivityResults(JSON.stringify(event));
        break;
      }
      case M2EventType.ActivityStart:
      case M2EventType.ActivityEnd:
      case M2EventType.ActivityCancel: {
        AndroidM2c2.onActivityLifecycle(JSON.stringify(event));
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
      window.webkit.messageHandlers.iOSM2c2 !== undefined
    );
  }

  /**
   * Propagates events from m2c2kit to the native iOS app.
   *
   * @param event - the m2c2kit event to send to the iOS app.
   */
  public static sendEventToIOS(event: SessionEvent | ActivityEvent): void {
    window.webkit.messageHandlers.iOSM2c2.postMessage(event);
  }

  /**
   * Determines if the current javascript context is a mobile WebView.
   *
   * @returns true if iOS or Android WebView
   */
  public static contextIsWebView(): boolean {
    return (
      Embedding.contextIsAndroidWebView() || Embedding.contextIsIOSWebView()
    );
  }

  /**
   * Propagates events from m2c2kit to the native app.
   *
   * @param event - the m2c2kit event to send to the native app.
   */
  public static sendEventToWebView(event: SessionEvent | ActivityEvent): void {
    this.removeCircularReferencesFromEvent(event);
    if (Embedding.contextIsAndroidWebView()) {
      Embedding.sendEventToAndroid(event);
    } else if (Embedding.contextIsIOSWebView()) {
      Embedding.sendEventToIOS(event);
    } else {
      console.warn(
        `Could not send event to web view. Event was: ${JSON.stringify(event)}`,
      );
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
   * mapped to AndroidM2c2.sessionManualStart() and IOSM2c2.SessionManualStart()
   * should in nearly all situations return TRUE.
   *
   * @returns true if the game should be started manually
   */
  public static sessionManualStart(): boolean {
    if (Embedding.contextIsAndroidWebView()) {
      return AndroidM2c2.sessionManualStart();
    } else if (Embedding.contextIsIOSWebView()) {
      return IOSM2c2.sessionManualStart();
    } else {
      return false;
    }
  }

  /**
   * Removes circular references from event object.
   *
   * @remarks event.target is the object that fired the event, which is an
   * Activity, Session, or Node. These objects have circular references,
   * which will cause problems when serializing. Thus, before we pass the
   * event to Android or iOS, retain just target's type and name.
   *
   * @param event
   */
  private static removeCircularReferencesFromEvent(
    event: SessionEvent | ActivityEvent,
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
   * proper response. The method will not make any modifications when fetching
   * non-wasm resources or when running on Android.
   */
  public static configureWasmFetchInterceptor(): void {
    // no need to modify fetch if not running in iOS WebView
    if (!Embedding.contextIsIOSWebView()) {
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
        window.webkit.messageHandlers.iOSM2c2 &&
        args.length > 0 &&
        (args[0] as string).toLowerCase().endsWith(".wasm") &&
        // if wasm is inlined as data URL, do not modify response
        !(args[0] as string).toLowerCase().startsWith("data:application/wasm")
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
