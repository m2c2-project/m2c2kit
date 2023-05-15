import ttfInfo from "../ttfInfo";
import fs from "fs";
import path from "path";
import { TextDecoder, TextEncoder } from "node:util";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.TextEncoder = TextEncoder;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.TextDecoder = TextDecoder;

describe("ttfInfo", () => {
  const buffer = fs.readFileSync(
    path.join(__dirname, "Roboto-Regular.ttf"),
    null
  );

  const result = ttfInfo(new DataView(buffer.buffer));
  const fontFamilyUtf16Be = result.meta.property
    .filter((p: { name: string; text: string }) => p.name === "font-family")
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .find(Boolean)?.text;

  // Decode font-family string value
  const arr = new Uint8Array(fontFamilyUtf16Be.length);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = (fontFamilyUtf16Be as string).charCodeAt(i);
  }
  const fontFamily = new TextDecoder("utf-16be").decode(arr);

  it("should return the correct font family", () => {
    expect(fontFamily).toBe("Roboto");
  });
});
