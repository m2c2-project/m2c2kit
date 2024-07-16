import { Canvas, CanvasKit } from "canvaskit-wasm";
import { M2NodeEventListener } from "./M2NodeEventListener";
import { M2NodeEvent } from "./M2NodeEvent";
import { M2PointerEvent } from "./M2PointerEvent";
import { TapEvent } from "./TapEvent";
import { IDrawable } from "./IDrawable";
import { DrawableOptions } from "./DrawableOptions";
import { Action } from "./Action";
import { Layout } from "./Layout";
import { ConstraintType } from "./ConstraintType";
import { LayoutConstraint } from "./LayoutConstraint";
import { Constraints } from "./Constraints";
import { TextOptions } from "./TextOptions";
import { IText } from "./IText";
import { Size } from "./Size";
import { Point } from "./Point";
import { M2NodeOptions } from "./M2NodeOptions";
import { M2NodeType } from "./M2NodeType";
import { Scene } from "./Scene";
import { Uuid } from "./Uuid";
import {
  M2Event,
  M2EventType,
  M2NodeAddChildEvent,
  M2NodeNewEvent,
  M2NodeRemoveChildEvent,
  M2NodePropertyChangeEvent,
} from "./M2Event";
import { Game } from "./Game";
import { ActionType } from "./ActionType";
import { M2DragEvent } from "./M2DragEvent";
import { CallbackOptions } from "./CallbackOptions";
import { Composite } from "./Composite";
import { Timer } from "./Timer";
import { Equal } from "./Equal";
import { M2c2KitHelpers } from "./M2c2KitHelpers";

function handleDrawableOptions(
  drawable: IDrawable,
  options: DrawableOptions,
): void {
  if (options.anchorPoint) {
    drawable.anchorPoint = options.anchorPoint;
  }
  if (options.zPosition !== undefined) {
    drawable.zPosition = options.zPosition;
  }
}
function handleTextOptions(text: IText, options: TextOptions): void {
  if (options.text !== undefined) {
    text.text = options.text;
  }
  if (options.fontName !== undefined) {
    text.fontName = options.fontName;
  }
  if (options.fontColor) {
    text.fontColor = options.fontColor;
  }
  if (options.fontSize !== undefined) {
    text.fontSize = options.fontSize;
  }
  if (options.interpolation) {
    text.interpolation = options.interpolation;
  }

  if (options.localize !== undefined) {
    text.localize = options.localize;
  }
}
export function handleInterfaceOptions(
  node: M2Node,
  options: M2NodeOptions,
): void {
  if (node.isDrawable) {
    handleDrawableOptions(
      node as unknown as IDrawable,
      options as DrawableOptions,
    );
  }
  if (node.isText) {
    handleTextOptions(node as unknown as IText, options as TextOptions);
  }
}
export abstract class M2Node implements M2NodeOptions {
  type = M2NodeType.Node;
  isDrawable = false;
  isShape = false;
  isText = false;
  private _suppressEvents = false;
  options: M2NodeOptions;
  constructionTimeStamp: number;
  constructionIso8601TimeStamp: string;
  constructionSequence: number;
  // Node Options
  name: string;
  _position: Point = { x: 0, y: 0 }; // position of the node in the parent coordinate system
  _scale = 1.0;
  _alpha = 1.0;
  _zRotation = 0;
  protected _isUserInteractionEnabled = false;
  protected _draggable = false;
  protected _hidden = false;
  layout: Layout = {};

  _game?: Game;
  parent?: M2Node;
  children = new Array<M2Node>();
  absolutePosition: Point = { x: 0, y: 0 }; // position within the root coordinate system
  protected _size: Size = { width: 0, height: 0 };
  absoluteScale = 1.0;
  absoluteAlpha = 1.0;
  absoluteAlphaChange = 0;
  actions = new Array<Action>();
  queuedAction?: Action;
  eventListeners = new Array<M2NodeEventListener<M2NodeEvent>>();
  readonly uuid = Uuid.generate();
  needsInitialization = true;
  // library users might put anything in userData property
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData: any = {};
  loopMessages = new Set<string>();
  nodeEvents = new Array<M2Event<M2Node>>();

  /** Is the node in a pressed state? E.g., did the user put the pointer
   * down on the node and not yet release it? */
  pressed = false;
  withinHitArea = false;
  /** Is the node in a pressed state AND is the pointer within the node's
   * hit area? For example, a user may put the pointer down on the node, but
   * then move the pointer, while still down, beyond the node's hit area. In
   * this case, pressed = true, but pressedAndWithinHitArea = false. */
  pressedAndWithinHitArea = false;
  /** When the node initially enters the pressed state, what is the pointer
   * offset? (offset from the canvas's origin to the pointer position). We
   * save this because it will be needed if this press then led to a drag. */
  pressedInitialPointerOffset: Point = { x: NaN, y: NaN };
  /** What was the previous pointer offset when the node was in a dragging
   * state? */
  draggingLastPointerOffset: Point = { x: NaN, y: NaN };
  /** Is the node in a dragging state? */
  dragging = false;

