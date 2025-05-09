import {
  M2c2KitHelpers,
  Uuid,
  ActivityType,
  Game,
  Activity,
} from "@m2c2kit/core";
import { SessionKeyValueData } from "./SessionData";
import { SessionEvent, SessionEventType } from "./SessionEvent";
import { SessionDataEvent } from "./SessionDataEvent";
import { HtmlDialog } from "./HtmlDialog";
import { DiagnosticsReporterOptions } from "./DiagnosticsReporterOptions";

const MAX_DIAGNOSTIC_EVENTS = 10;

export class DiagnosticsReporter {
  private staticDiagnosticData: SessionKeyValueData = {};
  private batteryStatus: BatteryStatus | undefined;
  private storageEstimate: StorageEstimate | undefined;
  private isHandlingException = false;
  private reportedExceptions = new Set<string>();
  private diagnosticEventsCount = 0;
  private getSessionUuid: () => string;
  private getCurrentActivity: () => Activity | undefined;
  private dispatchEvent: (event: SessionEvent, extra?: unknown) => void;
  private onErrorDialogConfirm: () => void;
  private removeOverlayAfterErrorDialogConfirm: boolean;
  private onlyM2Errors: boolean;
  private handleResourceLoadingErrors: boolean;
  private maximumDiagnosticEvents: number;
  private errorHandler: (event: ErrorEvent) => void;
  private rejectionHandler: (event: PromiseRejectionEvent) => void;
  private resourceErrorHandler: (event: Event) => void;

  constructor(options: DiagnosticsReporterOptions) {
    this.getSessionUuid = options.getSessionUuid;
    this.getCurrentActivity = options.getCurrentActivity;
    this.dispatchEvent = options.dispatchEvent;
    this.onErrorDialogConfirm = options.onErrorDialogConfirm || (() => {});
    this.removeOverlayAfterErrorDialogConfirm =
      options.removeOverlayAfterErrorDialogConfirm ?? false;
    this.onlyM2Errors = options.onlyM2Errors ?? true;
    this.handleResourceLoadingErrors =
      options.handleResourceLoadingErrors ?? false;
    this.maximumDiagnosticEvents =
      options.maximumDiagnosticEvents ?? MAX_DIAGNOSTIC_EVENTS;
    this.errorHandler = this.handleError.bind(this);
    this.rejectionHandler = this.handleRejection.bind(this);
    this.resourceErrorHandler = this.handleResourceError.bind(this);

    this.refreshBatteryStatus();
    this.refreshStorageEstimate();
  }

  /**
   * Sets the value of a variable that will be the same for all diagnostic data.
   *
   * @param key - key (variable name) for the static diagnostic data
   * @param value - value for the data
   */
  addStaticDiagnosticData(
    key: string,
    value: string | number | boolean | object | undefined | null,
  ): void {
    this.staticDiagnosticData[key] = value;
  }

  /**
   * Starts the DiagnosticsReporter by setting up global error handlers to
   * capture uncaught errors, unhandled promise rejections, and possibly
   * resource loading errors to be reported through diagnostics.
   */
  start(): void {
    window.addEventListener("error", this.errorHandler);
    window.addEventListener("unhandledrejection", this.rejectionHandler);
    if (this.handleResourceLoadingErrors) {
      document.addEventListener("error", this.resourceErrorHandler, true);
    }
  }

  /**
   * Stops the DiagnosticsReporter by removing all global error handlers
   * to prevent memory leaks. Call this method when the DiagnosticsReporter
   * is no longer needed.
   */
  stop(): void {
    window.removeEventListener("error", this.errorHandler);
    window.removeEventListener("unhandledrejection", this.rejectionHandler);
    document.removeEventListener("error", this.resourceErrorHandler, true);
  }

  /**
   * Handles synchronous errors
   */
  private handleError(event: ErrorEvent): boolean {
    if (this.onlyM2Errors && event.error && event.error.name !== "M2Error") {
      return false;
    }

    this.handleException(event.error || new Error(event.message), {
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: "synchronous",
    });
    return false; // Don't prevent default handling
  }

