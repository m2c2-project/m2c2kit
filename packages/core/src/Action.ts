import { M2Node } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { M2SoundStatus } from "./M2Sound";
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
import { RepeatingActionContainer } from "./RepeatingActionContainer";
import { RepeatActionOptions } from "./RepeatActionOptions";
import { RepeatForeverActionOptions } from "./RepeatForeverActionOptions";

/**
 * The Action class has static methods for creating actions to be executed by
 * an M2Node.
 */
export abstract class Action {
  abstract type: ActionType;
  startOffset = new Futurable(0);
  started = false;
  running = false;
  private _completed = false;
  /**
   * Start time of a running action is always known; it is not a `Futurable`.
   * -1 indicates that the root action has not yet started running.
   */
  runStartTime = -1;
  duration: Futurable = new Futurable();
  runDuringTransition: boolean;
  parent?: ActionContainer;
  key?: string;

  constructor(runDuringTransition = false) {
    this.runDuringTransition = runDuringTransition;
  }

  /**
   * Prepares the Action for evaluation.
   *
   * @remarks Calculates start times for all actions in the hierarchy
   * and returns a copy of the action that is prepared for evaluation during
   * the update loop.
   *
   * @param key - optional string to identify an action
   * @returns action prepared for evaluation
   */
  initialize(key?: string): Action {
    const action = this.clone();
    this.assignParents(action, action, key);
    this.propagateRunDuringTransition(action);
    this.assignDurations(action);
    this.assignStartOffsets(action);
    return action;
  }

  /**
   * Clones the action, and any actions it contains, recursively.
   *
   * @remarks We need to clone an action before running it because actions
   * have state that is updated over time such as whether they are running or
   * not, etc. If we didn't clone actions, two nodes reusing the same action
   * would share state. On `Action`, this method is abstract and is
   * implemented in each subclass.
   *
   * @returns a clone of the action
   */
  abstract clone(): Action;

  /**
   * Parses the action hierarchy and assigns each action its parent and
   * root action.
   *
   * @remarks Uses recursion to handle arbitrary level of nesting parent
   * actions within parent actions. When this method is called from the
   * `initialize()` method, the root action is both the `action` and the
   * `rootAction`. This is because the action is the top-level action in the
   * hierarchy. When the method calls itself recursively, the `rootAction`
   * remains the same, but the `action` is a child action or the action of a
   * repeating action.
   *
   * @param action - the action to assign parents to
   * @param rootAction - top-level action passed to the run method
   * @param key - optional string to identify an action. The key is assigned
   * to every action in the hierarchy.
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
     * ActionContainer is a parent action that can hold other actions
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

  /**
   * Sets the runDuringTransition property based on descendants.
   *
   * @remarks This ensures that a parent action has its `runDuringTransition`
   * property set to true if any of its descendants have their
   * `runDuringTransition` property set to true. Parent actions do not have a
   * way for the user to set this property directly; it is inferred (propagated
   * up) from the descendants.
   *
   * @param action to propagate runDuringTransition property to
   */
  private propagateRunDuringTransition(action: Action): void {
    if (this.isParent(action)) {
      if (action.descendants.some((child) => child.runDuringTransition)) {
        action.runDuringTransition = true;
      }
      action.children.forEach((child) =>
        this.propagateRunDuringTransition(child),
      );
    }
  }