  constructor(options: M2NodeOptions = {}) {
    /**
     * suppressEvents *must* be set early in the constructor because it
     * determines if other properties set in the constructor are saved as
     * property change events.
     */
    if (options.suppressEvents !== undefined) {
      this.suppressEvents = options.suppressEvents;
    }
    this.constructionTimeStamp =
      Number.isNaN(m2c2Globals?.now) || m2c2Globals?.now === undefined
        ? Timer.now()
        : m2c2Globals.now;
    this.constructionIso8601TimeStamp = new Date().toISOString();
    this.constructionSequence = m2c2Globals.eventSequence;
    this.options = options;
    if (options.uuid !== undefined) {
      this.uuid = options.uuid;
    }
    if (options.name === undefined) {
      this.name = this.uuid;
    } else {
      this.name = options.name;
    }
    if (options.position !== undefined) {
      this.position = options.position;
    }
    if (options.scale !== undefined) {
      this.scale = options.scale;
    }
    if (options.alpha !== undefined) {
      this.alpha = options.alpha;
    }
    if (options.zRotation !== undefined) {
      this.zRotation = options.zRotation;
    }
    if (options.isUserInteractionEnabled !== undefined) {
      this.isUserInteractionEnabled = options.isUserInteractionEnabled;
    }
    if (options.draggable !== undefined) {
      this.draggable = options.draggable;
    }
    if (options.hidden !== undefined) {
      this.hidden = options.hidden;
    }
    if (options.layout !== undefined) {
      this.layout = options.layout;
    }
  }

  // we will override this in each derived class. This method will never be called.
  initialize(): void {
    throw new Error("initialize() called in abstract base class Node.");
  }

  protected get completeNodeOptions(): M2NodeOptions {
    throw new Error(
      "get completeNodeOptions() called in abstract base class Node.",
    );
  }

  /**
   * Save the node's construction event in the event store.
   */
  protected saveNodeNewEvent(): void {
    if (this.suppressEvents) {
      return;
    }

    const nodeNewEvent: M2NodeNewEvent = {
      type: M2EventType.NodeNew,
      target: this,
      nodeType: this.type,
      compositeType:
        this.type === M2NodeType.Composite
          ? (this as unknown as Composite).compositeType
          : undefined,
      timestamp: this.constructionTimeStamp,
      iso8601Timestamp: this.constructionIso8601TimeStamp,
      nodeOptions: this.completeNodeOptions,
      sequence: this.constructionSequence,
    };
    this.saveEvent(nodeNewEvent);
  }

  /**
   * Saves the node's property change event in the event store.
   *
   * @param property - property name
   * @param value - property value
   */
  protected savePropertyChangeEvent(
    property: string,
    value: string | number | boolean | object | null | undefined,
  ): void {
    if (this.suppressEvents) {
      return;
    }
    const nodePropertyChangeEvent: M2NodePropertyChangeEvent = {
      type: M2EventType.NodePropertyChange,
      target: this,
      uuid: this.uuid,
      property: property,
      value: value,
      ...M2c2KitHelpers.createFrameUpdateTimestamps(),
    };
    this.saveEvent(nodePropertyChangeEvent);
  }

  /**
   * Saves the node's event.
   *
   * @remarks If the game event store is not available, the event is saved
   * within the node's `nodeEvents` event array. It will be added to the game
   * event store when the node is added to the game.
   *
   * @param event - event to save
   */
  protected saveEvent(event: M2Event<M2Node>): void {
    if (event.sequence === undefined) {
      event.sequence = m2c2Globals.eventSequence;
    }
    try {
      this.game.eventStore.addEvent(event);
    } catch {
      this.nodeEvents.push(event);
    }
  }

  /**
   * The game which this node is a part of.
   *
   * @remarks Throws error if node is not part of the game object.
   */
  get game(): Game {
    const findParentScene = (node: M2Node): Scene => {
      if (!node.parent) {
        throw new Error(`Node ${this} has not been added to a scene.`);
      } else if (node.parent.type === M2NodeType.Scene) {
        return node.parent as Scene;
      } else {
        return findParentScene(node.parent);
      }
    };

    return findParentScene(this).game;
  }

  /**
   * Determines if the node has been added to the game object.
   *
   * @returns true if node has been added
   */
  private isPartOfGame(): boolean {
    /**
     * getter this.game throws error if undefined; thus, to check if this.game
     * is undefined we must check the backing variable, _game.
     */
    if (this.type === M2NodeType.Scene && this._game === undefined) {
      return false;
    }
    if (this.type === M2NodeType.Scene && this._game !== undefined) {
      return true;
    }

    const findParentScene = (node: M2Node): Scene | undefined => {
      if (!node.parent) {
        return undefined;
      } else if (node.parent.type === M2NodeType.Scene) {
        return node.parent as Scene;
      } else {
        return findParentScene(node.parent);
      }
    };

    return findParentScene(this)?._game !== undefined;
  }

  /**
   * Overrides toString() and returns a human-friendly description of the node.
   *
   * @remarks Inspiration from https://stackoverflow.com/a/35361695
   */
  public toString = (): string => {
    let type = this.type.toString();
    if (this.type == M2NodeType.Composite) {
      type = (this as unknown as Composite).compositeType;
    }

    if (this.name !== this.uuid) {
      return `${this.name} (${type}, ${this.uuid})`;
    } else {
      return `${type} (${this.uuid})`;
    }
  };

