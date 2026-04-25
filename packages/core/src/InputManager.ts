import { Game } from "./Game";
import { M2c2KitHelpers } from "./M2c2KitHelpers";
import { M2DragEvent } from "./M2DragEvent";
import { M2Error } from "./M2Error";
import { M2KeyboardEvent } from "./M2KeyboardEvent";
import { M2Node } from "./M2Node";
import { M2NodeEvent } from "./M2NodeEvent";
import { M2PointerEvent } from "./M2PointerEvent";
import { Point } from "./Point";
import { Scene } from "./Scene";
import { TapEvent } from "./TapEvent";
import { IDrawable } from "./IDrawable";
import { Shape } from "./Shape";
import { ShapeType } from "./ShapeType";
import { DomPointerDownEvent, M2EventType } from "./M2Event";
import { M2NodeType } from "./M2NodeType";

export class InputManager {
  private game: Game;
  private htmlCanvas: HTMLCanvasElement;

  constructor(game: Game, htmlCanvas: HTMLCanvasElement) {
    this.game = game;
    this.htmlCanvas = htmlCanvas;
    this.addEventListeners();
  }

  public dispose(): void {
    this.removeEventListeners();
  }

  private addEventListeners(): void {
    if (this.htmlCanvas === undefined) {
      throw new M2Error("main html canvas is undefined");
    }
    // When the callback is executed, within the execution of the callback code
    // we want 'this' to be this InputManager object, not the html canvas to which the event listener is attached.
    // By using arrow functions for the handlers, they are automatically bound to this object.
    this.htmlCanvas.addEventListener(
      "pointerdown",
      this.htmlCanvasPointerDownHandler,
    );
    this.htmlCanvas.addEventListener(
      "pointerup",
      this.htmlCanvasPointerUpHandler,
    );
    this.htmlCanvas.addEventListener(
      "pointermove",
      this.htmlCanvasPointerMoveHandler,
    );
    /**
     * on some (all?) mobile devices, even if the page is has no scrollable
     * content, a touch drag down will partially scroll the screen. This will
     * interfere will some of our events, such as trail making. Thus, we
     * prevent this.
     */
    this.htmlCanvas.addEventListener("touchstart", this.touchStartHandler);
    this.htmlCanvas.addEventListener(
      "pointerleave",
      this.htmlCanvasPointerLeaveHandler,
    );
    /**
     * Listen for key events on the document, not just the canvas, because
     * canvas may not have focus.
     */
    document.addEventListener("keydown", this.documentKeyDownHandler);
    document.addEventListener("keyup", this.documentKeyUpHandler);
  }

  private removeEventListeners(): void {
    this.htmlCanvas.removeEventListener(
      "pointerdown",
      this.htmlCanvasPointerDownHandler,
    );
    this.htmlCanvas.removeEventListener(
      "pointerup",
      this.htmlCanvasPointerUpHandler,
    );
    this.htmlCanvas.removeEventListener(
      "pointermove",
      this.htmlCanvasPointerMoveHandler,
    );
    this.htmlCanvas.removeEventListener(
      "pointerleave",
      this.htmlCanvasPointerLeaveHandler,
    );
    this.htmlCanvas.removeEventListener("touchstart", this.touchStartHandler);
    document.removeEventListener("keydown", this.documentKeyDownHandler);
    document.removeEventListener("keyup", this.documentKeyUpHandler);
  }

  private touchStartHandler = (e: TouchEvent): void => {
    e.preventDefault();
  };

  /**
   * Receives callback from DOM PointerDown event
   *
   * @param domPointerEvent - PointerEvent from the DOM
   * @returns
   */
  private htmlCanvasPointerDownHandler = (
    domPointerEvent: PointerEvent,
  ): void => {
    domPointerEvent.preventDefault();
    const scene = this.game.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }

    if (!this.htmlCanvas) {
      throw new M2Error("main html canvas is undefined");
    }
    const domPointerDownEvent: DomPointerDownEvent = {
      type: "DomPointerDown",
      target: this.htmlCanvas,
      x: domPointerEvent.offsetX / m2c2Globals.rootScale,
      y: domPointerEvent.offsetY / m2c2Globals.rootScale,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.game.eventStore.addEvent(domPointerDownEvent);

    const nodeEvent: M2NodeEvent = {
      target: scene,
      type: M2EventType.PointerDown,
      handled: false,
      ...M2c2KitHelpers.createTimestamps(),
    };
    /**
     * Free nodes are typically used as overlays and thus should have the first
     * opportunity to process the DOM pointer event and potentially set
     * nodeEvent.handled to true so it does not propagate to the current scene.
     */
    this.processDomPointerDown(
      this.game.sceneManager.freeNodesScene,
      nodeEvent,
      domPointerEvent,
    );
    this.processDomPointerDown(scene, nodeEvent, domPointerEvent);
  };