  /**
   * Assigns durations to all actions in the hierarchy.
   *
   * @remarks Uses recursion to handle arbitrary level of nesting parent
   * actions within parent actions.
   *
   * @param action - the action to assign durations to
   */
  private assignDurations(action: Action): void {
    action.duration = this.calculateDuration(action);
    if (this.isParent(action)) {
      action.children.forEach((child) => this.assignDurations(child));
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
    if (this.isRepeating(action)) {
      /**
       * Previously this line was:
       *   return new Futurable(this.calculateDuration(action.children[0]));
       * but this (incorrectly) ignored the fact that the duration of the
       * repeat action, even if its children have known durations, must be
       * multiplied by the number of repetitions. Therefore, move that
       * calculation to when the repeat action completes. The duration of a
       * repeat action will be calculated when it has completed all its
       * repetitions. Thus, here return a Futurable with an unknown duration.
       */
      return new Futurable();
    }

    /**
     * If the action is not a group or sequence, its duration is simply the
     * duration property of the action
     */
    return action.duration;
  }

  /**
   * Assigns start offsets to all actions in the hierarchy.
   *
   * @remarks Uses recursion to handle arbitrary level of nesting parent
   * actions within parent actions.
   *
   * @param action - the action to assign start offsets to
   */
  private assignStartOffsets(action: Action): void {
    action.startOffset = this.calculateStartOffset(action);
    if (this.isParent(action)) {
      action.children.forEach((child) => this.assignStartOffsets(child));
    }
  }

  /**
   * Calculates the start offset. This is when an action should start,
   * relative to the start time of its parent (if it has a parent).
   *
   * @param action - the action to calculate the start offset for
   * @returns the start offset as a Futurable
   */
  private calculateStartOffset(action: Action): Futurable {
    // if there's no parent, the action is the rootAction; start offset is 0
    if (action.parent === undefined) {
      return new Futurable(0);
    }

    /**
     * For all actions other than sequence, the start offset is the parent's
     * start offset.
     */
    if (action.parent.type !== ActionType.Sequence) {
      return action.parent.startOffset;
    }

    /**
     * When the action's parent is a sequence, the action's start offset
     * is the parent's start offset PLUS any sibling actions prior in
     * the sequence.
     */
    const startOffset = new Futurable(0);
    startOffset.add(action.parent.startOffset);

    for (const siblingAction of action.parent.children) {
      if (siblingAction === action) {
        // if we've iterated to this action, then stop accumulating
        break;
      }
      startOffset.add(siblingAction.duration);
    }
    return startOffset;
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
    if (node.involvedInSceneTransition() && !action.runDuringTransition) {
      return;
    }

    if (action.runStartTime === -1) {
      action.assignRunStartTimes(action, now);
    }

    // action should not be running yet
    if (now < action.runStartTime + action.startOffset.value) {
      return;
    }

    if (action.shouldBeRunning(now)) {
      action.running = true;
    }

    /**
     * Handle parent action separately. Parent actions are Group, Sequence,
     * Repeat, and RepeatForever.
     */
    if (action.isParent(action)) {
      /**
       * Evaluate all child actions of the parent action BEFORE evaluating
       * the parent action itself. This is because the parent action's
       * running and completed properties are dependent on the child
       * actions. And, for repeating actions, the parent action's duration is
       * dependent on the child actions.
       */
      action.children.forEach((child) => {
        Action.evaluateAction(child, node, now, dt);
      });

      // The following handles Group and Sequence actions.
      if (!action.isRepeating(action)) {
        if (!action.started) {
          action.started = true;
        }
        if (action.running && action.completed) {
          action.running = false;
        }
        return;
      }

      Action.evaluateRepeatingActions(action, now);
      return;
    }

    if (!action.shouldBeRunning(now)) {
      action.running = false;
    }

    /**
     * An action's running property is set to true when the current time is
     * in the interval when the action should be running. The running property,
     * however, is different from the completed property. An action may have
     * its running property set to false, but it is not yet completed. This
     * can happen when the time passes the interval when the action should be
     * running, but the action has not yet finished and reached its final
     * state. For example, a move action may have a duration of 1000 ms. At an
     * elapsed time of 992 ms, the move action has reached 99.2% of its final
     * position. Because frames are updated at chunked internals (16.67 ms if
     * running at 60 fps), the next time the action is evaluated, the elapsed
     * time may be 1008 ms. The action should no longer be running (because
     * the time is past the interval when it should be running), but the
     * action has not yet reached its final position. Thus, the action is not
     * yet completed. The action will be evaluated one more time, and the
     * action will be set to its final position. At that point, the action will
     * be completed.
     */

    if (action.running === false && action.completed === true) {
      return;
    }

    const elapsed = now - (action.runStartTime + action.startOffset.value);

    switch (action.type) {
      case ActionType.Custom:
        Action.evaluateCustomAction(action);
        break;
      case ActionType.Play:
        Action.evaluatePlayAction(node, action);
        break;
      case ActionType.Wait:
        Action.evaluateWaitAction(action, now);
        break;
      case ActionType.Move:
        Action.evaluateMoveAction(action, node, elapsed);
        break;
      case ActionType.Scale:
        Action.evaluateScaleAction(action, node, elapsed, dt);
        break;
      case ActionType.FadeAlpha:
        Action.evaluateFadeAlphaAction(action, node, elapsed, dt);
        break;
      case ActionType.Rotate:
        Action.evaluateRotateAction(action, node, elapsed, dt);
        break;
      default:
        throw new Error(`Action type not recognized: ${action.type}`);
    }
  }

  private static evaluateRepeatingActions(
    action: RepeatingActionContainer,
    now: number,
  ) {
    if (!action.started) {
      action.started = true;
    }
    if (action.repetitionHasCompleted) {
      action.completedRepetitions++;
      const repetitionDuration = action.children[0].duration.value;
      action.cumulativeDuration =
        action.cumulativeDuration + repetitionDuration;

      /**
       * Having completed a repetition, repetitionDuration must now be a
       * known, finite value. If not, then there is a problem in the code.
       */
      if (!isFinite(repetitionDuration)) {
        throw "repetitionDuration is not finite";
      }

      /**
       * The repeating action's completed property also checks if all
       * repetitions have been completed.
       */
      if (!action.completed) {
        action.restartAction(action, now);
      } else {
        if (action.type === ActionType.RepeatForever) {
          throw new Error("RepeatForever action should never complete");
        }
        /**
         * The repeat action has completed all repetitions. Assign the
         * duration of the repeat action, since it is now complete. Its
         * duration may be part of a dependent futurable.
         */
        action.duration.assign(action.cumulativeDuration);
        action.running = false;
      }
    }
  }

  private static evaluateRotateAction(
    action: Action,
    node: M2Node,
    elapsed: number,
    dt: number,
  ) {
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
      if (rotateAction.delta <= 0 && node.zRotation < rotateAction.finalValue) {
        node.zRotation = rotateAction.finalValue;
      }
      if (rotateAction.delta > 0 && node.zRotation > rotateAction.finalValue) {
        node.zRotation = rotateAction.finalValue;
      }
    } else {
      node.zRotation = rotateAction.finalValue;
      rotateAction.running = false;
      rotateAction.completed = true;
    }
  }

