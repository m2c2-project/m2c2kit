import "./Globals";
import { Canvas, CanvasKit } from "canvaskit-wasm";
import { EntityEventListener } from "./EntityEventListener";
import { EntityEvent } from "./EntityEvent";
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
import { EntityOptions } from "./EntityOptions";
import { EntityType } from "./EntityType";
import { Scene } from "./Scene";
import { Uuid } from "./Uuid";
import { EventType } from "./EventBase";
import { Game } from "./Game";
import { ActionType } from "./ActionType";
import { M2DragEvent } from "./M2DragEvent";
import { CallbackOptions } from "./CallbackOptions";
import { Composite } from "./Composite";

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
}
export function handleInterfaceOptions(
  entity: Entity,
  options: EntityOptions,
): void {
  if (entity.isDrawable) {
    handleDrawableOptions(
      entity as unknown as IDrawable,
      options as DrawableOptions,
    );
  }
  if (entity.isText) {
    handleTextOptions(entity as unknown as IText, options as TextOptions);
  }
}
export abstract class Entity implements EntityOptions {
  type = EntityType.Entity;
  isDrawable = false;
  isShape = false;
  isText = false;
  // Entity Options
  name: string;
  _position: Point = { x: 0, y: 0 }; // position of the entity in the parent coordinate system
  _scale = 1.0;
  alpha = 1.0;
  _zRotation = 0;
  isUserInteractionEnabled = false;
  draggable = false;
  hidden = false;
  layout: Layout = {};

  _game?: Game;
  parent?: Entity;
  children = new Array<Entity>();
  absolutePosition: Point = { x: 0, y: 0 }; // position within the root coordinate system
  size: Size = { width: 0, height: 0 };
  absoluteScale = 1.0;
  absoluteAlpha = 1.0;
  absoluteAlphaChange = 0;
  actions = new Array<Action>();
  queuedAction?: Action;
  originalActions = new Array<Action>();
  eventListeners = new Array<EntityEventListener>();
  readonly uuid = Uuid.generate();
  needsInitialization = true;
  // library users might put anything in userData property
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData: any = {};
  loopMessages = new Set<string>();

  /** Is the entity in a pressed state? E.g., did the user put the pointer
   * down on the entity and not yet release it? */
  pressed = false;
  withinHitArea = false;
  /** Is the entity in a pressed state AND is the pointer within the entity's
   * hit area? For example, a user may put the pointer down on the entity, but
   * then move the pointer, while still down, beyond the entity's hit area. In
   * this case, pressed = true, but pressedAndWithinHitArea = false. */
  pressedAndWithinHitArea = false;
  /** When the entity initially enters the pressed state, what is the pointer
   * offset? (offset from the canvas's origin to the pointer position). We
   * save this because it will be needed if this press then led to a drag. */
  pressedInitialPointerOffset: Point = { x: NaN, y: NaN };
  /** What was the previous pointer offset when the entity was in a dragging
   * state? */
  draggingLastPointerOffset: Point = { x: NaN, y: NaN };
  /** Is the entity in a dragging state? */
  dragging = false;

  constructor(options: EntityOptions = {}) {
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
    throw new Error("initialize() called in abstract base class Entity.");
  }

  /**
   * The game which this entity is a part of.
   *
   * @remarks Throws error if entity is not part of the game object.
   */
  get game(): Game {
    const findParentScene = (entity: Entity): Scene => {
      if (!entity.parent) {
        throw new Error(`Entity ${this} has not been added to a scene.`);
      } else if (entity.parent.type === EntityType.Scene) {
        return entity.parent as Scene;
      } else {
        return findParentScene(entity.parent);
      }
    };

    return findParentScene(this).game;
  }

