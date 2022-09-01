import {
  EmbindObject,
  Font,
  Paint,
  ParagraphBuilder,
  Paragraph,
  Image,
  Typeface,
  FontMgr,
} from "canvaskit-wasm";

export class CanvasKitHelpers {
  /**
   * Frees up resources that were allocated by CanvasKit.
   *
   * @remarks This frees objects created in WebAssembly by
   * canvaskit-wasm. JavaScript garbage collection won't
   * free these wasm objects.
   */
  static Dispose(
    objects: Array<
      | undefined
      | null
      | EmbindObject<
          | Font
          | Paint
          | ParagraphBuilder
          | Paragraph
          | Image
          | Typeface
          | FontMgr
        >
    >
  ): void {
    objects.filter((o) => !o?.isDeleted).forEach((o) => o?.delete());
  }
}
