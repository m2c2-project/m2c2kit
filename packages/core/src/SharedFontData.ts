/**
 * Font url and raw data that has been shared with other games in the session.
 *
 * @remarks Font sharing will happen only if the font filename is the same AND
 * a game's `shareAssets` property is not false.
 */
export interface SharedFont {
  /** url that the shared font was loaded from */
  url: string;
  /** raw data of the shared font */
  data: ArrayBuffer;
}