  /**
   * Determines if the entity has been added to the game object.
   *
   * @returns true if entity has been added
   */
  private isPartOfGame(): boolean {
    /**
     * getter this.game throws error if undefined; thus, to check if this.game
     * is undefined we must check the backing variable, _game.
     */
    if (this.type === EntityType.Scene && this._game === undefined) {
      return false;
    }
    if (this.type === EntityType.Scene && this._game !== undefined) {
      return true;
    }

    const findParentScene = (entity: Entity): Scene | undefined => {
      if (!entity.parent) {
        return undefined;
      } else if (entity.parent.type === EntityType.Scene) {
        return entity.parent as Scene;
      } else {
        return findParentScene(entity.parent);
      }
    };

    return findParentScene(this)?._game !== undefined;
  }

  /**
   * Overrides toString() and returns a human-friendly description of the entity.
   *
   * @remarks Inspiration from https://stackoverflow.com/a/35361695
   */
  public toString = (): string => {
    let type = this.type.toString();
    if (this.type == EntityType.Composite) {
      type = (this as unknown as Composite).compositeType;
    }

    if (this.name !== this.uuid) {
      return `${this.name} (${type}, ${this.uuid})`;
    } else {
      return `${type} (${this.uuid})`;
    }
  };

  /**
   * Adds a child to this parent entity. Throws exception if the child's name
   * is not unique with respect to other children of this parent, or if the
   * child has already been added to another parent.
   *
   * @param child - The child entity to add
   */
  addChild(child: Entity): void {
    // Do not allow a child to be added to itself
    if (child === this) {
      throw new Error(
        `Cannot add entity ${child.toString()} as a child to itself.`,
      );
    }

    // Do not allow a scene to be child of another entity.
    if (child.type == EntityType.Scene) {
      throw new Error(
        `Cannot add scene ${child.toString()} as a child to entity ${this.toString()}. A scene cannot be the child of an entity. A scene can only be added to a game object.`,
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
        `Cannot add child entity ${child.toString()} to parent entity ${this.toString()}. A child with name "${
          child.name
        }" already exists on this parent.`,
      );
    }

    // Type is Entity | undefined because a scene has an undefined parent.
    let otherParents = new Array<Entity | undefined>();

    if (this.isPartOfGame()) {
      // entity has been added to game; can check all the other game entities.
      otherParents = this.game.entities.filter((e) =>
        e.children.includes(child),
      );
    } else {
      // entity not added to game; can check only this entity's descendants.
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
      return;
    }

    const firstOtherParent = otherParents.find(Boolean);

    if (firstOtherParent === this) {
      throw new Error(
        `Cannot add child entity ${child.toString()} to parent entity ${this.toString()}. This child already exists on this parent. The child cannot be added again.`,
      );
    }

    throw new Error(
      `Cannot add child entity ${child.toString()} to parent entity ${this.toString()}. This child already exists on other parent entity: ${firstOtherParent?.toString()}}. Remove the child from the other parent first.`,
    );
  }

  /**
   * Removes all children from the entity.
   */
  removeAllChildren(): void {
    while (this.children.length) {
      const child = this.children.pop();
      if (child) {
        child.parent = undefined;
      }
    }
  }

  /**
   * Removes the specific child from this parent entity. Throws exception if
   * this parent does not contain the child.
   *
   * @param child
   */
  removeChild(child: Entity): void {
    if (this.children.includes(child)) {
      child.parent = undefined;
      this.children = this.children.filter((c) => c !== child);
    } else {
      throw new Error(
        `cannot remove entity ${child} from parent ${this} because the entity is not currently a child of the parent`,
      );
    }
  }

  /**
   * Removes the children from the parent. Throws error if the parent does not
   * contain all of the children.
   *
   * @param children - An array of children to remove from the parent entity
   */
  removeChildren(children: Array<Entity>): void {
    children.forEach((child) => {
      if (!this.children.includes(child)) {
        throw new Error(
          `cannot remove entity ${child} from parent ${this} because the entity is not currently a child of the parent`,
        );
      }
      child.parent = undefined;
    });
    this.children = this.children.filter((child) => !children.includes(child));
  }