  /**
   * Adds a child to this parent node. Throws exception if the child's name
   * is not unique with respect to other children of this parent, or if the
   * child has already been added to another parent.
   *
   * @param child - The child node to add
   */
  addChild(child: M2Node): void {
    const suppressEvents = this.suppressEvents || child.suppressEvents;
    // Do not allow a child to be added to itself
    if (child === this) {
      throw new Error(
        `Cannot add node ${child.toString()} as a child to itself.`,
      );
    }

    // Do not allow a scene to be child of another node.
    if (child.type == M2NodeType.Scene) {
      throw new Error(
        `Cannot add scene ${child.toString()} as a child to node ${this.toString()}. A scene cannot be the child of a node. A scene can only be added to a game object.`,
      );
    }

    // Do not allow duplicate child names; but do not check if this child has
    // a duplicate name because itself has already been added to this parent.
    // We check that condition later.
    if (
      this.children
        .filter((c) => c !== child)
        .map((c) => c.name)
        .includes(child.name)
    ) {
      throw new Error(
        `Cannot add child node ${child.toString()} to parent node ${this.toString()}. A child with name "${
          child.name
        }" already exists on this parent.`,
      );
    }

    // Type is M2Node | undefined because a scene has an undefined parent.
    let otherParents = new Array<M2Node | undefined>();

    if (this.isPartOfGame()) {
      // node has been added to game; can check all the other game nodes.
      otherParents = this.game.nodes.filter((e) => e.children.includes(child));
    } else {
      // node not added to game; can check only this node's descendants.
      const descendants = this.descendants;
      if (descendants.includes(child)) {
        otherParents = descendants
          .filter((d) => d.children.includes(child))
          .map((d) => d.parent ?? undefined);
      }
    }

    // Allow child to be added only if it has no other parents.
    if (otherParents.length === 0) {
      child.parent = this;
      this.children.push(child);

      const nodeAddChildEvent: M2NodeAddChildEvent = {
        type: "NodeAddChild",
        target: this,
        uuid: this.uuid,
        childUuid: child.uuid,
        ...M2c2KitHelpers.createFrameUpdateTimestamps(),
      };
      if (!suppressEvents) {
        this.saveEvent(nodeAddChildEvent);
      }
      this.saveChildEvents(child);
      return;
    }

    const firstOtherParent = otherParents.find(Boolean);

    if (firstOtherParent === this) {
      throw new Error(
        `Cannot add child node ${child.toString()} to parent node ${this.toString()}. This child already exists on this parent. The child cannot be added again.`,
      );
    }

    throw new Error(
      `Cannot add child node ${child.toString()} to parent node ${this.toString()}. This child already exists on other parent node: ${firstOtherParent?.toString()}}. Remove the child from the other parent first.`,
    );
  }

  /**
   * Saves the child's events to the parent node.
   *
   * @remarks When a child is added to a parent, the parent receives all the
   * child's events and saves them.
   *
   * @param child - child node to save events to parent node
   */
  private saveChildEvents(child: M2Node) {
    child.nodeEvents.forEach((ev) => {
      this.saveEvent(ev);
    });
    child.nodeEvents.length = 0;

    for (const c of child.children) {
      this.saveChildEvents(c);
    }
  }

  /**
   * Removes all children from the node.
   */
  removeAllChildren(): void {
    this.children.forEach((child) => this.removeChild(child));
  }

  /**
   * Removes the specific child from this parent node. Throws exception if
   * this parent does not contain the child.
   *
   * @param child
   */
  removeChild(child: M2Node): void {
    const suppressEvents = this.suppressEvents || child.suppressEvents;
    if (this.children.includes(child)) {
      child.parent = undefined;
      this.children = this.children.filter((c) => c !== child);
    } else {
      throw new Error(
        `cannot remove node ${child} from parent ${this} because the node is not currently a child of the parent`,
      );
    }

    const nodeRemoveChildEvent: M2NodeRemoveChildEvent = {
      type: "NodeRemoveChild",
      target: this,
      uuid: this.uuid,
      childUuid: child.uuid,
      ...M2c2KitHelpers.createFrameUpdateTimestamps(),
    };
    if (!suppressEvents) {
      this.saveEvent(nodeRemoveChildEvent);
    }
  }

  /**
   * Removes the children from the parent. Throws error if the parent does not
   * contain all of the children.
   *
   * @param children - An array of children to remove from the parent node
   */
  removeChildren(children: Array<M2Node>): void {
    children.forEach((child) => {
      if (!this.children.includes(child)) {
        throw new Error(
          `cannot remove node ${child} from parent ${this} because the node is not currently a child of the parent`,
        );
      }
      this.removeChild(child);
    });
  }

  /**
   * Searches all descendants by name and returns first matching node.
   *
   * @remarks Descendants are children and children of children, recursively.
   * Throws exception if no descendant with the given name is found.
   *
   * @param name - Name of the descendant node to return
   * @returns
   */
  descendant<T extends M2Node>(name: string): T {
    const descendant = this.descendants
      .filter((child) => child.name === name)
      .find(Boolean);
    if (descendant === undefined) {
      throw new Error(
        `descendant with name ${name} not found on parent ${this.toString()}`,
      );
    }
    return descendant as T;
  }

  /**
   * Returns all descendant nodes.
   *
   * @remarks Descendants are children and children of children, recursively.
   */
  get descendants(): Array<M2Node> {
    function getChildNodesRecursive(node: M2Node, nodes: Array<M2Node>): void {
      nodes.push(node);
      node.children.forEach((child) => getChildNodesRecursive(child, nodes));
    }
    const nodes = new Array<M2Node>();
    this.children.forEach((child) => getChildNodesRecursive(child, nodes));
    return nodes;
  }

