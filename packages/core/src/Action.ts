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

/**
 * The Action class has static methods for creating actions to be executed by
 * an Entity.
 */
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
    return new MoveAction(
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
    return new WaitAction(
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
    return new CustomAction(
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
    return new ScaleAction(
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
    const sequence = new SequenceAction(actions);
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
    const group = new GroupAction(actions);
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
          action.type !== ActionType.Group &&
          action.type !== ActionType.Sequence
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
      case ActionType.Sequence: {
        const sequence = action as SequenceAction;
        const sequenceChildren = sequence.children.map((child) =>
          Action.cloneAction(child, key)
        );
        cloned = Action.sequence(sequenceChildren);
        break;
      }
      case ActionType.Group: {
        const group = action as SequenceAction;
        const groupChildren = group.children.map((child) =>
          Action.cloneAction(child, key)
        );
        cloned = Action.sequence(groupChildren);
        break;
      }
      case ActionType.Move: {
        const move = action as MoveAction;
        cloned = Action.move({
          point: move.point,
          duration: move.duration,
          easing: move.easing,
          runDuringTransition: move.runDuringTransition,
        });
        break;
      }
      case ActionType.Custom: {
        const code = action as CustomAction;
        cloned = Action.custom({
          callback: code.callback,
          runDuringTransition: code.runDuringTransition,
        });
        break;
      }
      case ActionType.Scale: {
        const scale = action as ScaleAction;
        cloned = Action.scale({
          scale: scale.scale,
          duration: scale.duration,
          runDuringTransition: scale.runDuringTransition,
        });
        break;
      }
      case ActionType.Wait: {
        const wait = action as WaitAction;
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

    if (action.type === ActionType.Custom) {
      const customAction = action as CustomAction;
      customAction.callback();
      customAction.running = false;
      customAction.completed = true;
    }

    if (action.type === ActionType.Wait) {
      const waitAction = action as WaitAction;
      if (now > action.runStartTime + action.startOffset + action.duration) {
        waitAction.running = false;
        waitAction.completed = true;
      }
    }

    if (action.type === ActionType.Move) {
      const moveAction = action as MoveAction;

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

    if (action.type === ActionType.Scale) {
      const scaleAction = action as ScaleAction;

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

  /**
   * Calculates the duration of an action, including any children actions
   * the action may contain.
   *
   * @remarks Uses recursion to handle arbitrary level of nesting parent
   * actions within parent actions
   *
   * @param action
   * @returns the calculated duration
   */
  private calculateDuration(action: Action): number {
    if (action.type === ActionType.Group) {
      /**
       * Because group actions run in parallel, the duration of a group
       * action is the max duration of the longest running child
       */
      const groupAction = action as GroupAction;
      const duration = groupAction.children
        .map((child) => this.calculateDuration(child))
        .reduce((max, dur) => {
          return Math.max(max, dur);
        }, 0);
      return duration;
    }
    if (action.type === ActionType.Sequence) {
      /**
       * Because sequence actions run in series, the duration of a sequence
       * action is the sum of all its child durations
       */
      const sequenceAction = action as SequenceAction;
      const duration = sequenceAction.children
        .map((child) => this.calculateDuration(child))
        .reduce((sum, dur) => {
          return sum + dur;
        }, 0);
      return duration;
    }

    /** If the action is not a group or sequence, its duration is simply the
     * duration property of the action
     */
    return action.duration;
  }

  /**
   * Update each action's start and end offsets.
   *
   * @remarks Uses recursion to handle arbitrary level of nesting parent
   * actions within parent actions.
   *
   * @param action that needs assigning start and end offsets
   */
  private calculateStartEndOffsets(action: Action): void {
    let parentStartOffset: number;
    if (action.parent === undefined) {
      // this is the rootAction
      parentStartOffset = 0;
    } else {
      parentStartOffset = action.parent.startOffset;
    }

    if (action.parent?.type! === ActionType.Group) {
      /**
       * If the action's parent is a group, this action's start offset
       * is the parent's start offset.
       */
      action.startOffset = parentStartOffset;
      action.endOffset = action.startOffset + action.duration;
    } else if (action.parent?.type === ActionType.Sequence) {
      const parent = action.parent as IActionContainer;
      /**
       * If the action's parent is a sequence, this action's start offset
       * is the parent's start offset PLUS any sibling actions prior in
       * the sequence.
       */
      let dur = 0;
      for (const a of parent.children!) {
        if (a === action) {
          // if we've iterated to this action, then stop accumulating
          break;
        }
        // dur is the accumulator of prior sibling durations in the sequence
        dur = dur + a.duration;
      }
      action.startOffset = parentStartOffset + dur;
      action.endOffset = action.startOffset + action.duration;
    } else {
      // the action has no parent.
      action.startOffset = 0;
      action.endOffset = action.startOffset + action.duration;
    }

    if (action.isParent) {
      (action as IActionContainer).children?.forEach((child) =>
        this.calculateStartEndOffsets(child)
      );
    }
  }

  /**
   * Takes an action hierarchy and flattens to an array of non-nested actions
   *
   * @remarks Uses recursion to handle arbitrary level of nesting parent
   * actions within parent actions
   *
   * @param action - the action to flatten
   * @param actions - the accumulator array of flattened actions. This will be
   * undefined on the first call, and an array on recursive calls
   * @returns flattened array of actions
   */
  private flattenActions(
    action: Action,
    actions?: Array<Action>
  ): Array<Action> {
    // if first call, create the accumulator array of flattened actions
    if (!actions) {
      actions = new Array<Action>();
      actions.push(action);
    }
    if (action.isParent) {
      const parent = action as IActionContainer;
      const children = parent.children!;
      // flatten this parent's children and add to accumulator array
      actions.push(...children);
      // recurse for any children who themselves are parents
      parent
        .children!.filter((child) => child.isParent)
        .forEach((child: Action) => this.flattenActions(child, actions));
    }
    return actions;
  }

  /**
   * Parses the action hierarchy and assigns each action its parent and
   * root action.
   *
   * @remarks Uses recursion to handle arbitrary level of nesting parent
   * actions within parent actions
   *
   * @param action
   * @param rootAction - top-level action passed to the run method
   * @param key - optional string to identify an action
   */
  private assignParents(
    action: Action,
    rootAction: Action,
    key?: string
  ): void {
    if (key !== undefined) {
      action.key = key;
    }
    /**
     *  group and sequence are IActionContainer: parent actions that
     *  can hold other actions
     */
    if (action.isParent) {
      const parent = action as IActionContainer;
      const children = parent.children!;
      children.forEach((child) => {
        child.parent = action;
        child.isChild = true;
      });
      // recurse for any children who themselves are parents
      parent
        .children!.filter((child) => child.isParent)
        .forEach((child: Action) => this.assignParents(child, rootAction, key));
    }
  }
}

export class SequenceAction extends Action implements IActionContainer {
  type = ActionType.Sequence;
  children: Array<Action>;
  constructor(actions: Array<Action>) {
    super();
    this.children = actions;
    this.isParent = true;
  }
}

export class GroupAction extends Action implements IActionContainer {
  type = ActionType.Group;
  children = new Array<Action>();
  constructor(actions: Array<Action>) {
    super();
    this.children = actions;
    this.isParent = true;
  }
}

export class CustomAction extends Action {
  type = ActionType.Custom;
  callback: () => void;
  constructor(callback: () => void, runDuringTransition = false) {
    super(runDuringTransition);
    this.callback = callback;
    this.isParent = false;
    this.duration = 0;
  }
}

export class WaitAction extends Action {
  type = ActionType.Wait;
  constructor(duration: number, runDuringTransition: boolean) {
    super(runDuringTransition);
    this.duration = duration;
    this.isParent = false;
  }
}

export class MoveAction extends Action {
  type = ActionType.Move;
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

export class ScaleAction extends Action {
  type = ActionType.Scale;
  scale: number;
  delta = 0;
  constructor(scale: number, duration: number, runDuringTransition = false) {
    super(runDuringTransition);
    this.duration = duration;
    this.scale = scale;
    this.isParent = false;
  }
}