  /**
   * Searches all descendants by name and returns first matching entity.
   *
   * @remarks Descendants are children and children of children, recursively.
   * Throws exception if no descendant with the given name is found.
   *
   * @param name - Name of the descendant entity to return
   * @returns
   */
  descendant<T extends Entity>(name: string): T {
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
   * Returns all descendant entities.
   *
   * @remarks Descendants are children and children of children, recursively.
   */
  get descendants(): Array<Entity> {
    function getChildEntitiesRecursive(
      entity: Entity,
      entities: Array<Entity>,
    ): void {
      entities.push(entity);
      entity.children.forEach((child) =>
        getChildEntitiesRecursive(child, entities),
      );
    }
    const entities = new Array<Entity>();
    this.children.forEach((child) =>
      getChildEntitiesRecursive(child, entities),
    );
    return entities;
  }

  /**
   * Returns all ancestor entities, not including the entity itself.
   */
  get ancestors(): Array<Entity> {
    function getAncestorsRecursive(
      entity: Entity,
      entities: Array<Entity>,
    ): Array<Entity> {
      if (entity.type == EntityType.Scene || !entity.parent) {
        return entities;
      }
      entities.push(entity.parent);
      return getAncestorsRecursive(entity.parent, entities);
    }
    const entities = new Array<Entity>();
    return getAncestorsRecursive(this, entities);
  }

  /**
   * Determines if this entity or ancestor is part of an active action that
   * affects it appearance.
   *
   * @remarks This is used to determine if the entity should be rendered with
   * anti-aliasing or not. Anti-aliasing on some devices causes a new shader
   * to be compiled during the action, which causes jank.
   *
   * @returns true if part of active action affecting appearance
   */
  involvedInActionAffectingAppearance(): boolean {
    const entities = this.ancestors.concat(this);
    const actions = entities.flatMap((entity) => entity.actions);
    return actions.some(
      (action) =>
        action.running &&
        (action.type === ActionType.Move || action.type === ActionType.Scale),
    );
  }

  /**
   * Determines if the entity is a transitioning Scene or a descendant of a
   * transitioning Scene.
   *
   * @returns true if transitioning
   */
  involvedInSceneTransition(): boolean {
    let rootScene: Scene;
    if (this.type === EntityType.Scene) {
      rootScene = this as unknown as Scene;
    } else {
      rootScene = this.parentSceneAsEntity as unknown as Scene;
    }
    return rootScene._transitioning;
  }

  /**
   * Executes a callback when the user presses down on the entity.
   *
   * @remarks TapDown is a pointer down (mouse click or touches begin) within
   * the bounds of the entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onTapDown(
    callback: (tapEvent: TapEvent) => void,
    options?: CallbackOptions,
  ): void {
    // cast <(ev: EntityEvent) => void> is needed because callback parameter
    // in this onTapDown method has argument of type TapEvent, but
    // addEventListener() expects a more general EntityEvent type
    this.addEventListener(
      EventType.TapDown,
      <(ev: EntityEvent) => void>callback,
      options,
    );
  }

  /**
   * Executes a callback when the user releases a press, that has been fully
   * within the entity, from the entity.
   *
   * @remarks TapUp is a pointer up (mouse click release or touches end) within
   * the bounds of the entity and the pointer, while down, has never moved
   * beyond the bounds of the entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}ue.
   */
  onTapUp(
    callback: (tapEvent: TapEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      EventType.TapUp,
      <(ev: EntityEvent) => void>callback,
      options,
    );
  }

  /**
   * Executes a callback when the user releases a press from the entity within
   * the bounds of the entity.
   *
   * @remarks TapUpAny is a pointer up (mouse click release or touches end)
   * within the bounds of the entity and the pointer, while down, is allowed to
   * have been beyond the bounds of the entity during the press before the
   * release.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onTapUpAny(
    callback: (tapEvent: TapEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      EventType.TapUpAny,
      <(ev: EntityEvent) => void>callback,
      options,
    );
  }

  /**
   * Executes a callback when the user moves the pointer (mouse, touches) beyond
   * the bounds of the entity while the pointer is down.
   *
   * @remarks TapLeave occurs when the pointer (mouse, touches) that has
   * previously pressed the entity moves beyond the bounds of the entity
   * before the press release.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onTapLeave(
    callback: (tapEvent: TapEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      EventType.TapLeave,
      <(ev: EntityEvent) => void>callback,
      options,
    );
  }

  /**
   * Executes a callback when the pointer first is down on the entity.
   *
   * @remarks PointerDown is a pointer down (mouse click or touches begin) within
   * the bounds of the entity. It occurs under the same conditions as TapDown.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onPointerDown(
    callback: (m2PointerEvent: M2PointerEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      EventType.PointerDown,
      <(ev: EntityEvent) => void>callback,
      options,
    );
  }

  /**
   * Executes a callback when the user releases a press from the entity within
   * the bounds of the entity.
   *
   * @remarks PointerUp is a pointer up (mouse click release or touches end)
   * within the bounds of the entity. It does not require that there was a
   * previous PointerDown on the entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onPointerUp(
    callback: (m2PointerEvent: M2PointerEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      EventType.PointerUp,
      <(ev: EntityEvent) => void>callback,
      options,
    );
  }

  /**
   * Executes a callback when the user moves the pointer (mouse or touches)
   * within the bounds of the entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onPointerMove(
    callback: (m2PointerEvent: M2PointerEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      EventType.PointerMove,
      <(ev: EntityEvent) => void>callback,
      options,
    );
  }

  /**
   * Executes a callback when the user moves the pointer (mouse or touches)
   * outside the bounds of the entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onPointerLeave(
    callback: (m2PointerEvent: M2PointerEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      EventType.PointerLeave,
      <(ev: EntityEvent) => void>callback,
      options,
    );
  }

  /**
   * Executes a callback when the user begins dragging an entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onDragStart(
    callback: (m2DragEvent: M2DragEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      EventType.DragStart,
      <(ev: EntityEvent) => void>callback,
      options,
    );
  }

  /**
   * Executes a callback when the user continues dragging an entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onDrag(
    callback: (m2DragEvent: M2DragEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      EventType.Drag,
      <(ev: EntityEvent) => void>callback,
      options,
    );
  }

  /**
   * Executes a callback when the user stop dragging an entity.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onDragEnd(
    callback: (m2DragEvent: M2DragEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      EventType.DragEnd,
      <(ev: EntityEvent) => void>callback,
      options,
    );
  }

  addEventListener(
    type: EventType | string,
    callback: (ev: EntityEvent) => void,
    callbackOptions?: CallbackOptions,
  ): void {
    const eventListener: EntityEventListener = {
      type: type,
      entityUuid: this.uuid,
      callback: callback,
    };

    if (callbackOptions?.replaceExisting) {
      this.eventListeners = this.eventListeners.filter(
        (listener) =>
          !(
            listener.entityUuid === eventListener.entityUuid &&
            listener.type === eventListener.type
          ),
      );
    }

    if (this.eventListeners.some((listener) => listener.type == type)) {
      console.warn(
        `game {${this.game.id}}: listener for event ${type} has already been added to this entity {${this}}. This is usually not intended.`,
      );
    }

    this.eventListeners.push(eventListener);
  }

  private parseLayoutConstraints(
    constraints: Constraints,
    allGameEntities: Array<Entity>,
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
        let entity: Entity | undefined;
        let additionalExceptionMessage = "";

        if (typeof constraints[constraintType] === "object") {
          entity = constraints[constraintType] as Entity;
        } else {
          const entityName = constraints[constraintType] as string;
          entity = allGameEntities
            .filter((e) => e.name === entityName)
            .find(Boolean);
          additionalExceptionMessage = `. sibling entity named "${entityName}" has not been added to the game object`;
        }

        if (entity === undefined) {
          throw new Error(
            "could not find sibling entity for constraint" +
              additionalExceptionMessage,
          );
        }

        const layoutConstraint = new LayoutConstraint(constraintType, entity);
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
    let y = constraint.alterEntity.absolutePosition.y;

    if (constraint.alterEntityMinimum) {
      // we're constraining to the alter's minimum (top)
      // if the alter is NOT a scene, then to get the top of the alter
      // we have to subtract half of the alter's height because positions
      // are relative to the alter's anchor
      // TODO: don't assume .5 ANCHOR
      // But if the alter IS a scene, there's no need to make this
      // calculate because the scene is the root coordinate system and
      // it's top by definition is 0
      if (!(constraint.alterEntity.type === EntityType.Scene)) {
        y = y - constraint.alterEntity.size.height * 0.5 * scale;
      }
    } else {
      if (!(constraint.alterEntity.type === EntityType.Scene)) {
        y = y + constraint.alterEntity.size.height * 0.5 * scale;
      } else {
        y = y + constraint.alterEntity.size.height * scale;
      }
    }
    if (constraint.focalEntityMinimum) {
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
    let x = constraint.alterEntity.absolutePosition.x;

    if (constraint.alterEntityMinimum) {
      if (!(constraint.alterEntity.type === EntityType.Scene)) {
        x = x - constraint.alterEntity.size.width * 0.5 * scale;
      }
    } else {
      if (!(constraint.alterEntity.type === EntityType.Scene)) {
        x = x + constraint.alterEntity.size.width * 0.5 * scale;
      } else {
        x = x + constraint.alterEntity.size.width * scale;
      }
    }
    if (constraint.focalEntityMinimum) {
      x = x + this.size.width * 0.5 * scale;
      x = x + marginStart * scale;
    } else {
      x = x - this.size.width * 0.5 * scale;
      x = x - marginEnd * scale;
    }
    return x;
  }

  /**
   * Calculates the absolute alpha of the entity, taking into account the
   * alpha of all ancestor parent entities.
   *
   * @remarks Alpha has multiplicative inheritance from all ancestors.
   *
   * @param alpha - Opacity of the entity
   * @param ancestors - Array of ancestor parent entities
   * @returns
   */
  private calculateAbsoluteAlpha(alpha: number, ancestors: Entity[]): number {
    const inheritedAlpha = ancestors.reduce((acc, ancestor) => {
      return acc * ancestor.alpha;
    }, 1);
    return alpha * inheritedAlpha;
  }

  update(): void {
    if (this.needsInitialization) {
      // note: the below initialize() function will be called on the DERIVED CLASS's initialize(),
      // never this base abstract Entity
      this.initialize();
      /**
       * Previously, we set this.needsInitialization to false here. However,
       * we now let each entity's initialize() method to determine when it is
       * initialized. This is because some entities are using assets that
       * have deferred loading, and only the entity knows when it has finished
       * initialization.
       */
    }

    this.absoluteAlphaChange =
      this.calculateAbsoluteAlpha(this.alpha, this.ancestors) -
      this.absoluteAlpha;
    this.absoluteAlpha += this.absoluteAlphaChange;

    if (this.parent === undefined) {
      // if there's no parent, then this entity is a screen
      this.absolutePosition.x = this.position.x * this.scale;
      this.absolutePosition.y = this.position.y * this.scale;
      this.absoluteScale = this.scale;
    } else {
      // this entity has a parent; it inherits the parent's scale
      this.absoluteScale = this.parent.absoluteScale * this.scale;

      if (this.layout?.constraints === undefined) {
        // entity sets its position directly using its position property
        this.absolutePosition.x =
          this.parent.absolutePosition.x +
          this.position.x * this.parent.absoluteScale;
        this.absolutePosition.y =
          this.parent.absolutePosition.y +
          this.position.y * this.parent.absoluteScale;
      } else {
        // entity sets its position using layout approach, with constraints.
        // this is much more complicated than using only the entity's
        // position property.
        const horizontalBias = this.layout?.constraints?.horizontalBias ?? 0.5;
        const verticalBias = this.layout?.constraints?.verticalBias ?? 0.5;
        const marginTop = this.layout?.marginTop ?? 0;
        const marginBottom = this.layout?.marginBottom ?? 0;
        const marginStart = this.layout?.marginStart ?? 0;
        const marginEnd = this.layout?.marginEnd ?? 0;

        const layoutConstraints = this.parseLayoutConstraints(
          this.layout?.constraints,
          //this.parentScene.game.entities
          this.parentSceneAsEntity.descendants,
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

    /**
     * Distinguish uncompleted actions that can run during a scene transition
     * from uncompleted "regular" ones that do not
     */
    const uncompletedTransitionActions = this.actions.filter(
      (action) => action.runDuringTransition && !action.completed,
    );
    const uncompletedRegularActions = this.actions.filter(
      (action) => !action.runDuringTransition && !action.completed,
    );

    // Evaluate all uncompleted actions that can run during a transition
    if (uncompletedTransitionActions.length > 0) {
      uncompletedTransitionActions.forEach((action) => {
        if (action.runStartTime === -1) {
          // if there are any and they have not started yet, set their run time to now
          action.runStartTime = Globals.now;
        }
      });
      uncompletedTransitionActions.forEach((action) =>
        Action.evaluateAction(action, this, Globals.now, Globals.deltaTime),
      );
    }

    // If not transitioning, evaluate all regular uncompleted actions
    if (
      !this.involvedInSceneTransition() &&
      uncompletedRegularActions.length > 0
    ) {
      uncompletedRegularActions.forEach((action) => {
        if (action.runStartTime === -1) {
          action.runStartTime = Globals.now;
        }
      });
      uncompletedRegularActions.forEach((action) =>
        Action.evaluateAction(action, this, Globals.now, Globals.deltaTime),
      );
    }

    // Update the entity's children
    //
    // If an entity uses positioning based only on the position property,
    // it does not matter in what order the children are updated. If the
    // entity uses layout constraints, however, one sibling's position
    // may depend on another (e.g., the top of entity A is the bottom of
    // entity B). The update of siblings must be properly ordered so that
    // dependencies are resolved prior to the positioning calculations (e.g.,
    // we must update entity B before we update entity A).
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
     * Get the uuids of all the sibling entities that this focal
     * entity's constraints depend on. Ignore parent constraints, because
     * the parent will have been updated already.
     *
     * @param parent - The focal entity's parent
     * @param constraints - The focal entity's constraints
     * @returns Array<string> - the uuids of the siblings the focal entity depends on
     */
    function getSiblingConstraintUuids(
      parent: Entity,
      constraints: Constraints | undefined,
    ): Array<string> {
      const uuids = new Array<string>();
      if (constraints === undefined) {
        return uuids;
      }
      const constraintTypes = Object.values(ConstraintType);
      constraintTypes.forEach((constraint) => {
        if (constraints[constraint] !== undefined) {
          let siblingConstraint: Entity | undefined;
          let additionalExceptionMessage = "";

          if (typeof constraints[constraint] === "object") {
            siblingConstraint = constraints[constraint] as Entity;
          } else {
            const entityName = constraints[constraint] as string;
            let allGameEntities: Array<Entity>;
            if (parent.type === EntityType.Scene) {
              //allGameEntities = (parent as Scene).game.entities;
              allGameEntities = parent.descendants;
            } else {
              //allGameEntities = parent.parentScene.game.entities;
              allGameEntities = parent.parentSceneAsEntity.descendants;
            }
            siblingConstraint = allGameEntities
              .filter((e) => e.name === entityName)
              .find(Boolean);
            if (siblingConstraint === undefined) {
              additionalExceptionMessage = `. sibling entity named "${entityName}" has not been added to the game object`;
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

    // Model the DAG in a Map where the key is the uuid of the focal entity,
    // and the value is an array of other entity uuids that this focal entity
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
      const childrenInUpdateOrder = new Array<Entity>();

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
   * Draws each child entity that is Drawable and is not hidden, by zPosition
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
   * Runs an action on this entity.
   *
   * @remarks If the entity is part of an active scene, the action runs
   * immediately. Otherwise, the action will run when the entity's scene
   * becomes active. Calling run() multiple times on an entity will add
   * to existing actions, not replace them.
   *
   * @param action - The action to run
   * @param key - key (string identifier) used to identify the action.
   * Only needed if the action will be referred to later
   */
  run(action: Action, key?: string): void {
    //this.actions = action.initialize(this);
    this.actions.push(...action.initialize(this, key));
    this.originalActions = this.actions
      .filter((action) => action.runDuringTransition === false)
      .map((action) => Action.cloneAction(action, key));
  }

  /**
   * Remove an action from this entity. If the action is running, it will be
   * stopped.
   *
   * @param key - key (string identifier) of the action to remove
   */
  removeAction(key: string): void {
    this.actions = this.actions.filter((action) => action.key !== key);
  }

  /**
   * Remove all actions from this entity. If actions are running, they will be
   * stopped.
   */
  removeAllActions(): void {
    while (this.actions.length) {
      this.actions.pop();
    }
  }

  /**
   * Duplicates an entity using deep copy.
   *
   * @remarks This is a deep recursive clone (entity and children).
   * The uuid property of all duplicated entities will be newly created,
   * because uuid must be unique.
   *
   * @param newName - optional name of the new, duplicated entity. If not
   * provided, name will be the new uuid
   */
  abstract duplicate(newName?: string): Entity;

  protected getEntityOptions(): EntityOptions {
    const entityOptions = {
      name: this.name,
      position: this.position,
      scale: this.scale,
      isUserInteractionEnabled: this.isUserInteractionEnabled,
      hidden: this.hidden,
    };
    return entityOptions;
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
   * Gets the scene that contains this entity by searching up the ancestor tree recursively. Throws exception if entity is not part of a scene.
   *
   * @returns Scene that contains this entity
   */
  // get parentScene(): Scene {
  //   if (this.type === EntityType.scene) {
  //     throw new Error(
  //       `Entity ${this} is a scene and cannot have a parent scene`
  //     );
  //   }
  //   if (this.parent && this.parent.type === EntityType.scene) {
  //     return this.parent as Scene;
  //   } else if (this.parent) {
  //     return this.parent.parentScene;
  //   }
  //   throw new Error(`Entity ${this} has not been added to a scene`);
  // }

  get canvasKit(): CanvasKit {
    return this.game.canvasKit;
  }

  get parentSceneAsEntity(): Entity {
    if (this.type === EntityType.Scene) {
      throw new Error(
        `Entity ${this} is a scene and cannot have a parent scene`,
      );
    }
    if (this.parent && this.parent.type === EntityType.Scene) {
      return this.parent;
    } else if (this.parent) {
      return this.parent.parentSceneAsEntity;
    }
    throw new Error(`Entity ${this} has not been added to a scene`);
  }

  get position(): Point {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const entity = this;
    return {
      get x(): number {
        return entity._position.x;
      },
      set x(x: number) {
        entity._position.x = x;
      },
      get y(): number {
        return entity._position.y;
      },
      set y(y: number) {
        entity._position.y = y;
      },
    };
  }

  set position(position: Point) {
    this._position = position;
  }

  get zRotation(): number {
    return this._zRotation;
  }

  set zRotation(zRotation: number) {
    this._zRotation = zRotation;
  }

  get scale(): number {
    return this._scale;
  }

  set scale(scale: number) {
    this._scale = scale;
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
          inDegree.set(edge, inDegree.get(edge)! + 1);
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
        throw "bad";
      }
      tSort.push(current);
      // Mark the current vertex as visited and decrease the inDegree for the edges of the vertex
      // Imagine we are deleting this current vertex from our graph
      if (adjList.has(current)) {
        adjList.get(current)?.forEach((edge) => {
          if (inDegree.has(edge) && inDegree.get(edge)! > 0) {
            // Decrease the inDegree for the adjacent vertex
            const newDegree = inDegree.get(edge)! - 1;
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
