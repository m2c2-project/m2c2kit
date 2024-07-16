import { M2Event } from "./M2Event";
import { M2Node } from "./M2Node";

/** Base interface for all M2Node events. */
export interface M2NodeEvent extends M2Event<M2Node> {
  /** The M2Node on which the event occurred. If the event has gone through serialization, the string will be the node's UUID. */
  target: M2Node | string;
}