  private htmlCanvasPointerUpHandler = (
    domPointerEvent: PointerEvent,
  ): void => {
    domPointerEvent.preventDefault();
    const scene = this.game.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }
    const nodeEvent: M2NodeEvent = {
      target: scene,
      type: M2EventType.PointerUp,
      handled: false,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.processDomPointerUp(
      this.game.sceneManager.freeNodesScene,
      nodeEvent,
      domPointerEvent,
    );
    this.processDomPointerUp(scene, nodeEvent, domPointerEvent);
  };

  private htmlCanvasPointerMoveHandler = (
    domPointerEvent: PointerEvent,
  ): void => {
    domPointerEvent.preventDefault();
    const scene = this.game.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }
    const nodeEvent: M2NodeEvent = {
      target: scene,
      type: M2EventType.PointerMove,
      handled: false,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.processDomPointerMove(
      this.game.sceneManager.freeNodesScene,
      nodeEvent,
      domPointerEvent,
    );
    this.processDomPointerMove(scene, nodeEvent, domPointerEvent);
  };

  private htmlCanvasPointerLeaveHandler = (
    domPointerEvent: PointerEvent,
  ): void => {
    if (!this.game.currentScene) {
      return;
    }

    domPointerEvent.preventDefault();
    const scene = this.game.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }
    const nodeEvent: M2NodeEvent = {
      target: scene,
      type: M2EventType.PointerLeave,
      handled: false,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.processDomPointerLeave(
      this.game.sceneManager.freeNodesScene,
      nodeEvent,
      domPointerEvent,
    );
    this.processDomPointerLeave(scene, nodeEvent, domPointerEvent);
  };

  private documentKeyDownHandler = (domKeyboardEvent: KeyboardEvent): void => {
    const scene = this.game.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }
    /**
     * Built-in keyboard events are not tied to a specific m2c2 node.
     * Because a target is required in M2NodeEvent, use the current scene,
     * as it is the parent of all nodes in a scene.
     */
    const nodeEvent: M2NodeEvent = {
      target: scene,
      type: M2EventType.KeyDown,
      handled: false,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.raiseEventOnListeningNodes<M2KeyboardEvent>(
      this.game.sceneManager.freeNodesScene,
      nodeEvent,
      domKeyboardEvent,
    );
    this.raiseEventOnListeningNodes<M2KeyboardEvent>(
      scene,
      nodeEvent,
      domKeyboardEvent,
    );
  };

  private documentKeyUpHandler = (domKeyboardEvent: KeyboardEvent): void => {
    const scene = this.game.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }
    const nodeEvent: M2NodeEvent = {
      target: scene,
      type: M2EventType.KeyUp,
      handled: false,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.raiseEventOnListeningNodes<M2KeyboardEvent>(
      this.game.sceneManager.freeNodesScene,
      nodeEvent,
      domKeyboardEvent,
    );
    this.raiseEventOnListeningNodes<M2KeyboardEvent>(
      scene,
      nodeEvent,
      domKeyboardEvent,
    );
  };

  /**
   * Determines if/how m2c2kit nodes respond to the DOM PointerDown event
   *
   * @param node - node that might be affected by the DOM PointerDown event
   * @param nodeEvent
   * @param domPointerEvent
   */
  private processDomPointerDown(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    if (nodeEvent.handled) {
      return;
    }

    // note: offsetX and offsetY are relative to the HTML canvas element
    if (
      node.isUserInteractionEnabled &&
      this.IsCanvasPointWithinNodeBounds(
        node,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY,
      )
    ) {
      node.pressed = true;
      node.pressedAndWithinHitArea = true;
      node.pressedInitialPointerOffset = {
        x: domPointerEvent.offsetX,
        y: domPointerEvent.offsetY,
      };
      this.raiseM2PointerDownEvent(node, nodeEvent, domPointerEvent);
      this.raiseTapDownEvent(node, nodeEvent, domPointerEvent);
    }
    if (node.children) {
      node.children
        // a hidden node (and its children) can't receive taps,
        // even if isUserInteractionEnabled is true
        .filter((node) => !node.hidden)
        // only drawables have z-position
        .filter((node) => node.isDrawable)
        // process taps on children by zPosition order
        .sort((a, b) => {
          const zDiff =
            (b as unknown as IDrawable).zPosition -
            (a as unknown as IDrawable).zPosition;
          if (zDiff !== 0) {
            return zDiff;
          }
          /**
           * If zPosition is the same, process the one later in the array
           * first, because it is drawn on top of the other one and thus
           * should receive the event first.
           */
          return node.children.indexOf(b) - node.children.indexOf(a);
        })
        .forEach((node) =>
          this.processDomPointerDown(node, nodeEvent, domPointerEvent),
        );
    }
  }

