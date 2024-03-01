import { Session } from "@m2c2kit/session";
import { Embedding } from "@m2c2kit/embedding";
import { ColorDots } from "@m2c2kit/assessment-color-dots";
import { ColorShapes } from "@m2c2kit/assessment-color-shapes";
import { GridMemory } from "@m2c2kit/assessment-grid-memory";
import { SymbolSearch } from "@m2c2kit/assessment-symbol-search";
import { CliStarter } from "@m2c2kit/assessment-cli-starter";

const a1 = new ColorShapes();
const a2 = new ColorDots();
const a3 = new GridMemory();
const a4 = new SymbolSearch();
const a5 = new CliStarter();

const activities = [a1, a2, a3, a4, a5];

const session = new Session({
  activities: activities,
});

Embedding.initialize(session, { host: "MobileWebView" });

/**
 * Make session also available on window in case we want to control
 * the session through another means, such as other javascript or
 * browser code, or a mobile WebView.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).m2c2kitSession = session;
session.initialize();
