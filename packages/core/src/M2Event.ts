/**
 * Base interface for all m2c2kit events.
 *
 * @remarks I would have named it Event, but that would collide with
 * the existing DOM Event
 */
export interface M2Event<T> {
  /** Type of event. */
  // It is a union type of EventType and string, so that we can define custom
  // event types in Composites and Plugins
  type: EventType | string;
  /** The object on which the event occurred. */
  target: T;
  /** Has the event been taken care of by the listener and not be dispatched to other targets? */
  handled?: boolean;
}

/**
 * The different events that are dispatched by m2c2kit core.
 */
export const EventType = {
  ActivityStart: "ActivityStart",
  ActivityEnd: "ActivityEnd",
  ActivityCancel: "ActivityCancel",
  ActivityData: "ActivityData",
  GameWarmupStart: "GameWarmupStart",
  GameWarmupEnd: "GameWarmupEnd",
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
  SceneSetup: "SceneSetup",
  SceneAppear: "SceneAppear",
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];