  private processDomPointerUp(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    if (nodeEvent.handled) {
      return;
    }

    if (node.dragging) {
      node.dragging = false;
      node.pressed = false;
      node.pressedAndWithinHitArea = false;
      this.raiseM2DragEndEvent(node, nodeEvent, domPointerEvent);
      return;
    }

    if (
      node.isUserInteractionEnabled &&
      node.pressed &&
      node.pressedAndWithinHitArea
    ) {
      /**
       * released pointer within hit area after pointer had been earlier
       * been pressed in the hit area and never left the hit area
       */
      node.pressed = false;
      node.pressedAndWithinHitArea = false;
      this.raiseTapUpEvent(node, nodeEvent, domPointerEvent);
      this.raiseTapUpAny(node, nodeEvent, domPointerEvent);
      this.raiseM2PointerUpEvent(node, nodeEvent, domPointerEvent);
    } else if (
      node.isUserInteractionEnabled &&
      node.pressed &&
      node.pressedAndWithinHitArea == false
    ) {
      /**
       * released pointer anywhere after pointer had been earlier
       * been pressed in the hit area
       */
      node.pressed = false;
      node.pressedAndWithinHitArea = false;
      this.raiseTapUpAny(node, nodeEvent, domPointerEvent);
    } else if (
      node.isUserInteractionEnabled &&
      this.IsCanvasPointWithinNodeBounds(
        node,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY,
      )
    ) {
      /**
       * released pointer in the hit area
       */
      node.pressed = false;
      node.pressedAndWithinHitArea = false;
      this.raiseM2PointerUpEvent(node, nodeEvent, domPointerEvent);
    }

    if (node.children) {
      node.children
        // a hidden node (and its children) can't receive taps,
        // even if isUserInteractionEnabled is true
        .filter((node) => !node.hidden)
        // only drawables have z-position
        .filter((node) => node.isDrawable)
        // process taps on children by zPosition order
        .sort((a, b) => {
          const zDiff =
            (b as unknown as IDrawable).zPosition -
            (a as unknown as IDrawable).zPosition;
          if (zDiff !== 0) {
            return zDiff;
          }
          /**
           * If zPosition is the same, process the one later in the array
           * first, because it is drawn on top of the other one and thus
           * should receive the event first.
           */
          return node.children.indexOf(b) - node.children.indexOf(a);
        })
        .forEach((node) =>
          this.processDomPointerUp(node, nodeEvent, domPointerEvent),
        );
    }
  }

