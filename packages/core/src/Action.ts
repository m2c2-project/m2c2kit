import { Entity } from "./Entity";
import { MoveActionOptions } from "./MoveActionOptions";
import { WaitActionOptions } from "./WaitActionOptions";
import { CustomActionOptions } from "./CustomActionOptions";
import { ScaleActionOptions } from "./ScaleActionOptions";
import { IActionContainer } from "./IActionContainer";
import { ActionType } from "./ActionType";
import { Point } from "./Point";
import { EasingFunction } from "./Easings";
import { Easings } from "./Easings";

export abstract class Action {
  abstract type: ActionType;

  startOffset = -1;
  endOffset = -1;
  started = false;
  running = false;
  completed = false;
  runStartTime = -1;
  duration = 0;
  runDuringTransition: boolean;

  parent?: Action;
  isParent = false;
  isChild = false;
  key?: string;

  constructor(runDuringTransition = false) {
    this.runDuringTransition = runDuringTransition;
  }

  /**
   * Creates an action that will move an entity to a point on the screen.
   *
   * @param options - {@link MoveActionOptions}
   * @returns The move action
   */
  public static move(options: MoveActionOptions): Action {
    return new moveAction(
      options.point,
      options.duration,
      options.easing ?? Easings.linear,
      options.runDuringTransition ?? false
    );
  }

  /**
   * Creates an action that will wait a given duration before it is considered complete.
   *
   * @param options - {@link WaitActionOptions}
   * @returns The wait action
   */
  public static wait(options: WaitActionOptions): Action {
    return new waitAction(
      options.duration,
      options.runDuringTransition ?? false
    );
  }

  /**
   * Creates an action that will execute a callback function.
   *
   * @param options - {@link CustomActionOptions}
   * @returns The custom action
   */
  public static custom(options: CustomActionOptions): Action {
    return new customAction(
      options.callback,
      options.runDuringTransition ?? false
    );
  }

  /**
   * Creates an action that will scale the entity's size.
   *
   * @remarks Scaling is relative to any inherited scaling, which is multiplicative. For example, if the entity's parent is scaled to 2.0 and this entity's action scales to 3.0, then the entity will appear 6 times as large as original.
   *
   * @param options - {@link ScaleActionOptions}
   * @returns The scale action
   */
  public static scale(options: ScaleActionOptions): Action {
    return new scaleAction(
      options.scale,
      options.duration,
      options.runDuringTransition
    );
  }

  /**
   * Creates an array of actions that will be run in order.
   *
   * @remarks The next action will not begin until the current one has finished. The sequence will be considered completed when the last action has completed.
   *
   * @param actions - One or more actions that form the sequence
   * @returns
   */
  public static sequence(actions: Array<Action>): Action {
    const sequence = new sequenceAction(actions);
    sequence.children = actions;
    return sequence;
  }

  /**
   * Create an array of actions that will be run simultaneously.
   *
   * @remarks All actions within the group will begin to run at the same time. The group will be considered completed when the longest-running action has completed.
   *
   * @param actions - One or more actions that form the group
   * @returns
   */
  public static group(actions: Array<Action>): Action {
    const group = new groupAction(actions);
    group.children = actions;
    return group;
  }

  initialize(entity: Entity, key?: string): Array<Action> {
    // entity.runStartTime = -1;
    this.assignParents(this, this, key);
    const actions = this.flattenActions(this);
    actions.forEach(
      (action) => (action.duration = this.calculateDuration(action))
    );
    this.calculateStartEndOffsets(this);

    // clone actions so we can reuse them on other entities
    // we need to clone because actions have state that is updated over time
    // such as whether they are running or not, etc.
    // if we didn't clone actions, two entities running the same action would
    // share state
    const clonedActions = actions
      .filter(
        (action) =>
          action.type !== ActionType.group &&
          action.type !== ActionType.sequence
      )
      .map((action) => {
        // to prevent circular references, set parent to defined
        // we needed parent only when calculating durations, we no
        // longer need it when executing the actions
        return Action.cloneAction(action, key);
      });

    return clonedActions;
  }

