import { Activity } from "./Activity";
import { Entity } from "./Entity";
import { Session } from "./Session";

/**
 * Base interface for all m2c2kit events.
 *
 * @remarks I would have named it Event, but that would collide with
 * the existing DOM Event
 */
export interface EventBase {
  /** Type of event. */
  type: EventType | string;
  /** The object on which the event occurred. */
  target: Entity | Session | Activity;
  /** Has the event been taken care of by the listener and not be dispatched to other targets? */
  handled?: boolean;
}

/**
 * The different events that are dispatched by m2c2kit core.
 */
export const EventType = {
  SessionInitialize: "SessionInitialize",
  SessionStart: "SessionStart",
  SessionEnd: "SessionEnd",
  ActivityStart: "ActivityStart",
  ActivityEnd: "ActivityEnd",
  ActivityCancel: "ActivityCancel",
  ActivityData: "ActivityData",
  TapDown: "TapDown",
  TapUp: "TapUp",
  TapUpAny: "TapUpAny",
  TapLeave: "TapLeave",
  PointerDown: "PointerDown",
  PointerUp: "PointerUp",
  PointerMove: "PointerMove",
  PointerLeave: "PointerLeave",
  Drag: "Drag",
  DragStart: "DragStart",
  DragEnd: "DragEnd",
  CompositeCustom: "CompositeCustom",
  FrameDidSimulatePhysics: "FrameDidSimulatePhysics",
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];
