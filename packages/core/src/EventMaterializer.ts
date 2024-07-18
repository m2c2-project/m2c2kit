import { Action } from "./Action";
import { Game } from "./Game";
import { Constants } from "./Constants";
import { Easings } from "./Easings";
import {
  BrowserImageDataReadyEvent,
  DomPointerDownEvent,
  I18nDataReadyEvent,
  M2Event,
  M2EventType,
  M2NodeNewEvent,
  M2NodeAddChildEvent,
  M2NodeRemoveChildEvent,
  M2NodePropertyChangeEvent,
  ScenePresentEvent,
  CompositeEvent,
} from "./M2Event";
import { M2EventTarget } from "./M2EventTarget";
import { Scene } from "./Scene";
import { Transition, TransitionDirection, TransitionType } from "./Transition";
import { M2NodeFactory } from "./M2NodeFactory";
import { LocalizationOptions } from "./LocalizationOptions";
import { Shape } from "./Shape";
import { WebColors } from "./WebColors";
import { M2NodeType } from "./M2NodeType";
import { Composite } from "./Composite";

interface EventMaterializerOptions {
  game: Game;
  nodeFactory: M2NodeFactory;
  freeNodesScene: Scene;
  configureI18n(localizationOptions: LocalizationOptions): Promise<void>;
}

type EventMaterializerFunction = (event: M2Event<M2EventTarget>) => void;

export class EventMaterializer {
  private game: Game;
  private nodeFactory: M2NodeFactory;
  private freeNodesScene: Scene;
  private eventMaterializers: Map<M2EventType, EventMaterializerFunction>;
  private configureI18n: (
    localizationOptions: LocalizationOptions,
  ) => Promise<void>;

  /**
   * The `EventMaterializer` class is responsible for taking serialized events
   * from an event store and replaying them in the game.
   */
  constructor(options: EventMaterializerOptions) {
    this.game = options.game;
    this.nodeFactory = options.nodeFactory;
    this.freeNodesScene = options.freeNodesScene;
    this.configureI18n = options.configureI18n;

    /**
     * Use Map of event type to event materializer function instead of a long
     * switch statement in materialize() method.
     */
    this.eventMaterializers = new Map([
      [
        M2EventType.NodeNew,
        this.materializeNodeNewEvent.bind(this) as EventMaterializerFunction,
      ],
      [
        M2EventType.Composite,
        this.materializeCompositeEvent.bind(this) as EventMaterializerFunction,
      ],
      [
        M2EventType.ScenePresent,
        this.materializeScenePresentEvent.bind(
          this,
        ) as EventMaterializerFunction,
      ],
      [
        M2EventType.NodePropertyChange,
        this.materializeNodePropertyChangeEvent.bind(
          this,
        ) as EventMaterializerFunction,
      ],
      [
        M2EventType.NodeAddChild,
        this.materializeNodeAddChildEvent.bind(
          this,
        ) as EventMaterializerFunction,
      ],
      [
        M2EventType.NodeRemoveChild,
        this.materializeNodeRemoveChildEvent.bind(
          this,
        ) as EventMaterializerFunction,
      ],
      [
        M2EventType.DomPointerDown,
        this.materializeDomPointerDownEvent.bind(
          this,
        ) as EventMaterializerFunction,
      ],
      [
        M2EventType.BrowserImageDataReady,
        this.materializeBrowserImageDataReadyEvent.bind(
          this,
        ) as EventMaterializerFunction,
      ],
      [
        M2EventType.I18nDataReadyEvent,
        this.materializeI18nDataReadyEvent.bind(
          this,
        ) as EventMaterializerFunction,
      ],
    ]);
  }

  /**
   * Deserialize the events by materializing them into the game.
   *
   * @remarks This method is called when the game is replaying events from the
   * event store. Materializing an event means to take the event and apply its
   * changes to the game. For example, a `NodeNew` event will create a new node
   * in the game. A `NodePropertyChange` event will change a property of a node
   * in the game.
   *
   * @param events - The events to materialize
   */
  public materialize(events: ReadonlyArray<M2Event<M2EventTarget>>) {
    if (events.length > 0) {
      console.log(`Replaying ${events.length} events`);

      events.forEach((event) => {
        const handler = this.eventMaterializers.get(event.type as M2EventType);
        if (handler) {
          handler(event);
        } else {
          console.log(`EventMaterializer unhandled event: ${event.type}`);
        }
      });
    }
  }