  private processDomPointerMove(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    if (nodeEvent.handled) {
      return;
    }

    if (node.isUserInteractionEnabled && node.draggable && node.pressed) {
      let firstMoveOfDrag = false;
      let deltaX: number;
      let deltaY: number;
      if (node.dragging === false) {
        node.dragging = true;
        firstMoveOfDrag = true;
        deltaX = domPointerEvent.offsetX - node.pressedInitialPointerOffset.x;
        deltaY = domPointerEvent.offsetY - node.pressedInitialPointerOffset.y;
      } else {
        deltaX = domPointerEvent.offsetX - node.draggingLastPointerOffset.x;
        deltaY = domPointerEvent.offsetY - node.draggingLastPointerOffset.y;
      }
      node.position.x += deltaX;
      node.position.y += deltaY;
      node.draggingLastPointerOffset = {
        x: domPointerEvent.offsetX,
        y: domPointerEvent.offsetY,
      };
      if (firstMoveOfDrag) {
        this.raiseM2DragStartEvent(node, nodeEvent, domPointerEvent);
      } else {
        this.raiseM2DragEvent(node, nodeEvent, domPointerEvent);
      }
      return;
    }

    if (
      node.isUserInteractionEnabled &&
      node.pressed &&
      node.pressedAndWithinHitArea &&
      !this.IsCanvasPointWithinNodeBounds(
        node,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY,
      )
    ) {
      node.pressedAndWithinHitArea = false;
      this.raiseTapLeaveEvent(node, nodeEvent, domPointerEvent);
    }
    if (
      node.isUserInteractionEnabled &&
      this.IsCanvasPointWithinNodeBounds(
        node,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY,
      )
    ) {
      this.raiseM2PointerMoveEvent(node, nodeEvent, domPointerEvent);
      node.withinHitArea = true;
    }
    if (
      node.isUserInteractionEnabled &&
      node.withinHitArea &&
      !this.IsCanvasPointWithinNodeBounds(
        node,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY,
      )
    ) {
      node.withinHitArea = false;
      this.raiseM2PointerLeaveEvent(node, nodeEvent, domPointerEvent);
    }

    if (node.children) {
      node.children
        // a hidden node (and its children) can't receive taps,
        // even if isUserInteractionEnabled is true
        .filter((node) => !node.hidden)
        // only drawables have z-position
        .filter((node) => node.isDrawable)
        // process taps on children by zPosition order
        .sort((a, b) => {
          const zDiff =
            (b as unknown as IDrawable).zPosition -
            (a as unknown as IDrawable).zPosition;
          if (zDiff !== 0) {
            return zDiff;
          }
          /**
           * If zPosition is the same, process the one later in the array
           * first, because it is drawn on top of the other one and thus
           * should receive the event first.
           */
          return node.children.indexOf(b) - node.children.indexOf(a);
        })
        .forEach((node) =>
          this.processDomPointerMove(node, nodeEvent, domPointerEvent),
        );
    }
  }

  private processDomPointerLeave(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    if (nodeEvent.handled) {
      return;
    }

    /**
     * Adjust dragging behavior when the pointer leaves the canvas.
     * This is necessary because the pointerup event is not fired when the
     * pointer leaves the canvas. On desktop, this means that the user might
     * lift the pointer outside the canvas, but the node will still be
     * dragged when the pointer is moved back into the canvas.
     */
    if (node.dragging) {
      const m2Event: M2NodeEvent = {
        target: node,
        type: M2EventType.DragEnd,
        handled: false,
        ...M2c2KitHelpers.createTimestamps(),
      };

      node.dragging = false;
      node.pressed = false;
      node.pressedAndWithinHitArea = false;
      this.raiseM2DragEndEvent(node, m2Event, domPointerEvent);
      return;
    }

    // note: offsetX and offsetY are relative to the HTML canvas element
    if (
      node.isUserInteractionEnabled &&
      node.pressed &&
      node.pressedAndWithinHitArea &&
      !this.IsCanvasPointWithinNodeBounds(
        node,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY,
      )
    ) {
      node.pressedAndWithinHitArea = false;
      this.raiseTapLeaveEvent(node, nodeEvent, domPointerEvent);
    }

    if (
      node.isUserInteractionEnabled &&
      node.withinHitArea &&
      !this.IsCanvasPointWithinNodeBounds(
        node,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY,
      )
    ) {
      node.withinHitArea = false;
      this.raiseM2PointerLeaveEvent(node, nodeEvent, domPointerEvent);
    }

    if (node.children) {
      node.children
        // a hidden node (and its children) can't receive taps,
        // even if isUserInteractionEnabled is true
        .filter((node) => !node.hidden)
        // only drawables have z-position
        .filter((node) => node.isDrawable)
        // process taps on children by zPosition order
        .sort((a, b) => {
          const zDiff =
            (b as unknown as IDrawable).zPosition -
            (a as unknown as IDrawable).zPosition;
          if (zDiff !== 0) {
            return zDiff;
          }
          /**
           * If zPosition is the same, process the one later in the array
           * first, because it is drawn on top of the other one and thus
           * should receive the event first.
           */
          return node.children.indexOf(b) - node.children.indexOf(a);
        })
        .forEach((node) =>
          this.processDomPointerLeave(node, nodeEvent, domPointerEvent),
        );
    }
  }

