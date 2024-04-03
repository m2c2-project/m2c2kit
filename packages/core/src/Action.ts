import { M2Node } from "./M2Node";
import { M2NodeType } from ".";
import { MoveActionOptions } from "./MoveActionOptions";
import { WaitActionOptions } from "./WaitActionOptions";
import { CustomActionOptions } from "./CustomActionOptions";
import { ScaleActionOptions } from "./ScaleActionOptions";
import { FadeAlphaActionOptions } from "./FadeAlphaActionOptions";
import { RotateActionOptions } from "./RotateActionOptions";
import { PlayActionOptions } from "./PlayActionOptions";
import { ActionContainer } from "./ActionContainer";
import { ActionType } from "./ActionType";
import { Point } from "./Point";
import { EasingFunction } from "./Easings";
import { Easings } from "./Easings";
import { M2c2KitHelpers } from "./M2c2KitHelpers";
import { SoundPlayer } from "./SoundPlayer";
import { Futurable } from "./Futurable";
/**
 * The Action class has static methods for creating actions to be executed by
 * an M2Node.
 */
export abstract class Action {
  abstract type: ActionType;

  startOffset = new Futurable(0);
  endOffset = new Futurable(0);
  started = false;
  running = false;
  completed = false;
  // Start time of a running action is always known; it is not a Futurable.
  runStartTime = -1;
  duration: Futurable = new Futurable();
  runDuringTransition: boolean;

  parent?: ActionContainer;
  key?: string;

  constructor(runDuringTransition = false) {
    this.runDuringTransition = runDuringTransition;
  }

  /**
   * Creates an action that will move a node to a point on the screen.
   *
   * @param options - {@link MoveActionOptions}
   * @returns The move action
   */
  public static move(options: MoveActionOptions): Action {
    return new MoveAction(
      options.point,
      new Futurable(options.duration),
      options.easing ?? Easings.linear,
      options.runDuringTransition ?? false,
    );
  }

  /**
   * Creates an action that will wait a given duration before it is considered
   * complete.
   *
   * @param options - {@link WaitActionOptions}
   * @returns The wait action
   */
  public static wait(options: WaitActionOptions): Action {
    return new WaitAction(
      new Futurable(options.duration),
      options.runDuringTransition ?? false,
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
      options.runDuringTransition ?? false,
    );
  }

  /**
   * Creates an action that will play a sound.
   *
   * @remarks This action can only be used with a SoundPlayer node.
   * It will throw an error if used with any other node type.
   *
   * @param options - {@link PlayActionOptions}
   * @returns The play action
   */
  public static play(options?: PlayActionOptions): Action {
    return new PlayAction(options?.runDuringTransition ?? false);
  }

  /**
   * Creates an action that will scale the node's size.
   *
   * @remarks Scaling is relative to any inherited scaling, which is
   * multiplicative. For example, if the node's parent is scaled to 2.0 and
   * this node's action scales to 3.0, then the node will appear 6 times as
   * large as original.
   *
   * @param options - {@link ScaleActionOptions}
   * @returns The scale action
   */
  public static scale(options: ScaleActionOptions): Action {
    return new ScaleAction(
      options.scale,
      new Futurable(options.duration),
      options.runDuringTransition,
    );
  }

  /**
   * Creates an action that will change the node's alpha (opacity).
   *
   * @remarks Alpha has multiplicative inheritance. For example, if the node's
   * parent is alpha .5 and this node's action fades alpha to .4, then the
   * node will appear with alpha .2.
   *
   * @param options - {@link FadeAlphaActionOptions}
   * @returns The fadeAlpha action
   */
  public static fadeAlpha(options: FadeAlphaActionOptions): Action {
    return new FadeAlphaAction(
      options.alpha,
      new Futurable(options.duration),
      options.runDuringTransition,
    );
  }