  private materializeCompositeEvent(event: CompositeEvent) {
    /**
     * In event replay, event.target is the uuid of the target composite node,
     * not the composite node, because the composite node is not serializable.
     */
    const node = this.game.materializedNodes.find(
      (n) => n.uuid === (event.target as unknown as string),
    );
    if (!node) {
      console.log(
        `EventMaterializer: composite node of type ${event.compositeType} with uuid ${event.target} not found when handling CompositeEvent ${event.compositeEventType}`,
      );
    } else {
      if (node.type === M2NodeType.Composite) {
        (node as Composite).handleCompositeEvent(event as CompositeEvent);
      } else {
        throw new Error(
          `EventMaterializer: node was expected to be composite, but was of type ${node.type}`,
        );
      }
    }
  }

  private materializeNodeNewEvent(nodeNewEvent: M2NodeNewEvent) {
    const node = this.nodeFactory.createNode(
      nodeNewEvent.nodeType,
      nodeNewEvent.compositeType,
      nodeNewEvent.nodeOptions,
    );
    if (node.type === M2NodeType.Scene) {
      if (node.name === Constants.FREE_NODES_SCENE_NAME) {
        this.freeNodesScene = node as Scene;
        this.freeNodesScene.game = this.game;
        this.freeNodesScene.needsInitialization = true;

        this.game.freeNodesScene = this.freeNodesScene;
      } else {
        this.game.addScene(node as Scene);
      }
    }
    this.game.materializedNodes.push(node);
  }

