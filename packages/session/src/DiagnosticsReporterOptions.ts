import { Activity } from "@m2c2kit/core";
import { SessionEvent } from "./SessionEvent";

export interface DiagnosticsReporterOptions {
  /** Function to get the session UUID. Set this property to `() => this.uuid`. */
  getSessionUuid: () => string;
  /** Function to get the current activity. Set this property to `() => this.currentActivity`. */
  getCurrentActivity: () => Activity | undefined;
  /** Function to dispatch diagnostic events. Set this property to `this.raiseEventOnListeners.bind(this)`. */
  dispatchEvent: (event: SessionEvent, extra?: unknown) => void;
  /** Callback to execute after the user clicks OK on error dialog. Recommendation is to call the `Session.end()` method which attempts to gracefully end the session, e.g., set this property to `this.end.bind(this)`. `bind()` is needed to ensure that the `this` context is correct within the callback. */
  onErrorDialogConfirm?: () => void;
  /** After the user clicks OK on error dialog, should the overlay be removed? Recommendation is that the overlay should not be removed because the assessment may be in an error state (broken UI, spinning wheel, etc.). Default is false. */
  removeOverlayAfterErrorDialogConfirm?: boolean;
  /** Should only m2c2kit errors (M2Error) be handled? Default is true. */
  onlyM2Errors?: boolean;
  /** Should document resource loading errors be handled? Assessments might be in a page with other code that has non-fatal resource loading errors not related to the assessment code. Resource loading errors on the document might happen when an image or script fails to load, and these errors are likely not caused by the assessment code. We usually do not want diagnostics to capture these and stop the session. Default is false. */
  handleResourceLoadingErrors?: boolean;
  /** Maximum number of diagnostic events reported in a session to avoid flooding (e.g., console output, data sent to a server). Typically, there is just one diagnostic event (one exception), but to be safe, this sets a limit. Default is 10. */
  maximumDiagnosticEvents?: number;
}