  static cloneAction(action: Action, key?: string): Action {
    let cloned: Action;

    switch (action.type) {
      case ActionType.sequence: {
        const sequence = action as sequenceAction;
        const sequenceChildren = sequence.children.map((child) =>
          Action.cloneAction(child, key)
        );
        cloned = Action.sequence(sequenceChildren);
        break;
      }
      case ActionType.group: {
        const group = action as sequenceAction;
        const groupChildren = group.children.map((child) =>
          Action.cloneAction(child, key)
        );
        cloned = Action.sequence(groupChildren);
        break;
      }
      case ActionType.move: {
        const move = action as moveAction;
        cloned = Action.move({
          point: move.point,
          duration: move.duration,
          easing: move.easing,
          runDuringTransition: move.runDuringTransition,
        });
        break;
      }
      case ActionType.custom: {
        const code = action as customAction;
        cloned = Action.custom({
          callback: code.callback,
          runDuringTransition: code.runDuringTransition,
        });
        break;
      }
      case ActionType.scale: {
        const scale = action as scaleAction;
        cloned = Action.scale({
          scale: scale.scale,
          duration: scale.duration,
          runDuringTransition: scale.runDuringTransition,
        });
        break;
      }
      case ActionType.wait: {
        const wait = action as waitAction;
        cloned = Action.wait({
          duration: wait.duration,
          runDuringTransition: wait.runDuringTransition,
        });
        break;
      }
      default:
        throw new Error("unknown action");
    }
    if (key !== undefined) {
      cloned.key = key;
    }
    cloned.startOffset = action.startOffset;
    cloned.endOffset = action.endOffset;
    return cloned;
  }

  static evaluateAction(
    action: Action,
    entity: Entity,
    now: number,
    dt: number
  ): void {
    // action should not start yet
    if (now < action.runStartTime + action.startOffset) {
      return;
    }

    if (
      now >= action.runStartTime + action.startOffset &&
      now <= action.runStartTime + action.startOffset + action.duration
    ) {
      action.running = true;
    } else {
      action.running = false;
    }

    if (action.running === false && action.completed === true) {
      return;
    }

    const elapsed = now - (action.runStartTime + action.startOffset);

    if (action.type === ActionType.custom) {
      const customAction = action as customAction;
      customAction.callback();
      customAction.running = false;
      customAction.completed = true;
    }

    if (action.type === ActionType.wait) {
      const waitAction = action as waitAction;
      if (now > action.runStartTime + action.startOffset + action.duration) {
        waitAction.running = false;
        waitAction.completed = true;
      }
    }

    if (action.type === ActionType.move) {
      const moveAction = action as moveAction;

      if (!moveAction.started) {
        moveAction.dx = moveAction.point.x - entity.position.x;
        moveAction.dy = moveAction.point.y - entity.position.y;
        moveAction.startPoint.x = entity.position.x;
        moveAction.startPoint.y = entity.position.y;
        moveAction.started = true;
      }

      if (elapsed < moveAction.duration) {
        entity.position.x = moveAction.easing(
          elapsed,
          moveAction.startPoint.x,
          moveAction.dx,
          moveAction.duration
        );
        entity.position.y = moveAction.easing(
          elapsed,
          moveAction.startPoint.y,
          moveAction.dy,
          moveAction.duration
        );
      } else {
        entity.position.x = moveAction.point.x;
        entity.position.y = moveAction.point.y;
        moveAction.running = false;
        moveAction.completed = true;
      }
    }

    if (action.type === ActionType.scale) {
      const scaleAction = action as scaleAction;

      if (!scaleAction.started) {
        scaleAction.delta = scaleAction.scale - entity.scale;
        scaleAction.started = true;
      }

      if (elapsed < scaleAction.duration) {
        entity.scale =
          entity.scale + scaleAction.delta * (dt / scaleAction.duration);
      } else {
        entity.scale = scaleAction.scale;
        scaleAction.running = false;
        scaleAction.completed = true;
      }
    }
  }