  /**
   * Returns all ancestor nodes, not including the node itself.
   */
  get ancestors(): Array<M2Node> {
    function getAncestorsRecursive(
      node: M2Node,
      nodes: Array<M2Node>,
    ): Array<M2Node> {
      if (node.type == M2NodeType.Scene || !node.parent) {
        return nodes;
      }
      nodes.push(node.parent);
      return getAncestorsRecursive(node.parent, nodes);
    }
    const nodes = new Array<M2Node>();
    return getAncestorsRecursive(this, nodes);
  }

  /**
   * Determines if this node or ancestor is part of an active action that
   * affects it appearance.
   *
   * @remarks This is used to determine if the node should be rendered with
   * anti-aliasing or not. Anti-aliasing on some devices causes a new shader
   * to be compiled during the action, which causes jank.
   *
   * @returns true if part of active action affecting appearance
   */
  involvedInActionAffectingAppearance(): boolean {
    const nodes = this.ancestors.concat(this);
    const actions = nodes.flatMap((node) => node.actions);
    return actions.some(
      (action) =>
        action.running &&
        (action.type === ActionType.Move || action.type === ActionType.Scale),
    );
  }

  /**
   * Determines if the node is a transitioning Scene or a descendant of a
   * transitioning Scene.
   *
   * @returns true if transitioning
   */
  involvedInSceneTransition(): boolean {
    let rootScene: Scene;
    if (this.type === M2NodeType.Scene) {
      rootScene = this as unknown as Scene;
    } else {
      rootScene = this.parentSceneAsNode as unknown as Scene;
    }
    return rootScene._transitioning;
  }

  /**
   * Executes a callback when the user presses down on the node.
   *
   * @remarks TapDown is a pointer down (mouse click or touches begin) within
   * the bounds of the node.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onTapDown(
    callback: (tapEvent: TapEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.TapDown, callback, options);
  }

  /**
   * Executes a callback when the user releases a press, that has been fully
   * within the node, from the node.
   *
   * @remarks TapUp is a pointer up (mouse click release or touches end) within
   * the bounds of the node and the pointer, while down, has never moved
   * beyond the bounds of the node.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}ue.
   */
  onTapUp(
    callback: (tapEvent: TapEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.TapUp, callback, options);
  }