  /**
   * Creates an action that will rotate the node.
   *
   * @remarks Rotate actions are applied to their children. In addition to this
   * node's rotate action, all ancestors' rotate actions will also be applied.
   *
   * @param options - {@link RotateActionOptions}
   * @returns The rotate action
   */
  public static rotate(options: RotateActionOptions): Action {
    if (options.byAngle !== undefined && options.toAngle !== undefined) {
      throw new Error("rotate Action: cannot specify both byAngle and toAngle");
    }
    if (options.byAngle === undefined && options.toAngle === undefined) {
      throw new Error("rotate Action: must specify either byAngle or toAngle");
    }
    if (
      options.toAngle === undefined &&
      options.shortestUnitArc !== undefined
    ) {
      throw new Error(
        "rotate Action: shortestUnitArc can only be specified when toAngle is provided",
      );
    }
    if (
      options.toAngle !== undefined &&
      options.shortestUnitArc === undefined
    ) {
      options.shortestUnitArc = true;
    }
    return new RotateAction(
      options.byAngle,
      options.toAngle,
      options.shortestUnitArc,
      new Futurable(options.duration),
      options.runDuringTransition,
    );
  }

  /**
   * Creates an array of actions that will be run in order.
   *
   * @remarks The next action will not begin until the current one has
   * finished. The sequence will be considered completed when the last action
   * has completed.
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
   * @remarks All actions within the group will begin to run at the same time.
   * The group will be considered completed when the longest-running action
   * has completed.
   *
   * @param actions - One or more actions that form the group
   * @returns
   */
  public static group(actions: Array<Action>): Action {
    const group = new GroupAction(actions);
    group.children = actions;
    return group;
  }

  /**
   * Prepares the Action for execution.
   *
   * @remarks Calculates start and end times for all actions in the hierarchy
   * and adds them to the array of actions ready for execution.
   *
   * @param key - optional string to identify an action
   * @returns array of actions, excluding parent actions
   */
  initialize(key?: string): Array<Action> {
    this.assignParents(this, this, key);
    const action = Action.cloneAction(this, key);
    const actions = action.flattenActions(this);
    actions.forEach(
      (action) => (action.duration = this.calculateDuration(action)),
    );
    this.calculateStartEndOffsets(this);
    return this.excludeParentActions(actions);
  }

  /**
   * Returns the array of actions, excluding group and sequence actions.
   *
   * @remarks Parent actions, such as `group` and `sequence` are not run
   * directly, but are used to organize other actions. Specifically, they
   * impact the start and end time offsets of their children. After these
   * offset have been taken into consideration with a call to
   * `calculateStartEndOffsets()`, parent actions are no longer needed.
   *
   * @param actions - array of actions to filter
   * @returns array of actions, excluding parent actions
   */
  private excludeParentActions(actions: Action[]): Action[] {
    return actions.filter((action) => !this.isParent(action));
  }

