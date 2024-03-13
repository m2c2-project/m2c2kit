import { M2Event } from "./M2Event";
import { M2Node } from "./M2Node";

/** Base interface for all M2Node events. */
export interface M2NodeEvent extends M2Event<M2Node> {
  /** The M2Node on which the event occurred. */
  target: M2Node;
  /** For composites that raise events, type of the composite custom event. */
  compositeType?: string;
}