  private calculateDuration(action: Action): number {
    if (action.type === ActionType.group) {
      const groupAction = action as groupAction;
      const duration = groupAction.children
        .map((child) => this.calculateDuration(child))
        .reduce((max, dur) => {
          return Math.max(max, dur);
        }, 0);
      return duration;
    }

    if (action.type === ActionType.sequence) {
      const groupAction = action as groupAction;
      const duration = groupAction.children
        .map((child) => this.calculateDuration(child))
        .reduce((sum, dur) => {
          return sum + dur;
        }, 0);
      return duration;
    }

    return action.duration;
  }

  private calculateStartEndOffsets(action: Action): void {
    let parentStartOffset = 0;
    if (action.parent !== undefined) {
      parentStartOffset = action.parent.startOffset;
    }

    if (action.parent?.type! === ActionType.group) {
      action.startOffset = parentStartOffset;
      action.endOffset = action.startOffset + action.duration;
    } else if (action.parent?.type === ActionType.sequence) {
      const parent = action.parent as IActionContainer;

      let dur = 0;
      for (const a of parent!.children!) {
        if (a === action) {
          break;
        }
        dur = dur + a.duration;
      }
      action.startOffset = dur;
      action.endOffset = action.startOffset + action.duration;
    } else {
      action.startOffset = parentStartOffset;
      action.endOffset = action.startOffset + action.duration;
    }

    if (action.isParent) {
      (action as IActionContainer).children?.forEach((child) =>
        this.calculateStartEndOffsets(child)
      );
    }
  }

  private flattenActions(
    action: Action,
    actions?: Array<Action>
  ): Array<Action> {
    if (!actions) {
      actions = new Array<Action>();
      actions.push(action);
    }
    if (action.isParent) {
      const parent = action as IActionContainer;
      const children = parent.children!;
      actions.push(...children);
      parent
        .children!.filter((child) => child.isParent)
        .forEach((child: Action) => this.flattenActions(child, actions));
    }
    return actions;
  }

  private assignParents(
    action: Action,
    rootAction: Action,
    key?: string
  ): void {
    if (key !== undefined) {
      action.key = key;
    }
    if (!rootAction) {
      rootAction = action;
      rootAction.parent = undefined;
    }
    if (action.isParent) {
      const parent = action as IActionContainer;
      const children = parent.children!;
      children.forEach((child) => {
        child.parent = action;
      });
      parent
        .children!.filter((child) => child.isParent)
        .forEach((child: Action) => this.assignParents(child, rootAction, key));
    }
  }
}

export class sequenceAction extends Action implements IActionContainer {
  type = ActionType.sequence;
  children: Array<Action>;
  constructor(actions: Array<Action>) {
    super();
    this.children = actions;
    this.isParent = true;
  }
}

export class groupAction extends Action implements IActionContainer {
  type = ActionType.group;
  children = new Array<Action>();
  constructor(actions: Array<Action>) {
    super();
    this.children = actions;
    this.isParent = true;
  }
}

export class customAction extends Action {
  type = ActionType.custom;
  callback: () => void;
  constructor(callback: () => void, runDuringTransition = false) {
    super(runDuringTransition);
    this.callback = callback;
    this.isParent = false;
    this.duration = 0;
  }
}

export class waitAction extends Action {
  type = ActionType.wait;
  constructor(duration: number, runDuringTransition: boolean) {
    super(runDuringTransition);
    this.duration = duration;
    this.isParent = false;
  }
}

export class moveAction extends Action {
  type = ActionType.move;
  point: Point;
  startPoint: Point;
  dx = 0;
  dy = 0;
  easing: EasingFunction;
  constructor(
    point: Point,
    duration: number,
    easing: EasingFunction,
    runDuringTransition: boolean
  ) {
    super(runDuringTransition);
    this.duration = duration;
    this.point = point;
    this.isParent = false;
    this.startPoint = { x: NaN, y: NaN };
    this.easing = easing;
  }
}

export class scaleAction extends Action {
  type = ActionType.scale;
  scale: number;
  delta = 0;
  constructor(scale: number, duration: number, runDuringTransition = false) {
    super(runDuringTransition);
    this.duration = duration;
    this.scale = scale;
    this.isParent = false;
  }
}
