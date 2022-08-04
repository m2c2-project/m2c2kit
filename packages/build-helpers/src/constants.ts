export class Constants {
  /** We use MD5 for hashing, but keep only the first 16 characters. */
  static readonly HASH_CHARACTER_LENGTH = 16;
  /** The path, in our source code repo on disk, where the wasm binary is. */
  static readonly CANVASKITWASM_PATH = "src/assets/canvaskit.wasm";
  /**
   * The URL, when m2c2kit is running in a browser, from where we can fetch
   * the wasm binary. When built for production, this URL will be modified,
   * using TypeScript transformers, to a hash added to it.
   */
  static readonly DEFAULT_CANVASKITWASM_URL = "assets/canvaskit.wasm";
}
