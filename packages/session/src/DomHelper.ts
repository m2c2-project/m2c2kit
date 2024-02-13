import { Activity, ActivityType } from "@m2c2kit/core";

export class DomHelper {
  /**
   * Add elements to hide the canvas and show a spinner.
   */
  static addLoadingElements(): void {
    const containerDiv = document.getElementById("m2c2kit-container-div");
    if (!containerDiv) {
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

      containerDiv.appendChild(overlayDiv);
      containerDiv.appendChild(spinnerDiv);
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
   * Shows or hides the spinner.
   *
   * @param visible - true if the spinner should be visible
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
    const canvasDiv = document.getElementById("m2c2kit-container-div");
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
