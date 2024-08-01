/**
 * This simple session runner is for testing and debugging the assessment.
 * This code is not included in the final build.
 */

import { Session } from "@m2c2kit/session";
import { SymbolSearch } from "./index";

const s = new SymbolSearch();
//s.setParameters({ eruda: true, scripts: ["http://localhost:4000/target.js"]})

const session = new Session({
  activities: [s],
});

session.onActivityData((ev) => {
  console.log("  newData: " + JSON.stringify(ev.newData));
});

session.initialize();
