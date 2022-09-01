export class WebGlInfo {
  /**
   * Returns graphics driver vendor and renderer information.
   *
   * @remarks Information is from parameters UNMASKED_VENDOR_WEBGL and
   * UNMASKED_RENDERER_WEBGL when asking for WEBGL_debug_renderer_info
   * from the WebGLRenderingContext.
   *
   * @returns string
   */
  public static getRendererString(): string {
    const rendererInfoCanvas = document.createElement("canvas");
    rendererInfoCanvas.id = "webgl-renderer-info-canvas";
    rendererInfoCanvas.height = 0;
    rendererInfoCanvas.width = 0;
    rendererInfoCanvas.hidden = true;
    document.body.appendChild(rendererInfoCanvas);
    const gl = rendererInfoCanvas.getContext("webgl");
    let rendererString = "no webgl context";
    if (!gl) {
      return rendererString;
    }
    const debugRendererInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugRendererInfo != null) {
      rendererString =
        String(gl.getParameter(debugRendererInfo.UNMASKED_VENDOR_WEBGL)) +
        ", " +
        String(gl.getParameter(debugRendererInfo.UNMASKED_RENDERER_WEBGL));
    } else {
      rendererString = "no debug renderer info";
    }
    rendererInfoCanvas.remove();
    return rendererString;
  }

  /**
   * Removes the temporary canvas that was created to get WebGL information.
   */
  public static dispose(): void {
    const rendererInfoCanvas = document.getElementById(
      "webgl-renderer-info-canvas"
    );
    if (rendererInfoCanvas) {
      rendererInfoCanvas.remove();
    }
  }
}