  /**
   * Executes a callback when the user releases a press from the node within
   * the bounds of the node.
   *
   * @remarks TapUpAny is a pointer up (mouse click release or touches end)
   * within the bounds of the node and the pointer, while down, is allowed to
   * have been beyond the bounds of the node during the press before the
   * release.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onTapUpAny(
    callback: (tapEvent: TapEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.TapUpAny, callback, options);
  }

  /**
   * Executes a callback when the user moves the pointer (mouse, touches) beyond
   * the bounds of the node while the pointer is down.
   *
   * @remarks TapLeave occurs when the pointer (mouse, touches) that has
   * previously pressed the node moves beyond the bounds of the node
   * before the press release.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onTapLeave(
    callback: (tapEvent: TapEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.TapLeave, callback, options);
  }

  /**
   * Executes a callback when the pointer first is down on the node.
   *
   * @remarks PointerDown is a pointer down (mouse click or touches begin) within
   * the bounds of the node. It occurs under the same conditions as TapDown.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onPointerDown(
    callback: (m2PointerEvent: M2PointerEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.PointerDown, callback, options);
  }

  /**
   * Executes a callback when the user releases a press from the node within
   * the bounds of the node.
   *
   * @remarks PointerUp is a pointer up (mouse click release or touches end)
   * within the bounds of the node. It does not require that there was a
   * previous PointerDown on the node.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onPointerUp(
    callback: (m2PointerEvent: M2PointerEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.PointerUp, callback, options);
  }

  /**
   * Executes a callback when the user moves the pointer (mouse or touches)
   * within the bounds of the node.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onPointerMove(
    callback: (m2PointerEvent: M2PointerEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.PointerMove, callback, options);
  }

  /**
   * Executes a callback when the user moves the pointer (mouse or touches)
   * outside the bounds of the node.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onPointerLeave(
    callback: (m2PointerEvent: M2PointerEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.PointerLeave, callback, options);
  }

  /**
   * Executes a callback when the user begins dragging a node.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onDragStart(
    callback: (m2DragEvent: M2DragEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.DragStart, callback, options);
  }

  /**
   * Executes a callback when the user continues dragging a node.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onDrag(
    callback: (m2DragEvent: M2DragEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.Drag, callback, options);
  }

  /**
   * Executes a callback when the user stop dragging a node.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onDragEnd(
    callback: (m2DragEvent: M2DragEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.DragEnd, callback, options);
  }

  addEventListener<T extends M2NodeEvent>(
    type: M2EventType | string,
    callback: (ev: T) => void,
    callbackOptions?: CallbackOptions,
  ): void {
    const eventListener: M2NodeEventListener<T> = {
      type: type,
      nodeUuid: this.uuid,
      callback: callback,
    };

    if (callbackOptions?.replaceExisting) {
      this.eventListeners = this.eventListeners.filter(
        (listener) =>
          !(
            listener.nodeUuid === eventListener.nodeUuid &&
            listener.type === eventListener.type
          ),
      );
    }
    this.eventListeners.push(eventListener as M2NodeEventListener<M2NodeEvent>);
  }

  private parseLayoutConstraints(
    constraints: Constraints,
    allGameNodes: Array<M2Node>,
  ): Array<LayoutConstraint> {
    const layoutConstraints = new Array<LayoutConstraint>();

    // create an array of all possible constraintType enum values
    const constraintTypes = Object.values(ConstraintType);

    // for every possible constraint type, check if the provided
    // constraints object has that type. If it does, create a
    // LayoutConstraint object that describes it.
    // (a layoutConstraint object, which is an instance of the
    // LayoutConstraint CLASS, is easier to work with than the values in
    // the constraints object, which is defined by the Constraints INTERFACE)
    //
    constraintTypes.forEach((constraintType) => {
      if (constraints[constraintType] !== undefined) {
        let node: M2Node | undefined;
        let additionalExceptionMessage = "";

        if (typeof constraints[constraintType] === "object") {
          node = constraints[constraintType] as M2Node;
        } else {
          const nodeName = constraints[constraintType] as string;
          node = allGameNodes
            .filter((e) => e.name === nodeName || e.uuid === nodeName)
            .find(Boolean);
          if (!node) {
            node = this.game.materializedNodes
              .filter((e) => e.name === nodeName || e.uuid === nodeName)
              .find(Boolean);
          }
          additionalExceptionMessage = `. sibling node named "${nodeName}" has not been added to the game object`;
        }

        if (node === undefined) {
          throw new Error(
            "could not find sibling node for constraint" +
              additionalExceptionMessage,
          );
        }

        const layoutConstraint = new LayoutConstraint(constraintType, node);
        layoutConstraints.push(layoutConstraint);
      }
    });

    return layoutConstraints;
  }

  private calculateYFromConstraint(
    constraint: LayoutConstraint,
    marginTop: number,
    marginBottom: number,
    scale: number,
  ): number {
    // no matter what the constraint, we start with the alter's position
    let y = constraint.alterNode.absolutePosition.y;

    if (constraint.alterNodeMinimum) {
      // we're constraining to the alter's minimum (top)
      // if the alter is NOT a scene, then to get the top of the alter
      // we have to subtract half of the alter's height because positions
      // are relative to the alter's anchor
      // TODO: don't assume .5 ANCHOR
      // But if the alter IS a scene, there's no need to make this
      // calculate because the scene is the root coordinate system and
      // it's top by definition is 0
      if (!(constraint.alterNode.type === M2NodeType.Scene)) {
        y = y - constraint.alterNode.size.height * 0.5 * scale;
      }
    } else {
      if (!(constraint.alterNode.type === M2NodeType.Scene)) {
        y = y + constraint.alterNode.size.height * 0.5 * scale;
      } else {
        y = y + constraint.alterNode.size.height * scale;
      }
    }
    if (constraint.focalNodeMinimum) {
      y = y + this.size.height * 0.5 * scale;
      y = y + marginTop * scale;
    } else {
      y = y - this.size.height * 0.5 * scale;
      y = y - marginBottom * scale;
    }
    return y;
  }

  private calculateXFromConstraint(
    constraint: LayoutConstraint,
    marginStart: number,
    marginEnd: number,
    scale: number,
  ): number {
    let x = constraint.alterNode.absolutePosition.x;

    if (constraint.alterNodeMinimum) {
      if (!(constraint.alterNode.type === M2NodeType.Scene)) {
        x = x - constraint.alterNode.size.width * 0.5 * scale;
      }
    } else {
      if (!(constraint.alterNode.type === M2NodeType.Scene)) {
        x = x + constraint.alterNode.size.width * 0.5 * scale;
      } else {
        x = x + constraint.alterNode.size.width * scale;
      }
    }
    if (constraint.focalNodeMinimum) {
      x = x + this.size.width * 0.5 * scale;
      x = x + marginStart * scale;
    } else {
      x = x - this.size.width * 0.5 * scale;
      x = x - marginEnd * scale;
    }
    return x;
  }

  /**
   * Calculates the absolute alpha of the node, taking into account the
   * alpha of all ancestor parent nodes.
   *
   * @remarks Alpha has multiplicative inheritance from all ancestors.
   *
   * @param alpha - Opacity of the node
   * @param ancestors - Array of ancestor parent nodes
   * @returns
   */
  private calculateAbsoluteAlpha(alpha: number, ancestors: M2Node[]): number {
    const inheritedAlpha = ancestors.reduce((acc, ancestor) => {
      return acc * ancestor.alpha;
    }, 1);
    return alpha * inheritedAlpha;
  }