  private materializeNodePropertyChangeEvent(
    nodePropertyChangeEvent: M2NodePropertyChangeEvent,
  ) {
    const node = this.game.materializedNodes.find(
      (n) => n.uuid === nodePropertyChangeEvent.uuid,
    );
    if (!node) {
      throw new Error(
        `EventMaterializer: node with uuid ${nodePropertyChangeEvent.uuid} not found`,
      );
    }
    if (nodePropertyChangeEvent.property in node) {
      /**
       * There are too many different node types and properties to
       * use TypeScript types here. So, we use any.
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (node as any)[nodePropertyChangeEvent.property] =
        nodePropertyChangeEvent.value;
    } else {
      throw new Error(
        `EventMaterializer: on node ${node.name}, type ${node.type}, nodePropertyChangeEvent tried to set unknown property ${nodePropertyChangeEvent.property} to value ${JSON.stringify(nodePropertyChangeEvent.value)}`,
      );
    }
  }

  private materializeNodeAddChildEvent(nodeAddChildEvent: M2NodeAddChildEvent) {
    const parent = this.game.materializedNodes.find(
      (n) => n.uuid === nodeAddChildEvent.uuid,
    );
    if (!parent) {
      throw new Error(
        `EventMaterializer: parent node with uuid ${nodeAddChildEvent.uuid} not found`,
      );
    }
    const child = this.game.materializedNodes.find(
      (n) => n.uuid === nodeAddChildEvent.childUuid,
    );
    if (!child) {
      throw new Error(
        `EventMaterializer: child node with uuid ${nodeAddChildEvent.childUuid} not found`,
      );
    }
    parent.addChild(child);
  }

  private materializeNodeRemoveChildEvent(
    nodeRemoveChildEvent: M2NodeRemoveChildEvent,
  ) {
    const parent = this.game.materializedNodes.find(
      (n) => n.uuid === nodeRemoveChildEvent.uuid,
    );
    if (!parent) {
      throw new Error(
        `EventMaterializer: parent node with uuid ${nodeRemoveChildEvent.uuid} not found`,
      );
    }
    const child = this.game.materializedNodes.find(
      (n) => n.uuid === nodeRemoveChildEvent.childUuid,
    );
    if (!child) {
      throw new Error(
        `EventMaterializer: child node with uuid ${nodeRemoveChildEvent.childUuid} not found`,
      );
    }
    parent.removeChild(child);
  }

  private materializeDomPointerDownEvent(
    domPointerDownEvent: DomPointerDownEvent,
  ) {
    this.game.currentScene?.run(
      Action.custom({
        callback: () => {
          /**
           * We must create a new Shape for each pointer down event because
           * the user may have multiple pointer down events within the same
           * duration in which the pointer down shape and animation is
           * visible.
           */
          const pointerDownShape = new Shape({
            circleOfRadius: 16,
            fillColor: WebColors.LightGray,
            strokeColor: WebColors.Black,
            lineWidth: 2,
            alpha: 0.75,
            position: { x: domPointerDownEvent.x, y: domPointerDownEvent.y },
          });
          this.game.currentScene?.addChild(pointerDownShape);

          //Simple animation to fade and scale down the pointer down shape.
          pointerDownShape.run(
            Action.sequence([
              Action.group([
                Action.fadeAlpha({
                  duration: 750,
                  alpha: 0,
                }),
                Action.scale({
                  duration: 750,
                  scale: 0,
                }),
              ]),
              Action.custom({
                callback: () => {
                  this.game.currentScene?.removeChild(pointerDownShape);
                },
              }),
            ]),
          );
        },
      }),
    );
  }

  private materializeBrowserImageDataReadyEvent(
    browserImageDataReadyEvent: BrowserImageDataReadyEvent,
  ) {
    this.game.imageManager.loadImages([
      {
        imageName: browserImageDataReadyEvent.imageName,
        width: browserImageDataReadyEvent.width,
        height: browserImageDataReadyEvent.height,
        dataUrl: browserImageDataReadyEvent.dataUrl,
        svgString: browserImageDataReadyEvent.svgString,
      },
    ]);
  }

  private materializeI18nDataReadyEvent(
    i18nDataReadyEvent: I18nDataReadyEvent,
  ) {
    // do not await this?
    this.configureI18n(i18nDataReadyEvent.localizationOptions);
  }

  private materializeScenePresentEvent(scenePresentEvent: ScenePresentEvent) {
    let transition: Transition = Transition.none();
    if (scenePresentEvent.transitionType === TransitionType.Slide) {
      if (scenePresentEvent.direction === undefined) {
        throw new Error(
          "EventMaterializer: ScenePresentEvent direction is undefined for slide transition",
        );
      }
      if (scenePresentEvent.duration === undefined) {
        throw new Error(
          "EventMaterializer: ScenePresentEvent duration is undefined for slide transition",
        );
      }
      if (scenePresentEvent.easingType === undefined) {
        throw new Error(
          "EventMaterializer: ScenePresentEvent easingType is undefined for slide transition",
        );
      }

      const incomingScene = this.game.materializedNodes.find(
        (s) => s.uuid === scenePresentEvent.uuid,
      );
      if (!incomingScene) {
        throw new Error(
          `EventMaterializer: Scene with uuid ${scenePresentEvent.uuid} not found`,
        );
      }

      /**
       * When replaying, we need to set the position of the incoming scene
       * to the opposite side of the direction of the transition BEFORE
       * we call the presentScene method. Otherwise, the incoming scene
       * will flash on the screen before the transition starts with it
       * off screen.
       */
      switch (scenePresentEvent.direction) {
        case TransitionDirection.Left: {
          incomingScene.position.x = incomingScene.size.width;
          break;
        }
        case TransitionDirection.Right: {
          incomingScene.position.x = -incomingScene.size.width;
          break;
        }
        case TransitionDirection.Up: {
          incomingScene.position.y = incomingScene.size.height;
          break;
        }
        case TransitionDirection.Down: {
          incomingScene.position.y = -incomingScene.size.height;
          break;
        }
      }

      transition = Transition.slide({
        direction: scenePresentEvent.direction,
        duration: scenePresentEvent.duration,
        easing: Easings.fromTypeAsString(scenePresentEvent.easingType),
      });
    }

    this.game.presentScene(scenePresentEvent.uuid, transition);
  }
}
