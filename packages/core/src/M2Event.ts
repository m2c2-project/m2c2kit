import { Composite } from "./Composite";
import { I18n } from "./I18n";
import { ImageManager } from "./ImageManager";
import { LocalizationOptions } from "./LocalizationOptions";
import { M2Node } from "./M2Node";
import { M2NodeEvent } from "./M2NodeEvent";
import { M2NodeOptions } from "./M2NodeOptions";
import { M2NodeType } from "./M2NodeType";
import { Scene } from "./Scene";
import { TransitionDirection, TransitionType } from "./Transition";

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
  type: M2EventType | string;
  /** The object on which the event occurred. If the event has gone through serialization, the string will be the object's UUID (if an `M2Node`) or class name. */
  target: T | string;
  /** Has the event been taken care of by the listener and not be dispatched to other targets? */
  handled?: boolean;
  /** Timestamp of the event, `from performance.now()` */
  timestamp: number;
  /** Timestamp of th event, from `new Date().toISOString()` */
  iso8601Timestamp: string;
  /** Sequence number of event.
   * @remarks Sequence number is guaranteed to reflect order of events, but
   * not necessarily contiguous, e.g., could be 1, 2, 5, 10, 11, 24.
   * */
  sequence?: number;
}

export interface DomPointerDownEvent extends M2Event<Element> {
  type: "DomPointerDown";
  target: Element;
  x: number;
  y: number;
}

export interface CompositeEvent extends M2NodeEvent {
  /** The Composite on which the event occurred. If the event has gone through serialization, the string will be the composite's UUID.  */
  target: Composite | string;
  type: "Composite";
  /** The type of the composite node. */
  compositeType: string;
  /** The type of the composite event. */
  compositeEventType: string;
  /** The composite event properties */
  [key: string]: number | string | boolean | object | null | undefined;
}

export interface M2NodeNewEvent extends M2Event<M2Node> {
  type: "NodeNew";
  target: M2Node;
  /** The type of the new node. */
  nodeType: M2NodeType | string;
  /** If a composite node, the type of the composite. */
  compositeType?: string;
  /** The options of the at the time of instantiation. This includes options for any base types and interfaces. */
  nodeOptions: M2NodeOptions;
}

export interface M2NodeAddChildEvent extends M2Event<M2Node> {
  type: "NodeAddChild";
  target: M2Node;
  /** The node's unique identifier (UUID). */
  uuid: string;
  /** The child node's unique identifier (UUID). */
  childUuid: string;
}

export interface M2NodeRemoveChildEvent extends M2Event<M2Node> {
  type: "NodeRemoveChild";
  target: M2Node;
  /** The node's unique identifier (UUID). */
  uuid: string;
  /** The child node's unique identifier (UUID). */
  childUuid: string;
}

export interface ScenePresentEvent extends M2Event<M2Node> {
  type: "ScenePresent";
  target: Scene;
  /** The node's unique identifier (UUID). */
  uuid: string;
  /** Transition type of the presented scene. */
  transitionType: TransitionType;
  direction?: TransitionDirection;
  duration?: number;
  easingType?: string;
}

export interface M2NodePropertyChangeEvent extends M2Event<M2Node> {
  type: "NodePropertyChange";
  target: M2Node;
  /** The node's unique identifier (UUID). */
  uuid: string;
  /** The property that changed. */
  property: string;
  /** The new value of the property. */
  value: string | number | boolean | object | null | undefined;
}

export interface BrowserImageDataReadyEvent extends M2Event<ImageManager> {
  type: "BrowserImageDataReady";
  target: ImageManager;
  /** The image name. */
  imageName: string;
  /** Width to scale image to */
  width: number;
  /** Height to scale image to */
  height: number;
  /** The image data URL. */
  dataUrl?: string;
  /** SVG string */
  svgString?: string;
}

export interface I18nDataReadyEvent extends M2Event<I18n> {
  type: "I18nDataReadyEvent";
  target: I18n;
  localizationOptions: LocalizationOptions;
}

/**
 * The different events that are dispatched by m2c2kit core.
 */
export const M2EventType = {
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
  Composite: "Composite",
  FrameDidSimulatePhysics: "FrameDidSimulatePhysics",
  SceneSetup: "SceneSetup",
  SceneAppear: "SceneAppear",
  ScenePresent: "ScenePresent",
  NodeNew: "NodeNew",
  NodeAddChild: "NodeAddChild",
  NodeRemoveChild: "NodeRemoveChild",
  NodePropertyChange: "NodePropertyChange",
  DomPointerDown: "DomPointerDown",
  BrowserImageDataReady: "BrowserImageDataReady",
  I18nDataReadyEvent: "I18nDataReadyEvent",
} as const;

export type M2EventType = (typeof M2EventType)[keyof typeof M2EventType];
