import { Plugin } from "./Plugin";
import { M2Event } from "./M2Event";

/** Base interface for all Plugin events. */
export interface PluginEvent extends M2Event<Plugin> {
  target: Plugin;
}