  /**
   * Clones the action, and all its children, recursively.
   *
   * @remarks We need to clone because actions have state that is updated over
   * time such as whether they are running or not, etc. If we didn't clone
   * actions, two nodes running the same action would share state.
   *
   * @param action - the action to clone
   * @param key - optional string to identify an action
   * @returns the cloned action
   */
  static cloneAction(action: Action, key?: string): Action {
    let cloned: Action;

    switch (action.type) {
      case ActionType.Sequence: {
        const sequence = action as SequenceAction;
        const sequenceChildren = sequence.children.map((child) =>
          Action.cloneAction(child, key),
        );
        cloned = Action.sequence(sequenceChildren);
        break;
      }
      case ActionType.Group: {
        const group = action as SequenceAction;
        const groupChildren = group.children.map((child) =>
          Action.cloneAction(child, key),
        );
        cloned = Action.sequence(groupChildren);
        break;
      }
      case ActionType.Move: {
        const move = action as MoveAction;
        cloned = Action.move({
          point: move.point,
          duration: move.duration.value,
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
      case ActionType.Play: {
        const play = action as PlayAction;
        cloned = Action.play({
          runDuringTransition: play.runDuringTransition,
        });
        break;
      }
      case ActionType.Scale: {
        const scale = action as ScaleAction;
        cloned = Action.scale({
          scale: scale.scale,
          duration: scale.duration.value,
          runDuringTransition: scale.runDuringTransition,
        });
        break;
      }
      case ActionType.FadeAlpha: {
        const fadeAlpha = action as FadeAlphaAction;
        cloned = Action.fadeAlpha({
          alpha: fadeAlpha.alpha,
          duration: fadeAlpha.duration.value,
          runDuringTransition: fadeAlpha.runDuringTransition,
        });
        break;
      }
      case ActionType.Rotate: {
        const rotate = action as RotateAction;
        cloned = Action.rotate({
          byAngle: rotate.byAngle,
          toAngle: rotate.toAngle,
          shortestUnitArc: rotate.shortestUnitArc,
          duration: rotate.duration.value,
          runDuringTransition: rotate.runDuringTransition,
        });
        break;
      }
      case ActionType.Wait: {
        const wait = action as WaitAction;
        cloned = Action.wait({
          duration: wait.duration.value,
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

  /**
   * Evaluates an action, updating the node's properties as needed.
   *
   * @remarks This method is called every frame by the M2Node's `update()`
   * method.
   *
   * @param action - the Action to be evaluated and possibly run
   * @param node - the `M2Node` that the action will be run on
   * @param now - the current elapsed time, from `performance.now()`
   * @param dt - the time since the last frame (delta time)
   */
  static evaluateAction(
    action: Action,
    node: M2Node,
    now: number,
    dt: number,
  ): void {
    // action should not start yet
    if (now < action.runStartTime + action.startOffset.value) {
      return;
    }

    if (
      now >= action.runStartTime + action.startOffset.value &&
      now <=
        action.runStartTime + action.startOffset.value + action.duration.value
    ) {
      action.running = true;
    } else {
      action.running = false;
    }

    if (action.running === false && action.completed === true) {
      return;
    }

    const elapsed = now - (action.runStartTime + action.startOffset.value);

    if (action.type === ActionType.Custom) {
      const customAction = action as CustomAction;
      customAction.callback();
      customAction.running = false;
      customAction.completed = true;
    }

    if (action.type === ActionType.Play) {
      if (node.type !== M2NodeType.SoundPlayer) {
        throw new Error("Play action can only be used with a SoundPlayer");
      }
      const playAction = action as PlayAction;
      const soundPlayer = node as SoundPlayer;
      const soundManager = soundPlayer.game.soundManager;

      if (!playAction.started) {
        const m2Sound = soundManager.getSound(soundPlayer.soundName);
        if (m2Sound.audioBuffer) {
          const source = soundManager.audioContext.createBufferSource();
          source.buffer = m2Sound.audioBuffer;
          source.onended = () => {
            playAction.running = false;
            playAction.completed = true;
            /**
             * Now that the sound has ended, we can calculate the duration of
             * the action.
             */
            const knownDuration =
              performance.now() -
              (action.runStartTime + action.startOffset.value);
            /**
             * The assign method updates this Futurable's expression to the
             * known duration, and this will propagate to any other
             * Futurables that depend on this one.
             */
            action.duration.assign(knownDuration);
          };
          source.connect(soundManager.audioContext.destination);
          source.start();
          playAction.started = true;
        } else {
          console.warn(
            `Play action: audio buffer not ready for sound ${soundPlayer.soundName}; will try next frame`,
          );
        }
      }
    }

    if (action.type === ActionType.Wait) {
      const waitAction = action as WaitAction;
      if (
        now >
        action.runStartTime + action.startOffset.value + action.duration.value
      ) {
        waitAction.running = false;
        waitAction.completed = true;
      }
    }

    if (action.type === ActionType.Move) {
      const moveAction = action as MoveAction;

      if (!moveAction.started) {
        moveAction.dx = moveAction.point.x - node.position.x;
        moveAction.dy = moveAction.point.y - node.position.y;
        moveAction.startPoint.x = node.position.x;
        moveAction.startPoint.y = node.position.y;
        moveAction.started = true;
      }

      if (elapsed < moveAction.duration.value) {
        node.position.x = moveAction.easing(
          elapsed,
          moveAction.startPoint.x,
          moveAction.dx,
          moveAction.duration.value,
        );
        node.position.y = moveAction.easing(
          elapsed,
          moveAction.startPoint.y,
          moveAction.dy,
          moveAction.duration.value,
        );
      } else {
        node.position.x = moveAction.point.x;
        node.position.y = moveAction.point.y;
        moveAction.running = false;
        moveAction.completed = true;
      }
    }

    if (action.type === ActionType.Scale) {
      const scaleAction = action as ScaleAction;

      if (!scaleAction.started) {
        scaleAction.delta = scaleAction.scale - node.scale;
        scaleAction.started = true;
      }

      if (elapsed < scaleAction.duration.value) {
        node.scale =
          node.scale + scaleAction.delta * (dt / scaleAction.duration.value);
      } else {
        node.scale = scaleAction.scale;
        scaleAction.running = false;
        scaleAction.completed = true;
      }
    }

    if (action.type === ActionType.FadeAlpha) {
      const fadeAlphaAction = action as FadeAlphaAction;

      if (!fadeAlphaAction.started) {
        fadeAlphaAction.delta = fadeAlphaAction.alpha - node.alpha;
        fadeAlphaAction.started = true;
      }

      if (elapsed < fadeAlphaAction.duration.value) {
        node.alpha =
          node.alpha +
          fadeAlphaAction.delta * (dt / fadeAlphaAction.duration.value);
      } else {
        node.alpha = fadeAlphaAction.alpha;
        fadeAlphaAction.running = false;
        fadeAlphaAction.completed = true;
      }
    }

    if (action.type === ActionType.Rotate) {
      const rotateAction = action as RotateAction;

      if (!rotateAction.started) {
        if (rotateAction.byAngle !== undefined) {
          rotateAction.delta = rotateAction.byAngle;
        }
        if (rotateAction.toAngle !== undefined) {
          rotateAction.toAngle = M2c2KitHelpers.normalizeAngleRadians(
            rotateAction.toAngle,
          );
          node.zRotation = M2c2KitHelpers.normalizeAngleRadians(node.zRotation);

          rotateAction.delta = rotateAction.toAngle - node.zRotation;
          /**
           * If shortestUnitArc is true (default), we need to check if reaching
           * the final value is a clockwise or counter-clockwise rotation and
           * thus changing the sign and value of the delta.
           */
          if (
            rotateAction.shortestUnitArc === true &&
            Math.abs(rotateAction.delta) > Math.PI
          ) {
            rotateAction.delta = 2 * Math.PI - Math.abs(rotateAction.delta);
          }
        }
        rotateAction.started = true;
        rotateAction.finalValue = node.zRotation + rotateAction.delta;
      }

      if (elapsed < rotateAction.duration.value) {
        node.zRotation =
          node.zRotation +
          rotateAction.delta * (dt / rotateAction.duration.value);
        /**
         * Check if action has overshot the final value. If so, set to final
         * value. Check will vary depending on whether the delta is positive
         * or negative.
         */
        if (
          rotateAction.delta <= 0 &&
          node.zRotation < rotateAction.finalValue
        ) {
          node.zRotation = rotateAction.finalValue;
        }
        if (
          rotateAction.delta > 0 &&
          node.zRotation > rotateAction.finalValue
        ) {
          node.zRotation = rotateAction.finalValue;
        }
      } else {
        node.zRotation = rotateAction.finalValue;
        rotateAction.running = false;
        rotateAction.completed = true;
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
  private calculateDuration(action: Action): Futurable {
    if (action.type === ActionType.Group) {
      /**
       * Because group actions run in parallel, the duration of a group
       * action is the max duration of the longest running child
       */
      const groupAction = action as GroupAction;
      const duration = groupAction.children
        .map((child) => this.calculateDuration(child))
        .reduce((max, dur) => {
          return Math.max(max, dur.value);
        }, 0);
      return new Futurable(duration);
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
          return sum + dur.value;
        }, 0);
      return new Futurable(duration);
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
   * @param action - action that needs assigning start and end offsets
   */
  private calculateStartEndOffsets(action: Action): void {
    // if there's no parent, this action is the rootAction; start offset is 0
    const parentStartOffset: Futurable =
      action.parent?.startOffset ?? new Futurable(0);

    switch (action.parent?.type) {
      case ActionType.Group: {
        /**
         * If the action's parent is a group, this action's start offset
         * is the parent's start offset.
         */
        action.startOffset = parentStartOffset;
        break;
      }
      case ActionType.Sequence: {
        /**
         * If the action's parent is a sequence, this action's start offset
         * is the parent's start offset PLUS any sibling actions prior in
         * the sequence.
         */
        const priorSiblingsDuration = new Futurable(0);
        for (const siblingAction of action.parent.children) {
          if (siblingAction === action) {
            // if we've iterated to this action, then stop accumulating
            break;
          }
          /**
           * priorSiblingsDuration is the accumulator of prior sibling durations
           * in the sequence
           */
          priorSiblingsDuration.add(siblingAction.duration);
        }
        action.startOffset.add(parentStartOffset, priorSiblingsDuration);
        break;
      }
      default: {
        // the action has no parent.
        action.startOffset = new Futurable(0);
      }
    }
    action.endOffset.add(action.startOffset, action.duration);

    if (this.isParent(action)) {
      action.children.forEach((child) => this.calculateStartEndOffsets(child));
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
    actions?: Array<Action>,
  ): Array<Action> {
    // if first call, create the accumulator array of flattened actions
    if (!actions) {
      actions = new Array<Action>();
      actions.push(action);
    }
    if (this.isParent(action)) {
      const children = action.children;
      // flatten this parent's children and add to accumulator array
      actions.push(...children);
      // recurse for any children who themselves are parents
      children
        .filter((child) => this.isParent(child))
        .forEach((child) => this.flattenActions(child, actions));
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
    key?: string,
  ): void {
    if (key !== undefined) {
      action.key = key;
    }
    /**
     *  group and sequence are ActionContainer: parent actions that
     *  can hold other actions
     */
    if (this.isParent(action)) {
      const children = action.children;
      children.forEach((child) => {
        child.parent = action;
      });
      // recurse for any children who themselves are parents
      children
        .filter((child) => this.isParent(child))
        .forEach((child) => this.assignParents(child, rootAction, key));
    }
  }

  private isParent(action: Action): action is ActionContainer {
    return (
      action.type === ActionType.Group || action.type === ActionType.Sequence
    );
  }
}

export class SequenceAction extends Action implements ActionContainer {
  type = ActionType.Sequence;
  children: Array<Action>;
  constructor(actions: Array<Action>) {
    super();
    this.children = actions;
  }
}

export class GroupAction extends Action implements ActionContainer {
  type = ActionType.Group;
  children = new Array<Action>();
  constructor(actions: Array<Action>) {
    super();
    this.children = actions;
  }
}

export class CustomAction extends Action {
  type = ActionType.Custom;
  callback: () => void;
  constructor(callback: () => void, runDuringTransition = false) {
    super(runDuringTransition);
    this.callback = callback;
    this.duration = new Futurable(0);
  }
}

export class PlayAction extends Action {
  type = ActionType.Play;
  constructor(runDuringTransition = false) {
    super(runDuringTransition);
    this.duration = new Futurable();
  }
}

export class WaitAction extends Action {
  type = ActionType.Wait;
  constructor(duration: Futurable, runDuringTransition: boolean) {
    super(runDuringTransition);
    this.duration = duration;
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
    duration: Futurable,
    easing: EasingFunction,
    runDuringTransition: boolean,
  ) {
    super(runDuringTransition);
    this.duration = duration;
    this.point = point;
    this.startPoint = { x: NaN, y: NaN };
    this.easing = easing;
  }
}

export class ScaleAction extends Action {
  type = ActionType.Scale;
  scale: number;
  delta = 0;
  constructor(scale: number, duration: Futurable, runDuringTransition = false) {
    super(runDuringTransition);
    this.duration = duration;
    this.scale = scale;
  }
}

export class FadeAlphaAction extends Action {
  type = ActionType.FadeAlpha;
  alpha: number;
  delta = 0;
  constructor(alpha: number, duration: Futurable, runDuringTransition = false) {
    super(runDuringTransition);
    this.duration = duration;
    this.alpha = alpha;
  }
}

export class RotateAction extends Action {
  type = ActionType.Rotate;
  byAngle?: number;
  toAngle?: number;
  shortestUnitArc?: boolean;
  delta = 0;
  finalValue = NaN;
  constructor(
    byAngle: number | undefined,
    toAngle: number | undefined,
    shortestUnitArc: boolean | undefined,
    duration: Futurable,
    runDuringTransition = false,
  ) {
    super(runDuringTransition);
    this.duration = duration;
    this.byAngle = byAngle;
    this.toAngle = toAngle;
    this.shortestUnitArc = shortestUnitArc;
  }
}
