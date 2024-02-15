import { Activity, ActivityType } from "@m2c2kit/core";

export class DomHelper {
  /**
   * Specifies the HTML element in which to render the m2c2kit activities.
   *
   * @param rootElement - the element to add the survey div and canvas div to
   */
  static createRoot(rootElement: HTMLElement): void {
    const surveyDiv = document.createElement("div");
    surveyDiv.setAttribute("id", "m2c2kit-survey-div");
    rootElement.appendChild(surveyDiv);

    const canvasDiv = document.createElement("div");
    canvasDiv.setAttribute("id", "m2c2kit-canvas-div");
    canvasDiv.className = "m2c2kit-full-viewport m2c2kit-flex-container";

    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", "m2c2kit-canvas");
    canvas.className = "m2c2kit-full-viewport";
    canvasDiv.appendChild(canvas);

    rootElement.appendChild(canvasDiv);
  }

  /**
   * Adds a style sheet to the head of the document.
   *
   * @param css - text of the CSS
   */
  static addStyleSheet(css: string): void {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);
  }

  /**
   * Add elements to hide the canvas and show a spinner.
   */
  static addLoadingElements(): void {
    const canvasDiv = document.getElementById("m2c2kit-canvas-div");
    if (!canvasDiv) {
      throw new Error("Could not find container element");
    }

    let overlayDiv = document.getElementById("m2c2kit-canvas-overlay-div");
    if (!overlayDiv) {
      overlayDiv = document.createElement("div");
      overlayDiv.setAttribute("id", "m2c2kit-canvas-overlay-div");
      overlayDiv.className = "m2c2kit-canvas-overlay m2c2kit-display-none";

      const spinnerDiv = document.createElement("div");
      spinnerDiv.setAttribute("id", "m2c2kit-spinner-div");
      spinnerDiv.className = "m2c2kit-spinner m2c2kit-display-none";

      canvasDiv.appendChild(overlayDiv);
      canvasDiv.appendChild(spinnerDiv);
    }
  }

  /**
   * Depending on the type of activity, set the visibility of the survey div
   * and canvas div.
   *
   * @param activity - the activity to configure the DOM for
   */
  static configureDomForActivity(activity: Activity): void {
    if (activity.type == ActivityType.Game) {
      this.setCanvasDivVisibility(true);
      this.setSurveyDivVisibility(false);
    }
    if (activity.type == ActivityType.Survey) {
      this.setCanvasDivVisibility(false);
      this.setSurveyDivVisibility(true);
      DomHelper.setBusyAnimationVisibility(false);
      DomHelper.setCanvasOverlayVisibility(false);
    }
  }

  /**
   * Hide the canvas div and survey div.
   */
  static hideM2c2Elements(): void {
    this.setCanvasDivVisibility(false);
    this.setSurveyDivVisibility(false);
  }

  /**
   * Shows or hides the canvas overlay.
   *
   * @param visible - true if the canvas overlay should be visible
   */
  static setCanvasOverlayVisibility(visible: boolean): void {
    const div = document.getElementById("m2c2kit-canvas-overlay-div");
    if (div) {
      if (visible) {
        div.classList.remove("m2c2kit-display-none");
      } else {
        div.classList.add("m2c2kit-display-none");
      }
    }
  }

  /**
   * Shows or hides the busy animation.
   *
   * @param visible - true if the busy animation should be visible
   */
  static setBusyAnimationVisibility(visible: boolean): void {
    const div = document.getElementById("m2c2kit-spinner-div");
    if (div) {
      if (visible) {
        div.classList.remove("m2c2kit-display-none");
      } else {
        div.classList.add("m2c2kit-display-none");
      }
    }
  }

  /**
   * Shows or hides the survey div.
   *
   * @param visible - true if the survey div should be visible
   */
  private static setSurveyDivVisibility(visible: boolean): void {
    const surveyDiv = document.getElementById("m2c2kit-survey-div");
    if (surveyDiv && visible) {
      surveyDiv.classList.remove("m2c2kit-display-none");
      surveyDiv.classList.add("m2c2kit-display-block");
    }
    if (surveyDiv && !visible) {
      surveyDiv.classList.add("m2c2kit-display-none");
      surveyDiv.classList.remove("m2c2kit-display-block");
    }
  }

  /**
   * Shows or hides the canvas div.
   *
   * @param visible - true if the canvas div should be visible
   */
  private static setCanvasDivVisibility(visible: boolean): void {
    const canvasDiv = document.getElementById("m2c2kit-canvas-div");
    if (canvasDiv && visible) {
      canvasDiv.classList.remove("m2c2kit-display-none");
      canvasDiv.classList.add("m2c2kit-flex-container");
    }
    if (canvasDiv && !visible) {
      canvasDiv.classList.add("m2c2kit-display-none");
      canvasDiv.classList.remove("m2c2kit-flex-container");
    }
  }
}
