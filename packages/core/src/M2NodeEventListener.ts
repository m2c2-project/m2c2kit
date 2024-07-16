import { M2EventListener } from "./M2EventListener";

export interface M2NodeEventListener<M2NodeEvent>
  extends M2EventListener<M2NodeEvent> {
  /** For composites that raise events, type of the composite node. */
  compositeType?: string;
  /** For composites that raise events, type of the composite event. */
  compositeEventType?: string;
  /** UUID of the node that the event listener is listening for. */
  nodeUuid: string;
}