  /**
   * Handles unhandled promise rejections
   */
  private handleRejection(event: PromiseRejectionEvent): boolean {
    let error: Error;
    if (event.reason instanceof Error) {
      error = event.reason;
    } else if (typeof event.reason === "string") {
      error = new Error(event.reason);
    } else {
      try {
        error = new Error(JSON.stringify(event.reason));
      } catch {
        error = new Error(
          "Unhandled Promise rejection with unserializable reason",
        );
      }
    }

    if (this.onlyM2Errors && error && error.name !== "M2Error") {
      return false;
    }

    // Extract line/column info from stack trace
    const errorInfo = this.extractErrorLocationFromStack(error.stack);

    this.handleException(error, {
      source: errorInfo.source || "promise_rejection",
      lineno: errorInfo.lineno,
      colno: errorInfo.colno,
      type: "promise_rejection",
    });

    return false; // Don't prevent default handling
  }

  /**
   * Extracts source file, line number and column number from error stack trace
   * Works across Chrome, Firefox, Safari, Edge on both desktop and mobile
   *
   * @param stack - The error stack trace string
   * @returns Object containing source file, line number, and column number
   * @private
   */
  private extractErrorLocationFromStack(stack?: string): {
    source?: string;
    lineno?: number;
    colno?: number;
  } {
    if (!stack) return {};

    const MAX_STACK_LINES = 20; // Don't process extremely large stacks
    const stackLines = stack.split("\n").slice(0, MAX_STACK_LINES);

    for (let i = 0; i < stackLines.length; i++) {
      const line = stackLines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Chrome/Edge format: "at methodName (file:///path/file.js:line:column)"
      const chromeMatch = line.match(/at .*? \(([^)]+):(\d+):(\d+)\)/);
      if (chromeMatch) {
        return {
          source: chromeMatch[1],
          lineno: parseInt(chromeMatch[2], 10),
          colno: parseInt(chromeMatch[3], 10),
        };
      }

      // Chrome/Edge alternative format: "at file:///path/file.js:line:column"
      const chromeAltMatch = line.match(/at ([^ ]+):(\d+):(\d+)/);
      if (chromeAltMatch) {
        return {
          source: chromeAltMatch[1],
          lineno: parseInt(chromeAltMatch[2], 10),
          colno: parseInt(chromeAltMatch[3], 10),
        };
      }

      // Firefox/Safari format: "functionName@file:///path/file.js:line:column"
      // or "@file:///path/file.js:line:column"
      const mozillaMatch = line.match(/(?:@|at )([^@]+):(\d+):(\d+)/);
      if (mozillaMatch) {
        return {
          source: mozillaMatch[1],
          lineno: parseInt(mozillaMatch[2], 10),
          colno: parseInt(mozillaMatch[3], 10),
        };
      }

      // Handle eval call stacks in Safari/Firefox
      // Example: "methodName@http://site.com/file.js line 1 > eval line 1 > eval:1:1"
      const evalMatch = line.match(/([^@\s]+)(?:.*?)?:(\d+):(\d+)$/);
      if (evalMatch) {
        return {
          source: evalMatch[1],
          lineno: parseInt(evalMatch[2], 10),
          colno: parseInt(evalMatch[3], 10),
        };
      }

      // Generic fallback pattern that looks for file:line:column
      // This helps with other browser formats we might not specifically handle
      const genericMatch = line.match(/([^:]+):(\d+):(\d+)/);
      if (genericMatch) {
        return {
          source: genericMatch[1],
          lineno: parseInt(genericMatch[2], 10),
          colno: parseInt(genericMatch[3], 10),
        };
      }
    }