  update(): void {
    if (this.needsInitialization) {
      // note: the below initialize() function will be called on the DERIVED CLASS's initialize(),
      // never this base abstract M2Node
      this.initialize();
      /**
       * Previously, we set this.needsInitialization to false here. However,
       * we now let each node's initialize() method to determine when it is
       * initialized. This is because some nodes are using assets that
       * have deferred loading, and only the node knows when it has finished
       * initialization.
       */
    }

    this.absoluteAlphaChange =
      this.calculateAbsoluteAlpha(this.alpha, this.ancestors) -
      this.absoluteAlpha;
    this.absoluteAlpha += this.absoluteAlphaChange;

    if (this.parent === undefined) {
      // if there's no parent, then this node is a screen
      this.absolutePosition.x = this.position.x * this.scale;
      this.absolutePosition.y = this.position.y * this.scale;
      this.absoluteScale = this.scale;
    } else {
      // this node has a parent; it inherits the parent's scale
      this.absoluteScale = this.parent.absoluteScale * this.scale;

      if (this.layout?.constraints === undefined) {
        // node sets its position directly using its position property
        this.absolutePosition.x =
          this.parent.absolutePosition.x +
          this.position.x * this.parent.absoluteScale;
        this.absolutePosition.y =
          this.parent.absolutePosition.y +
          this.position.y * this.parent.absoluteScale;
      } else {
        // node sets its position using layout approach, with constraints.
        // this is much more complicated than using only the node's
        // position property.
        const horizontalBias = this.layout?.constraints?.horizontalBias ?? 0.5;
        const verticalBias = this.layout?.constraints?.verticalBias ?? 0.5;
        const marginTop = this.layout?.marginTop ?? 0;
        const marginBottom = this.layout?.marginBottom ?? 0;
        const marginStart = this.layout?.marginStart ?? 0;
        const marginEnd = this.layout?.marginEnd ?? 0;

        const layoutConstraints = this.parseLayoutConstraints(
          this.layout?.constraints,
          //this.parentScene.game.nodes
          this.parentSceneAsNode.descendants,
        );

        const scale = this.parent.absoluteScale;

        const yPositions = layoutConstraints
          .filter((constraint) => constraint.verticalConstraint)
          .map((constraint) =>
            this.calculateYFromConstraint(
              constraint,
              marginTop,
              marginBottom,
              scale,
            ),
          );

        if (yPositions.length === 0) {
          // log a warning of there being no y constraint
        } else if (yPositions.length === 1) {
          this.absolutePosition.y = yPositions[0];
        } else if (yPositions.length === 2) {
          this.absolutePosition.y =
            Math.min(yPositions[0], yPositions[1]) +
            verticalBias * Math.abs(yPositions[0] - yPositions[1]);
        } else {
          // log a warning of there being too many y constraints
        }

        const xPositions = layoutConstraints
          .filter((constraint) => !constraint.verticalConstraint)
          .map((constraint) =>
            this.calculateXFromConstraint(
              constraint,
              marginStart,
              marginEnd,
              scale,
            ),
          );

        if (xPositions.length === 0) {
          // log a warning of there being no x constraint
        } else if (xPositions.length === 1) {
          this.absolutePosition.x = xPositions[0];
        } else if (xPositions.length === 2) {
          this.absolutePosition.x =
            Math.min(xPositions[0], xPositions[1]) +
            horizontalBias * Math.abs(xPositions[0] - xPositions[1]);
        } else {
          // log a warning of there being too many x constraints
        }
      }
    }

    this.actions.forEach((action) =>
      Action.evaluateAction(
        action,
        this,
        m2c2Globals.now,
        m2c2Globals.deltaTime,
      ),
    );

    // Update the node's children
    //
    // If a node uses positioning based only on the position property,
    // it does not matter in what order the children are updated. If the
    // node uses layout constraints, however, one sibling's position
    // may depend on another (e.g., the top of node A is the bottom of
    // node B). The update of siblings must be properly ordered so that
    // dependencies are resolved prior to the positioning calculations (e.g.,
    // we must update node B before we update node A).
    //
    // We can solve this by modeling sibling constraint dependencies as a
    // Directed acyclic graph (DAG) and applying a topological sort.
    // We then update the siblings in the topological sort reverse order
    // (Why reverse order? The topological sort is ordered so that vertexes
    // with in degree 0 come first; these are the vertexes whose positions
    // depend on others, but no other vertexes depend on them for
    // positioning. We must update these last).
    //
    /**
     * Get the uuids of all the sibling nodes that this focal
     * node's constraints depend on. Ignore parent constraints, because
     * the parent will have been updated already.
     *
     * @param parent - The focal node's parent
     * @param constraints - The focal node's constraints
     * @returns Array<string> - the uuids of the siblings the focal node depends on
     */
    function getSiblingConstraintUuids(
      parent: M2Node,
      constraints: Constraints | undefined,
    ): Array<string> {
      const uuids = new Array<string>();
      if (constraints === undefined) {
        return uuids;
      }
      const constraintTypes = Object.values(ConstraintType);
      constraintTypes.forEach((constraint) => {
        if (constraints[constraint] !== undefined) {
          let siblingConstraint: M2Node | undefined;
          let additionalExceptionMessage = "";

          if (typeof constraints[constraint] === "object") {
            siblingConstraint = constraints[constraint] as M2Node;
          } else {
            const nodeName = constraints[constraint] as string;
            let allGameNodes: Array<M2Node>;
            if (parent.type === M2NodeType.Scene) {
              //allGameNodes = (parent as Scene).game.nodes;
              allGameNodes = parent.descendants;
            } else {
              //allGameNodes = parent.parentScene.game.nodes;
              allGameNodes = parent.parentSceneAsNode.descendants;
            }
            siblingConstraint = allGameNodes
              .filter((e) => e.name === nodeName || e.uuid === nodeName)
              .find(Boolean);

            if (siblingConstraint === undefined) {
              siblingConstraint = parent.game.materializedNodes
                .filter((e) => e.name === nodeName || e.uuid === nodeName)
                .find(Boolean);
            }

            if (siblingConstraint === undefined) {
              additionalExceptionMessage = `. sibling node named "${nodeName}" has not been added to the game object`;
            }
          }

          if (siblingConstraint === undefined) {
            throw new Error(
              "error getting uuid of sibling constraint" +
                additionalExceptionMessage,
            );
          }

          // as of now, we only need to get uuids of siblings because
          // we don't allow nested layouts
          // TODO: allow nested layouts.
          if (siblingConstraint !== parent) {
            uuids.push(siblingConstraint.uuid);
          }
        }
      });
      return uuids;
    }

    // Model the DAG in a Map where the key is the uuid of the focal node,
    // and the value is an array of other node uuids that this focal node
    // depends on for layout
    const adjList = new Map<string, string[]>();
    this.children.forEach((child) => {
      adjList.set(
        child.uuid,
        getSiblingConstraintUuids(this, child.layout?.constraints),
      );
    });

    const sortedUuids = this.findTopologicalSort(adjList);
    if (sortedUuids.length > 0) {
      const uuidsInUpdateOrder = sortedUuids.reverse();
      const childrenInUpdateOrder = new Array<M2Node>();

      uuidsInUpdateOrder.forEach((uuid) => {
        const child = this.children
          .filter((c) => c.uuid === uuid)
          .find(Boolean);
        if (child === undefined) {
          throw new Error("error in dag topological sort");
        }
        childrenInUpdateOrder.push(child);
      });
      childrenInUpdateOrder.forEach((child) => child.update());
    } else {
      this.children.forEach((child) => child.update());
    }
  }

