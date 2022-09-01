import { JsonSchema } from "./JsonSchema";

export interface DeviceMetadata {
  userAgent?: string;
  devicePixelRatio?: number;
  screen?: screenMetadata;
  webGlRenderer?: string;
}

/**
 * screenMetadata is similar to window.Screen, except we don't want the
 * methods on the window.Screen.ScreenOrientation
 */
interface screenMetadata {
  readonly availHeight: number;
  readonly availWidth: number;
  readonly colorDepth: number;
  readonly height: number;
  /** ScreenOrientation has some methods on it; we only want these two properties
   * However, when unit testing, orientation is not available to us. Thus, make this
   * property optional
   */
  readonly orientation?: Pick<ScreenOrientation, "type" | "angle">;
  readonly pixelDepth: number;
  readonly width: number;
}

export const deviceMetadataSchema: JsonSchema = {
  type: "object",
  description: "Information about the user's device.",
  properties: {
    userAgent: {
      type: "string",
      description: "The user agent string returned by navigator.userAgent.",
    },
    devicePixelRatio: {
      type: "number",
      description: "Ratio of physical pixels to CSS pixels.",
    },
    screen: {
      type: "object",
      description: "Screen information returned by window.screen.",
      properties: {
        availHeight: {
          type: "number",
          description: "Height of screen, in pixels, excluding UI features.",
        },
        availWidth: {
          type: "number",
          description: "Width of screen, in pixels, excluding UI features.",
        },
        colorDepth: {
          type: "number",
          description: "Color depth of screen.",
        },
        height: {
          type: "number",
          description: "Height of screen, in pixels",
        },
        width: {
          type: "number",
          description: "Width of screen, in pixels.",
        },
        orientation: {
          type: "object",
          description: "Information about the device's orientation.",
          properties: {
            type: {
              type: "string",
              description: "The orientation type (ScreenOrientation.type).",
            },
            angle: {
              type: "number",
              description: "The orientation angle (ScreenOrientation.angle).",
            },
          },
        },
        pixelDepth: {
          type: "number",
          description: "Pixel depth of screen.",
        },
      },
    },
    webGlRenderer: {
      type: "string",
      description:
        "WebGL driver vendor and renderer. Taken from WEBGL_debug_renderer_info.",
    },
  },
};
