/**
 * The base type for all m2c2kit events.
 *
 * @remarks I would have named it Event, but that would collide with
 * the existing DOM Event
 */
export interface EventBase {
  type: EventType;
  handled?: boolean;
}

export enum EventType {
  ActivityData = "ActivityData",
  ActivityLifecycle = "ActivityLifecycle",
  SessionLifecycle = "SessionLifecycle",
  TapDown = "TapDown",
  TapUp = "TapUp",
  TapUpAny = "TapUpAny",
  TapLeave = "TapLeave",
  PointerDown = "PointerDown",
  PointerUp = "PointerUp",
  PointerMove = "PointerMove",
  CompositeCustom = "CompositeCustom",
}
