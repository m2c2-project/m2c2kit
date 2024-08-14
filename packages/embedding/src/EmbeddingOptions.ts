export interface EmbeddingOptions {
  /** Host for the m2c2kit session:
   * - `MobileWebView` is an embedded web view in a mobile app, following the
   * examples in the m2c2kit repository `examples/android-simple-webview` and
   * `examples/ios-simple-webview`.
   * - `CatalystWebView` is an embedded web view in the MetricWire Catalyst app. **EXPERIMENTAL**.
   * - `CatalystCognitiveTask` is an embedded cognitive task in the MetricWire Catalyst app. **EXPERIMENTAL**.
   */
  host: "MobileWebView" | "CatalystWebView" | "CatalystCognitiveTask";
}
