import { M2NodeOptions } from "./M2NodeOptions";
import { M2Node } from "./M2Node";

export type M2NodeConstructor = new (options?: M2NodeOptions) => M2Node;