  private raiseEventOnListeningNodes<T extends M2NodeEvent>(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domEvent: Event,
  ): void {
    [...node.eventListeners]
      .filter((listener) => listener.type === nodeEvent.type)
      .forEach((listener) => {
        if (listener.nodeUuid === node.uuid) {
          (nodeEvent as T).target = node;

          switch (nodeEvent.type) {
            case M2EventType.PointerDown:
            case M2EventType.PointerMove:
            case M2EventType.PointerUp:
            case M2EventType.PointerLeave:
              (nodeEvent as M2PointerEvent).point =
                this.calculatePointWithinNodeFromDomPointerEvent(
                  node,
                  domEvent as PointerEvent,
                );
              (nodeEvent as M2PointerEvent).buttons = (
                domEvent as PointerEvent
              ).buttons;
              listener.callback(nodeEvent as T);
              break;
            case M2EventType.KeyDown:
            case M2EventType.KeyUp:
              (nodeEvent as M2KeyboardEvent).key = (
                domEvent as KeyboardEvent
              ).key;
              (nodeEvent as M2KeyboardEvent).code = (
                domEvent as KeyboardEvent
              ).code;
              (nodeEvent as M2KeyboardEvent).shiftKey = (
                domEvent as KeyboardEvent
              ).shiftKey;
              (nodeEvent as M2KeyboardEvent).ctrlKey = (
                domEvent as KeyboardEvent
              ).ctrlKey;
              (nodeEvent as M2KeyboardEvent).metaKey = (
                domEvent as KeyboardEvent
              ).metaKey;
              (nodeEvent as M2KeyboardEvent).altKey = (
                domEvent as KeyboardEvent
              ).altKey;
              (nodeEvent as M2KeyboardEvent).repeat = (
                domEvent as KeyboardEvent
              ).repeat;
              listener.callback(nodeEvent as T);
              break;
            case M2EventType.TapDown:
            case M2EventType.TapUp:
            case M2EventType.TapUpAny:
            case M2EventType.TapLeave:
              (nodeEvent as TapEvent).point =
                this.calculatePointWithinNodeFromDomPointerEvent(
                  node,
                  domEvent as PointerEvent,
                );

              (nodeEvent as TapEvent).buttons = (
                domEvent as PointerEvent
              ).buttons;

              listener.callback(nodeEvent as T);
              break;
            case M2EventType.DragStart:
            case M2EventType.Drag:
            case M2EventType.DragEnd:
              (nodeEvent as M2DragEvent).position = {
                x: node.position.x,
                y: node.position.y,
              };
              (nodeEvent as M2DragEvent).buttons = (
                domEvent as PointerEvent
              ).buttons;
              listener.callback(nodeEvent as T);
              break;
          }
          if (!node.isPartOfComposite) {
            this.game.eventStore.addEvent(nodeEvent);
          }
        }
      });
  }