  /**
   * Draws each child node that is Drawable and is not hidden, by zPosition
   * order (highest zPosition on top).
   *
   * @param canvas - CanvasKit canvas
   */
  drawChildren(canvas: Canvas): void {
    this.children
      .filter((child) => !child.hidden && child.isDrawable)
      .map((child) => child as unknown as IDrawable)
      .sort((a, b) => a.zPosition - b.zPosition)
      .forEach((child) => child.draw(canvas));
  }

  /**
   * Runs an action on this node.
   *
   * @remarks If the node is part of an active scene, the action runs
   * immediately. Otherwise, the action will run when the node's scene
   * becomes active. Calling run() multiple times on a node will add
   * to existing actions, not replace them.
   *
   * @param action - The action to run
   * @param key - key (string identifier) used to identify the action.
   * Only needed if the action will be referred to later
   */
  run(action: Action, key?: string): void {
    /**
     * Originally, this was this.actions = action.initialize(key), which
     * would immediately replace all existing actions with the new actions.
     * However, we want to allow multiple actions to be run on a node at
     * the same time, so we push the new actions onto the actions array.
     */
    this.actions.push(action.initialize(key));
  }

  /**
   * Remove an action from this node. If the action is running, it will be
   * stopped.
   *
   * @param key - key (string identifier) of the action to remove
   */
  removeAction(key: string): void {
    this.actions = this.actions.filter((action) => action.key !== key);
  }

  /**
   * Remove all actions from this node. If actions are running, they will be
   * stopped.
   */
  removeAllActions(): void {
    while (this.actions.length) {
      this.actions.pop();
    }
  }

  /**
   * Duplicates a node using deep copy.
   *
   * @remarks This is a deep recursive clone (node and children).
   * The uuid property of all duplicated nodes will be newly created,
   * because uuid must be unique.
   *
   * @param newName - optional name of the new, duplicated node. If not
   * provided, name will be the new uuid
   */
  abstract duplicate(newName?: string): M2Node;

  protected getNodeOptions(): M2NodeOptions {
    const nodeOptions = {
      name: this.name,
      position: this.position,
      scale: this.scale,
      alpha: this.alpha,
      zRotation: this.zRotation,
      isUserInteractionEnabled: this.isUserInteractionEnabled,
      draggable: this.draggable,
      hidden: this.hidden,
      layout: this.layout,
      uuid: this.uuid,
    };
    return nodeOptions;
  }

  protected getDrawableOptions(): DrawableOptions {
    if (!this.isDrawable) {
      throw new Error(
        "getDrawableOptions() called object that is not IDrawable",
      );
    }
    const drawableOptions = {
      anchorPoint: (this as unknown as IDrawable).anchorPoint,
      zPosition: (this as unknown as IDrawable).zPosition,
    };
    return drawableOptions;
  }

  protected getTextOptions(): TextOptions {
    if (!this.isText) {
      throw new Error("getTextOptions() called object that is not IText");
    }

    const textOptions = {
      text: (this as unknown as IText).text,
      fontName: (this as unknown as IText).fontName,
      fontColor: (this as unknown as IText).fontColor,
      fontSize: (this as unknown as IText).fontSize,
    };
    return textOptions;
  }

  /**
   * Gets the scene that contains this node by searching up the ancestor tree recursively. Throws exception if node is not part of a scene.
   *
   * @returns Scene that contains this node
   */
  // get parentScene(): Scene {
  //   if (this.type === M2NodeType.scene) {
  //     throw new Error(
  //       `Node ${this} is a scene and cannot have a parent scene`
  //     );
  //   }
  //   if (this.parent && this.parent.type === M2NodeType.scene) {
  //     return this.parent as Scene;
  //   } else if (this.parent) {
  //     return this.parent.parentScene;
  //   }
  //   throw new Error(`Node ${this} has not been added to a scene`);
  // }

  get canvasKit(): CanvasKit {
    return this.game.canvasKit;
  }

  get parentSceneAsNode(): M2Node {
    if (this.type === M2NodeType.Scene) {
      throw new Error(`Node ${this} is a scene and cannot have a parent scene`);
    }
    if (this.parent && this.parent.type === M2NodeType.Scene) {
      return this.parent;
    } else if (this.parent) {
      return this.parent.parentSceneAsNode;
    }
    throw new Error(`Node ${this} has not been added to a scene`);
  }

