/**
 * This simple session runner is for testing and debugging the assessment.
 * This code is not included in the final build.
 */

import { Session } from "@m2c2kit/session";
import { CliStarter } from "./index";

const session = new Session({
  activities: [new CliStarter()],
});

session.onActivityData((ev) => {
  console.log("  newData: " + JSON.stringify(ev.newData));
});

session.initialize();