  private static evaluateFadeAlphaAction(
    action: Action,
    node: M2Node,
    elapsed: number,
    dt: number,
  ) {
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

  private static evaluateScaleAction(
    action: Action,
    node: M2Node,
    elapsed: number,
    dt: number,
  ) {
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

  private static evaluateMoveAction(
    action: Action,
    node: M2Node,
    elapsed: number,
  ) {
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

  private static evaluateWaitAction(action: Action, now: number) {
    const waitAction = action as WaitAction;
    if (
      now >
      action.runStartTime + action.startOffset.value + action.duration.value
    ) {
      waitAction.running = false;
      waitAction.completed = true;
    }
  }

  private static evaluatePlayAction(node: M2Node, action: Action) {
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
        if (m2Sound.status === M2SoundStatus.Error) {
          throw new Error(
            `error loading sound ${m2Sound.soundName} (url ${m2Sound.url})`,
          );
        }
        console.warn(
          `Play action: audio buffer not ready for sound ${soundPlayer.soundName} (url: ${m2Sound.url}); will try next frame`,
        );
        if (m2Sound.status === M2SoundStatus.Deferred) {
          // Do not await this; we want to continue evaluating other actions
          soundManager.fetchDeferredSound(m2Sound);
        }
      }
    }
  }

  private static evaluateCustomAction(action: Action) {
    const customAction = action as CustomAction;
    customAction.callback();
    customAction.running = false;
    customAction.completed = true;
  }

  /**
   * Assigns RunStartTime to all actions in the hierarchy.
   *
   * @remarks Uses recursion to handle arbitrary level of nesting parent
   * actions within parent actions.
   *
   * @param action - the action to assign RunStartTime to
   */
  assignRunStartTimes(action: Action, runStartTime: number): void {
    action.runStartTime = runStartTime;
    if (action.isParent(action)) {
      action.children.forEach((child) => {
        action.assignRunStartTimes(child, runStartTime);
      });
    }
  }

  /**
   * Configures action to be run again.
   *
   * @remarks This method is called on a repeating action's children when they
   * need to be run again.
   *
   * @param action - action to restart
   * @param now - current time
   */
  restartAction(action: Action, now: number): void {
    /**
     * Start action running now (set runStartTime to now rather than
     * -1. Setting to -1 would start it on the next frame update and thus
     * delay by a frame).
     */
    action.runStartTime = now;
    action.running = true;
    action.started = true;
    /**
     * Play actions are special in that they have a duration that is
     * unknown when the action begins. Other non-parent actions have a
     * known duration that was provided when the action was created.
     */
    if (action.type === ActionType.Play) {
      action.duration = new Futurable();
    }
    if (action.isParent(action)) {
      action.children.forEach((child) => {
        action.restartAction(child, now);
      });
      return;
    }
    /**
     * Parent actions' completed property is read-only. The below line will
     * execute only for non-parent actions.
     */
    action.completed = false;
  }

  /**
   * Determines if the action should be running.
   *
   * @remarks An action should be running if current time is in the interval
   * [ start time + start offset, start time + start offset + duration ]
   *
   * @param now - current time
   * @returns true if the action should be running
   */
  shouldBeRunning(now: number): boolean {
    return (
      now >= this.runStartTime + this.startOffset.value &&
      now <= this.runStartTime + this.startOffset.value + this.duration.value
    );
  }

  /**
   * Creates an action that will move a node to a point on the screen.
   *
   * @param options - {@link MoveActionOptions}
   * @returns The move action
   */
  public static move(options: MoveActionOptions) {
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
  public static wait(options: WaitActionOptions) {
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
  public static custom(options: CustomActionOptions) {
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
  public static play(options?: PlayActionOptions) {
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
  public static scale(options: ScaleActionOptions) {
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
  public static fadeAlpha(options: FadeAlphaActionOptions) {
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
  public static rotate(options: RotateActionOptions) {
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
  public static sequence(actions: Array<Action>) {
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
  public static group(actions: Array<Action>) {
    const group = new GroupAction(actions);
    group.children = actions;
    return group;
  }

  /**
   * Creates an action that will repeat another action a given number of times.
   *
   * @param options - {@link RepeatActionOptions}
   * @returns The repeat action
   */
  public static repeat(options: RepeatActionOptions) {
    return new RepeatAction(
      options.action,
      options.count,
      options.runDuringTransition,
    );
  }

  /**
   * Creates an action that will repeat another action forever.
   *
   * @remarks A repeat forever action is a special case of a repeat action
   * where the count is set to infinity.
   *
   * @param options - {@link RepeatForeverActionOptions}
   * @returns The repeat forever action
   */
  public static repeatForever(options: RepeatForeverActionOptions) {
    return new RepeatForeverAction(options.action, options.runDuringTransition);
  }

  /**
   * Type guard that returns true if the action is a parent action.
   *
   * @remarks Parent actions are Group, Sequence, Repeat, and RepeatForever
   * actions.
   *
   * @param action - action to check
   * @returns true if the action is a parent action
   */
  isParent(action: Action): action is ActionContainer {
    return (
      action.type === ActionType.Group ||
      action.type === ActionType.Sequence ||
      action.type === ActionType.Repeat ||
      action.type === ActionType.RepeatForever
    );
  }

  /**
   * Type guard that returns true if the action can repeat.
   *
   * @remarks Repeating actions are Repeat and RepeatForever actions.
   *
   * @param action - action to check
   * @returns true if the action is a RepeatAction or RepeatForeverAction
   */
  private isRepeating(action: Action): action is RepeatingActionContainer {
    return (
      action.type === ActionType.Repeat ||
      action.type === ActionType.RepeatForever
    );
  }

  // Note: use getter and setter for completed property because we override
  // them in SequenceAction, GroupAction, RepeatAction, and
  // RepeatForeverAction.
  /**
   * Indicates whether the action has completed.
   */
  get completed(): boolean {
    return this._completed;
  }

  set completed(value: boolean) {
    this._completed = value;
  }
}

export class SequenceAction extends Action implements ActionContainer {
  type = ActionType.Sequence;
  children: Array<Action>;

  constructor(actions: Array<Action>) {
    super();
    this.children = actions;
  }

  override clone(): SequenceAction {
    const clonedChildren = this.children.map((child) => child.clone());
    const clonedAction = Action.sequence(clonedChildren);
    clonedAction.children.forEach((child) => (child.key = this.key));
    clonedAction.key = this.key;
    return clonedAction;
  }

  /**
   * Indicates whether the action has completed, taking into account all its
   * child actions.
   *
   * @remarks Is read-only for parent actions.
   */
  override get completed(): boolean {
    return this.children.every((child) => child.completed);
  }

  get descendants(): Action[] {
    return getParentActionDescendants(this);
  }
}

export class GroupAction extends Action implements ActionContainer {
  type = ActionType.Group;
  children = new Array<Action>();

  constructor(actions: Array<Action>) {
    super();
    this.children = actions;
  }

  override clone(): GroupAction {
    const clonedChildren = this.children.map((child) => child.clone());
    const clonedAction = Action.group(clonedChildren);
    clonedAction.children.forEach((child) => (child.key = this.key));
    clonedAction.key = this.key;
    return clonedAction;
  }

  /**
   * Indicates whether the action has completed, taking into account all its
   * child actions.
   *
   * @remarks Is read-only for parent actions.
   */
  override get completed(): boolean {
    return this.children.every((child) => child.completed);
  }

  get descendants(): Action[] {
    return getParentActionDescendants(this);
  }
}

export class RepeatAction extends Action implements RepeatingActionContainer {
  type = ActionType.Repeat;
  count: number;
  children: Array<Action>;
  completedRepetitions = 0;
  cumulativeDuration = 0;

  constructor(action: Action, count: number, runDuringTransition = false) {
    super(runDuringTransition);
    this.children = [action];
    this.count = count;
    this.duration = new Futurable();
  }

  override clone(): RepeatAction {
    if (this.children.length !== 1) {
      // Should never happen, but check anyway, and throw an error.
      throw new Error("Repeat action must have exactly one child");
    }
    const clonedAction = Action.repeat({
      // RepeatAction always has exactly one child
      action: this.children[0].clone(),
      count: this.count,
      runDuringTransition: this.runDuringTransition,
    });
    clonedAction.children[0].key = this.key;
    clonedAction.key = this.key;
    return clonedAction;
  }

  /**
   * Indicates whether the action has completed, taking into account all its
   * child actions and the number of repetitions.
   *
   * @remarks Is read-only for parent actions.
   */
  override get completed(): boolean {
    return (
      this.children.every((child) => child.completed) &&
      this.completedRepetitions === this.count
    );
  }

  get descendantsAreCompleted(): boolean {
    return this.children.every((child) => child.completed);
  }

  /**
   * Indicates whether a single repetition of a repeating action has just
   * completed.
   *
   * @returns returns true if a repetition has completed
   */
  get repetitionHasCompleted(): boolean {
    /**
     * If:
     *   1. The repeating action is running
     *   2. All its descendants are completed
     *   3. The repeating action itself is NOT completed
     * That means we have just completed a single repetition of the repeating
     * action.
     * (Note: in addition to checking if all of its descendants are completed,
     * the completed property of the repeating action also checks if all its
     * repetitions have completed. That why it is possible to have
     * descendantsAreCompleted be true, but the completed property be false.)
     */
    return this.running && this.descendantsAreCompleted && !this.completed;
  }

  get descendants(): Action[] {
    return getParentActionDescendants(this);
  }
}

export class RepeatForeverAction extends RepeatAction {
  type = ActionType.RepeatForever;
  count = Infinity;

  constructor(action: Action, runDuringTransition = false) {
    super(action, Infinity, runDuringTransition);
  }

  override clone(): RepeatForeverAction {
    if (this.children.length !== 1) {
      // Should never happen, but check anyway, and throw an error.
      throw new Error("RepeatForever action must have exactly one child");
    }
    const clonedAction = Action.repeatForever({
      // RepeatForeverAction always has exactly one child
      action: this.children[0].clone(),
      runDuringTransition: this.runDuringTransition,
    });
    clonedAction.children[0].key = this.key;
    clonedAction.key = this.key;
    return clonedAction;
  }
}

function getParentActionDescendants(parentAction: ActionContainer): Action[] {
  const descendants: Action[] = [];
  function traverse(action: Action) {
    if (action.isParent(action)) {
      for (const child of action.children) {
        descendants.push(child);
        traverse(child);
      }
    }
  }
  traverse(parentAction);
  return descendants;
}

export class CustomAction extends Action {
  type = ActionType.Custom;
  callback: () => void;

  constructor(callback: () => void, runDuringTransition = false) {
    super(runDuringTransition);
    this.callback = callback;
    this.duration = new Futurable(0);
  }

  override clone(): CustomAction {
    const cloned = Action.custom({
      callback: this.callback,
      runDuringTransition: this.runDuringTransition,
    });
    cloned.key = this.key;
    return cloned;
  }
}

export class PlayAction extends Action {
  type = ActionType.Play;

  constructor(runDuringTransition = false) {
    super(runDuringTransition);
    this.duration = new Futurable();
  }

  override clone(): PlayAction {
    const cloned = Action.play({
      runDuringTransition: this.runDuringTransition,
    });
    cloned.key = this.key;
    return cloned;
  }
}

export class WaitAction extends Action {
  type = ActionType.Wait;

  constructor(duration: Futurable, runDuringTransition: boolean) {
    super(runDuringTransition);
    this.duration = duration;
  }

  override clone(): WaitAction {
    const cloned = Action.wait({
      duration: this.duration.value,
      runDuringTransition: this.runDuringTransition,
    });
    cloned.key = this.key;
    return cloned;
  }
}

export class MoveAction extends Action {
  type = ActionType.Move;
  point: Point;
  startPoint: Point = { x: NaN, y: NaN };
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
    this.easing = easing;
  }

  override clone(): MoveAction {
    const cloned = Action.move({
      point: this.point,
      duration: this.duration.value,
      easing: this.easing,
      runDuringTransition: this.runDuringTransition,
    });
    cloned.key = this.key;
    return cloned;
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
  override clone(): ScaleAction {
    const cloned = Action.scale({
      scale: this.scale,
      duration: this.duration.value,
      runDuringTransition: this.runDuringTransition,
    });
    cloned.key = this.key;
    return cloned;
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
  override clone(): FadeAlphaAction {
    const cloned = Action.fadeAlpha({
      alpha: this.alpha,
      duration: this.duration.value,
      runDuringTransition: this.runDuringTransition,
    });
    cloned.key = this.key;
    return cloned;
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

  override clone(): RotateAction {
    const cloned = Action.rotate({
      byAngle: this.byAngle,
      toAngle: this.toAngle,
      shortestUnitArc: this.shortestUnitArc,
      duration: this.duration.value,
      runDuringTransition: this.runDuringTransition,
    });
    cloned.key = this.key;
    return cloned;
  }
}