    return {}; // No location information found
  }

  /**
   * Handles resource loading errors
   */
  private handleResourceError(event: Event): void {
    // There are many HTML elements that can cause resource loading errors,
    // but for now watch only images and scripts.
    if (
      event.target instanceof HTMLImageElement ||
      event.target instanceof HTMLScriptElement
    ) {
      let url = "src" in event.target ? event.target.src : "unknown";
      url = this.truncateString(url, 100);
      this.handleException(
        new Error(
          `Error on element ${event.target.nodeName} in document at ${document.URL}. Failed to load resource: ${url}`,
        ),
        {
          source: "resource_loading",
          type: "resource_loading",
        },
      );
    }
  }

  /**
   * Handles uncaught exceptions and sends diagnostic data to listeners.
   *
   * @remarks This method is called by the global error handler and
   * unhandled promise rejection handler.
   *
   * @param error - the error object
   * @param errorInfo - additional information about the error
   * @param errorInfo.source - the source of the error (e.g., filename)
   * @param errorInfo.lineno - the line number where the error occurred
   * @param errorInfo.colno - the column number where the error occurred   *
   */
  private handleException(error: Error, errorInfo?: ErrorInfo): void {
    if (this.isHandlingException) {
      console.error("Error occurred while handling another exception", error);
      return;
    }

    const errorKey = `${error.message}:${errorInfo?.lineno || 0}:${errorInfo?.colno || 0}`;
    if (this.reportedExceptions.has(errorKey)) {
      return;
    }
    this.reportedExceptions.add(errorKey);
    this.diagnosticEventsCount++;

    if (this.diagnosticEventsCount > this.maximumDiagnosticEvents) {
      console.warn(
        `Maximum diagnostic events reached (${this.maximumDiagnosticEvents}). No more will be reported.`,
      );
      return;
    }

    try {
      this.isHandlingException = true;

      // Only show a dialog if there isn't one already visible
      if (!HtmlDialog.isDialogVisible()) {
        const dialog = new HtmlDialog({
          message:
            "We are sorry, but something went wrong. Please try again later.",
          backgroundCharacter: "⚠️",
          onDialogConfirm: this.onErrorDialogConfirm,
          removeOverlayAfterConfirm: this.removeOverlayAfterErrorDialogConfirm,
        });
        dialog.show();
      } else {
        console.log("Error dialog already visible, not showing another one");
      }

      // Create diagnostic data and dispatch event
      const currentActivity = this.getCurrentActivity();
      const { timestamp, iso8601Timestamp } = M2c2KitHelpers.createTimestamps();
      const diagnosticData: SessionKeyValueData = {
        data_type: "diagnostics",
        document_uuid: Uuid.generate(),
        iso8601_timestamp: iso8601Timestamp,
        session_uuid: this.getSessionUuid(),
        activity: {
          id: currentActivity?.id ?? null,
          uuid: currentActivity?.uuid ?? null,
          publish_uuid: currentActivity?.publishUuid ?? null,
          version:
            currentActivity?.type === ActivityType.Game
              ? (currentActivity as Game).options.version
              : null,
          begin_iso8601_timestamp:
            currentActivity?.type === ActivityType.Game
              ? (currentActivity as Game).beginIso8601Timestamp
              : null,
          locale:
            currentActivity?.type === ActivityType.Game
              ? ((currentActivity as Game).i18n?.locale ?? null)
              : null,
        },
        error_message: error.message,
        error_stack: this.truncateString(error.stack, 2048) ?? null,
        error_source: errorInfo?.source ?? null,
        error_line: errorInfo?.lineno || 0,
        error_column: errorInfo?.colno || 0,
        error_type: errorInfo?.type ?? null,
        device_metadata: this.getExtendedDeviceMetadata(),
        ...this.staticDiagnosticData,
      };

      const sessionDataEvent: SessionDataEvent = {
        // target will be replaced by the Session instance in the eventRaiser,
        // which is raiseEventOnListeners() in the Session class. It will set
        // the target to the session instance.
        target: null as unknown as SessionEvent["target"],
        type: SessionEventType.SessionData,
        data: diagnosticData,
        dataType: "Diagnostics",
        timestamp: timestamp,
        iso8601Timestamp: iso8601Timestamp,
      };

      this.dispatchEvent(sessionDataEvent);
      console.log("❌ diagnostics:", error, errorInfo);
    } finally {
      this.isHandlingException = false;
    }
  }

  private getExtendedDeviceMetadata() {
    try {
      const screen = window.screen || {};
      let orientation = undefined;
      try {
        orientation = screen.orientation || undefined;
      } catch {
        // Ignore errors accessing orientation
      }

      return {
        userAgent: navigator?.userAgent,
        language: navigator?.language,
        hardwareConcurrency: navigator?.hardwareConcurrency,
        deviceMemory:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          typeof (navigator as any)?.deviceMemory !== "undefined"
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (navigator as any).deviceMemory
            : undefined,
        // Connection API is experimental. Wrap in try/catch to avoid errors
        // that some browsers may throw if the API is not available.
        connection: (() => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const conn = (navigator as any)?.connection;
            return conn
              ? {
                  effectiveType: conn?.effectiveType,
                  downlink: conn?.downlink,
                  downlinkMax: conn?.downlinkMax,
                  rtt: conn?.rtt,
                  saveData: conn?.saveData,
                  type: conn?.type,
                }
              : undefined;
          } catch {
            return undefined;
          }
        })(),
        battery: this.batteryStatus,
        storage: this.storageEstimate,
        cookieEnabled: navigator?.cookieEnabled,
        webAssembly: typeof WebAssembly !== "undefined",
        maxTouchPoints: navigator?.maxTouchPoints,
        devicePixelRatio: window?.devicePixelRatio,
        screen: {
          availHeight: screen?.availHeight,
          availWidth: screen?.availWidth,
          colorDepth: screen?.colorDepth,
          height: screen?.height,
          orientation: orientation
            ? {
                type: orientation?.type,
                angle: orientation?.angle,
              }
            : undefined,
          pixelDepth: screen?.pixelDepth,
          width: screen?.width,
        },
        device_timezone:
          Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone || "",
        device_timezone_offset_minutes: new Date().getTimezoneOffset(),
      };
    } catch (error) {
      console.warn("Error collecting device metadata:", error);
      // Return minimal metadata to avoid breaking diagnostics completely
      return {
        userAgent: navigator?.userAgent || "unknown",
      };
    }
  }

  /**
   * Refreshes the battery status.
   *
   * @remarks This method uses the Battery Status API to get the current
   * battery status of the device. Because the API is asynchronous, we
   * call it previously so that it is ready when we need it and do not need
   * to await it.
   */
  private refreshBatteryStatus(): void {
    try {
      // Check if API exists
      if (!("getBattery" in navigator)) {
        return;
      }

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error("Battery status timeout")), 2000);
      });

      // Race with actual battery fetch
      Promise.race([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).getBattery(),
        timeoutPromise,
      ])
        .then((battery: BatteryStatus) => {
          this.batteryStatus = {
            charging: battery?.charging,
            level: battery?.level,
            chargingTime: battery?.chargingTime,
            dischargingTime: battery?.dischargingTime,
          };
        })
        .catch((error) => {
          console.warn("Battery status API error:", error);
          this.batteryStatus = undefined;
        });
    } catch (error) {
      console.warn("Unexpected error in battery status check:", error);
    }
  }

  private refreshStorageEstimate(): void {
    try {
      // Check if API exists
      if (!("storage" in navigator && "estimate" in navigator.storage)) {
        return;
      }

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error("Storage estimate timeout")), 2000);
      });

      // Race with actual storage estimate fetch
      Promise.race([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).storage.estimate(),
        timeoutPromise,
      ])
        .then((storage: StorageEstimate) => {
          this.storageEstimate = {
            quota: storage.quota,
            usage: storage.usage,
          };
        })
        .catch((error) => {
          console.warn("Storage estimation API error:", error);
          this.storageEstimate = undefined;
        });
    } catch (error) {
      console.warn("Unexpected error in storage estimation check:", error);
    }
  }

  private truncateString(s: string | undefined, length: number) {
    if (!s) {
      return "";
    }
    if (s.length <= length) {
      return s;
    }
    return s.slice(0, length) + `...(truncated from ${s.length} characters)`;
  }
}

interface ErrorInfo {
  source?: string;
  lineno?: number;
  colno?: number;
  type?: string;
}

interface BatteryStatus {
  charging?: boolean;
  level?: number;
  chargingTime?: number;
  dischargingTime?: number;
}

interface StorageEstimate {
  quota?: number;
  usage?: number;
}
