import { HtmlDialogOptions } from "./HtmlDialogOptions";

export class HtmlDialog {
  private overlay: HTMLDivElement;
  private dialog: HTMLDivElement;
  private message: HTMLParagraphElement;
  private button: HTMLButtonElement;
  private onDialogConfirm?: () => void;
  private removeOverlayAfterConfirm;
  private static activeDialog: HtmlDialog | null = null;

  /**
   * HtmlDialog class creates a custom dialog box.
   *
   * @remarks The dialog box is centered on the screen and has an overlay
   * background composed of a large character (e.g., an emoji). The dialog box
   * is shown using HTML and CSS, not drawing on a canvas, so that it will
   * reliably be shown even if there is an error in the assessment code.
   *
   * @param options - Options for the dialog box.
   */
  constructor(options: HtmlDialogOptions) {
    this.onDialogConfirm = options.onDialogConfirm;
    this.removeOverlayAfterConfirm = options.removeOverlayAfterConfirm ?? true;

    // overlay background
    this.overlay = document.createElement("div");
    this.overlay.style.position = "fixed";
    this.overlay.style.top = "0";
    this.overlay.style.left = "0";
    this.overlay.style.width = "100vw";
    this.overlay.style.height = "100vh";
    this.overlay.style.backgroundColor = "#fff";
    this.overlay.style.display = "flex";
    this.overlay.style.justifyContent = "center";
    this.overlay.style.alignItems = "center";
    this.overlay.style.zIndex = "1000";

    // character background element
    const background = document.createElement("div");
    background.textContent = options.backgroundCharacter ?? null;
    background.style.position = "absolute";
    background.style.fontSize = "20rem"; // Very large
    background.style.opacity = "0.40"; // Subtle appearance
    background.style.top = "50%";
    background.style.left = "50%";
    background.style.transform = "translate(-50%, -50%)";

    // dialog box
    this.dialog = document.createElement("div");
    this.dialog.style.backgroundColor = "#fff";
    this.dialog.style.padding = "20px";
    this.dialog.style.borderRadius = "10px";
    this.dialog.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.3)";
    this.dialog.style.textAlign = "center";
    this.dialog.style.minWidth = "200px";
    this.dialog.style.maxWidth = "75%";
    this.dialog.style.opacity = ".80";
    this.dialog.style.position = "relative"; // Add this to ensure it's above the emoji
    this.dialog.style.zIndex = "1001"; // Higher than the overlay

    this.message = document.createElement("p");
    this.message.textContent = options.message;
    this.message.style.marginBottom = "15px";
    this.message.style.fontFamily = "Arial, sans-serif";

    this.button = document.createElement("button");
    this.button.textContent = "OK";
    this.button.style.padding = "8px 15px";
    this.button.style.border = "none";
    this.button.style.backgroundColor = "#007bff";
    this.button.style.color = "#fff";
    this.button.style.borderRadius = "5px";
    this.button.style.cursor = "pointer";
    this.button.style.fontSize = "16px";
    this.button.style.fontFamily = "Arial, sans-serif";
    this.button.onclick = this.close.bind(this);

    this.dialog.appendChild(this.message);
    this.dialog.appendChild(this.button);
    this.overlay.appendChild(background);
    this.overlay.appendChild(this.dialog);
  }

  /**
   * Shows the dialog box. If another dialog is already visible,
   * it will be closed before showing this one.
   */
  public show(): void {
    // Close any existing dialog first
    if (HtmlDialog.activeDialog && HtmlDialog.activeDialog !== this) {
      HtmlDialog.activeDialog.forceClose();
    }

    HtmlDialog.activeDialog = this;
    document.body.appendChild(this.overlay);
  }

  /**
   * Checks if any dialog is currently being displayed
   *
   * @returns True if a dialog is currently visible
   */
  public static isDialogVisible(): boolean {
    return HtmlDialog.activeDialog !== null;
  }

  /**
   * Closes the dialog without triggering onDialogConfirm callback
   */
  private forceClose(): void {
    // Remove only the dialog box, keeping the overlay with emoji
    if (this.dialog.parentNode === this.overlay) {
      this.overlay.removeChild(this.dialog);
      if (this.removeOverlayAfterConfirm) {
        this.overlay.remove();
      }
    }
    this.button.onclick = null;
    HtmlDialog.activeDialog = null;
  }

  /**
   * Closes the dialog and calls the onDialogConfirm callback if provided
   */
  private close(): void {
    // Remove only the dialog box, keeping the overlay with emoji
    if (this.dialog.parentNode === this.overlay) {
      this.overlay.removeChild(this.dialog);
      if (this.removeOverlayAfterConfirm) {
        this.overlay.remove();
      }
    }
    this.button.onclick = null;
    HtmlDialog.activeDialog = null;
    if (this.onDialogConfirm) {
      this.onDialogConfirm();
    }
  }
}
