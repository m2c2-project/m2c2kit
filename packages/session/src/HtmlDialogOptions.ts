export interface HtmlDialogOptions {
  /** The message to display in the dialog. */
  message: string;
  /** The character to use as a large background image (e.g., an emoji). */
  backgroundCharacter?: string;
  /** Callback function to execute when the dialog is confirmed (user clicks OK). */
  onDialogConfirm?: () => void;
  /** After the user clicks OK on dialog, should the overlay be removed? Default is true. */
  removeOverlayAfterConfirm?: boolean;
}