  private raiseM2PointerDownEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.PointerDown;
    this.raiseEventOnListeningNodes<M2PointerEvent>(
      node,
      nodeEvent,
      domPointerEvent,
    );
  }

  private raiseTapDownEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.TapDown;
    this.raiseEventOnListeningNodes<TapEvent>(node, nodeEvent, domPointerEvent);
  }

  private raiseTapLeaveEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.TapLeave;
    this.raiseEventOnListeningNodes<TapEvent>(node, nodeEvent, domPointerEvent);
  }

  private raiseM2PointerUpEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.PointerUp;
    this.raiseEventOnListeningNodes<M2PointerEvent>(
      node,
      nodeEvent,
      domPointerEvent,
    );
  }

  private raiseTapUpEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.TapUp;
    this.raiseEventOnListeningNodes<TapEvent>(node, nodeEvent, domPointerEvent);
  }

  private raiseTapUpAny(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.TapUpAny;
    this.raiseEventOnListeningNodes<TapEvent>(node, nodeEvent, domPointerEvent);
  }

  private raiseM2PointerMoveEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.PointerMove;
    this.raiseEventOnListeningNodes<M2PointerEvent>(
      node,
      nodeEvent,
      domPointerEvent,
    );
  }

  private raiseM2PointerLeaveEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.PointerLeave;
    this.raiseEventOnListeningNodes<M2PointerEvent>(
      node,
      nodeEvent,
      domPointerEvent,
    );
  }

  private raiseM2DragStartEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.DragStart;
    this.raiseEventOnListeningNodes<M2DragEvent>(
      node,
      nodeEvent,
      domPointerEvent,
    );
  }

  private raiseM2DragEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.Drag;
    this.raiseEventOnListeningNodes<M2DragEvent>(
      node,
      nodeEvent,
      domPointerEvent,
    );
  }

  private raiseM2DragEndEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.DragEnd;
    this.raiseEventOnListeningNodes<M2DragEvent>(
      node,
      nodeEvent,
      domPointerEvent,
    );
  }

  private sceneCanReceiveUserInteraction(scene: Scene): boolean {
    if (scene._active && scene._transitioning === false) {
      // allow interaction only on scene that is part of the session's
      // current game
      // AND don't allow interaction when scene is transitioning. If, during scene transition,
      // the user taps a button that starts another scene transition, the scene transition
      // state will be corrupted. We can have only one active scene transition.
      return true;
    }
    return false;
  }

  /**
   *
   * Checks if the given canvas point is within the node's bounds.
   *
   * @param node - node to check bounds for
   * @param x - x coordinate of the canvas point
   * @param y - y coordinate of the canvas point
   * @returns true if x, y point is within the node's bounds
   */
  private IsCanvasPointWithinNodeBounds(
    node: M2Node,
    x: number,
    y: number,
  ): boolean {
    if (!node.isDrawable) {
      throw "only drawable nodes can receive pointer events";
    }
    if (
      node.type === M2NodeType.Shape &&
      (node as Shape).shapeType === ShapeType.Circle
    ) {
      const bb = M2c2KitHelpers.calculateNodeAbsoluteBoundingBox(node);
      const radius = (node as Shape).circleOfRadius;
      if (!radius) {
        throw "circleOfRadius is undefined";
      }
      const center = {
        x: bb.xMin + radius * node.absoluteScale,
        y: bb.yMin + radius * node.absoluteScale,
      };
      const distance = Math.sqrt(
        Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2),
      );
      return distance <= radius * node.absoluteScale;
    }

    if (node.size.width === 0 || node.size.height === 0) {
      // console.warn(
      //   `warning: node ${node.toString()} has isUserInteractionEnabled = true, but has no interactable area. Size is ${
      //     node.size.width
      //   }, ${node.size.height}`
      // );
      return false;
    }

    if (node.type === M2NodeType.TextLine && isNaN(node.size.width)) {
      // console.warn(
      //   `warning: node ${node.toString()} is a TextLine with width = NaN. A TextLine must have its width manually set.`
      // );
      return false;
    }

    const points = M2c2KitHelpers.calculateRotatedPoints(
      node as unknown as IDrawable & M2Node,
    );
    return (
      node.isUserInteractionEnabled &&
      M2c2KitHelpers.isPointInsideRectangle({ x, y }, points)
    );
  }

  private calculatePointWithinNodeFromDomPointerEvent(
    node: M2Node,
    domPointerEvent: PointerEvent,
  ): Point {
    let width = node.size.width;
    let height = node.size.height;

    if (
      node.type === M2NodeType.Shape &&
      (node as Shape).shapeType === ShapeType.Circle
    ) {
      const radius = (node as Shape).circleOfRadius;
      if (!radius) {
        throw "circleOfRadius is undefined";
      }
      width = radius * 2;
      height = radius * 2;
    }

    let x = domPointerEvent.offsetX;
    let y = domPointerEvent.offsetY;
    const bb = M2c2KitHelpers.calculateNodeAbsoluteBoundingBox(node);

    /**
     * If the node or any of its ancestors have been rotated, we need to
     * adjust the point reported on the DOM to account for the rotation. We
     * do this by calculating the rotation transforms that were used to
     * display the rotated node and applying the reverse rotation transforms
     * to the DOM point.
     */
    if (M2c2KitHelpers.nodeOrAncestorHasBeenRotated(node)) {
      const transforms = M2c2KitHelpers.calculateRotationTransforms(
        node as M2Node & IDrawable,
      );
      transforms.forEach((transform) => {
        const rotatedPoint = M2c2KitHelpers.rotatePoint(
          { x, y },
          // take negative because we are applying the reverse rotation
          -transform.radians,
          transform.center,
        );
        x = rotatedPoint.x;
        y = rotatedPoint.y;
      });
    }

    const relativeX = ((x - bb.xMin) / (bb.xMax - bb.xMin)) * width;
    const relativeY = ((y - bb.yMin) / (bb.yMax - bb.yMin)) * height;
    return { x: relativeX, y: relativeY };
  }
}