  get size(): Size {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const node = this;
    return {
      get height(): number {
        return node._size.height;
      },
      set height(height: number) {
        if (Equal.value(node._size.height, height)) {
          return;
        }
        node._size.height = height;
        node.savePropertyChangeEvent("size", node.size);
      },
      get width(): number {
        return node._size.width;
      },
      set width(width: number) {
        if (Equal.value(node._size.width, width)) {
          return;
        }
        node._size.width = width;
        node.savePropertyChangeEvent("size", node.size);
      },
    };
  }
  set size(size: Size) {
    if (Equal.value(this._size.width, size.width)) {
      return;
    }
    this._size = size;
    this.savePropertyChangeEvent("size", this.size);
  }

  get position(): Point {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const node = this;
    return {
      get x(): number {
        return node._position.x;
      },
      set x(x: number) {
        if (Equal.value(node._position.x, x)) {
          return;
        }
        node._position.x = x;
        node.savePropertyChangeEvent("position", node.position);
      },
      get y(): number {
        return node._position.y;
      },
      set y(y: number) {
        if (Equal.value(node._position.y, y)) {
          return;
        }
        node._position.y = y;
        node.savePropertyChangeEvent("position", node.position);
      },
    };
  }
  set position(position: Point) {
    if (Equal.value(this._position, position)) {
      return;
    }
    this._position = position;
    this.savePropertyChangeEvent("position", this.position);
  }

  get zRotation(): number {
    return this._zRotation;
  }
  set zRotation(zRotation: number) {
    if (Equal.value(this._zRotation, zRotation)) {
      return;
    }
    this._zRotation = zRotation;
    this.savePropertyChangeEvent("zRotation", zRotation);
  }

  get scale(): number {
    return this._scale;
  }
  set scale(scale: number) {
    if (Equal.value(this._scale, scale)) {
      return;
    }
    this._scale = scale;
    this.savePropertyChangeEvent("scale", scale);
  }

  get alpha(): number {
    return this._alpha;
  }
  set alpha(alpha: number) {
    if (Equal.value(this._alpha, alpha)) {
      return;
    }
    this._alpha = alpha;
    this.savePropertyChangeEvent("alpha", alpha);
  }

  get isUserInteractionEnabled(): boolean {
    return this._isUserInteractionEnabled;
  }
  set isUserInteractionEnabled(isUserInteractionEnabled: boolean) {
    if (Equal.value(this._isUserInteractionEnabled, isUserInteractionEnabled)) {
      return;
    }
    this._isUserInteractionEnabled = isUserInteractionEnabled;
    this.savePropertyChangeEvent(
      "isUserInteractionEnabled",
      isUserInteractionEnabled,
    );
  }

  get hidden(): boolean {
    return this._hidden;
  }
  set hidden(hidden: boolean) {
    if (Equal.value(this._hidden, hidden)) {
      return;
    }
    this._hidden = hidden;
    this.savePropertyChangeEvent("hidden", hidden);
  }

  get draggable(): boolean {
    return this._draggable;
  }
  set draggable(draggable: boolean) {
    if (Equal.value(this._draggable, draggable)) {
      return;
    }
    this._draggable = draggable;
    this.savePropertyChangeEvent("draggable", draggable);
  }

  get suppressEvents(): boolean {
    return this._suppressEvents;
  }
  set suppressEvents(value: boolean) {
    this._suppressEvents = value;
  }

  // from https://medium.com/@konduruharish/topological-sort-in-typescript-and-c-6d5ecc4bad95
  /**
   * For a given directed acyclic graph, topological ordering of the vertices will be identified using BFS
   * @param adjList Adjacency List that represent a graph with vertices and edges
   */
  private findTopologicalSort(adjList: Map<string, string[]>): string[] {
    const tSort: string[] = [];
    const inDegree: Map<string, number> = new Map();

    // find in-degree for each vertex
    adjList.forEach((edges, vertex) => {
      // If vertex is not in the map, add it to the inDegree map
      if (!inDegree.has(vertex)) {
        inDegree.set(vertex, 0);
      }

      edges.forEach((edge) => {
        // Increase the inDegree for each edge
        if (inDegree.has(edge)) {
          const inDegreeCount = inDegree.get(edge);
          if (inDegreeCount === undefined) {
            throw new Error(`Could not find inDegree for edge ${edge}`);
          }
          inDegree.set(edge, inDegreeCount + 1);
        } else {
          inDegree.set(edge, 1);
        }
      });
    });

    // Queue for holding vertices that has 0 inDegree Value
    const queue: string[] = [];
    inDegree.forEach((degree, vertex) => {
      // Add vertices with inDegree 0 to the queue
      if (degree == 0) {
        queue.push(vertex);
      }
    });

    // Traverse through the leaf vertices
    while (queue.length > 0) {
      const current = queue.shift();
      if (current === undefined) {
        throw "current vertex is undefined";
      }
      tSort.push(current);
      // Mark the current vertex as visited and decrease the inDegree for the edges of the vertex
      // Imagine we are deleting this current vertex from our graph
      if (adjList.has(current)) {
        adjList.get(current)?.forEach((edge) => {
          const inDegreeCount = inDegree.get(edge);
          if (inDegreeCount === undefined) {
            throw new Error(`Could not find inDegree for edge ${edge}`);
          }
          if (inDegree.has(edge) && inDegreeCount > 0) {
            // Decrease the inDegree for the adjacent vertex
            const newDegree = inDegreeCount - 1;
            inDegree.set(edge, newDegree);

            // if inDegree becomes zero, we found new leaf node.
            // Add to the queue to traverse through its edges
            if (newDegree == 0) {
              queue.push(edge);
            }
          }
        });
      }
    }
    return tSort;
  }
}
