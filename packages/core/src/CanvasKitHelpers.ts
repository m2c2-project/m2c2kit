import {
  Font,
  Paint,
  ParagraphBuilder,
  Paragraph,
  Image,
  Typeface,
  FontMgr,
  TypefaceFontProvider,
  CanvasKit,
  PaintStyle,
  Path,
} from "canvaskit-wasm";
import { RgbaColor } from "./RgbaColor";

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
      | Font
      | Paint
      | ParagraphBuilder
      | Paragraph
      | Image
      | Typeface
      | TypefaceFontProvider
      | FontMgr
      | Path
    >,
  ): void {
    objects.filter((o) => !o?.isDeleted()).forEach((o) => o?.delete());
  }

  static makePaint(
    canvasKit: CanvasKit,
    color: RgbaColor,
    style: PaintStyle,
    isAntialiased: boolean,
  ): Paint {
    const paint = new canvasKit.Paint();
    paint.setColor(canvasKit.Color(color[0], color[1], color[2], color[3]));
    paint.setStyle(style);
    paint.setAntiAlias(isAntialiased);
    return paint;
  }
}
