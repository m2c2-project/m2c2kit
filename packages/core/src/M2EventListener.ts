import { M2EventType } from "./M2Event";

/**
 * Base interface for all m2c2kit event listeners.
 */
export interface M2EventListener<T> {
  /** Type of event to listen for. */
  type: M2EventType | string;
  /** Callback function to be called when the event is dispatched. */
  callback: (event: T) => void;
  /** Optional key (string identifier) used to identify the event listener. */
  key?: string;
}
