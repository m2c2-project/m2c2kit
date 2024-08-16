/**
 * This simple session runner is for testing and debugging the assessment.
 * This code is not included in the final build.
 */

import { Session } from "@m2c2kit/session";
import { SymbolSearch } from "./index";

const activity = new SymbolSearch();

// Set game parameters from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const gameParameters: { [key: string]: string } = {};
urlParams.forEach((value, key) => {
  gameParameters[key] = value;
});
activity.setParameters(gameParameters);

const session = new Session({
  activities: [activity],
});

session.onActivityData((ev) => {
  console.log("  newData: " + JSON.stringify(ev.newData));
});

session.initialize();
