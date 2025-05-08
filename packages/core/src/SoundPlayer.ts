import { M2Node } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { SoundPlayerOptions } from "./SoundPlayerOptions";
import { ActionType } from "./ActionType";
import { PlayAction } from "./Action";
import { M2Error } from "./M2Error";

export class SoundPlayer extends M2Node implements SoundPlayerOptions {
  readonly type = M2NodeType.SoundPlayer;
  isDrawable = false;
  soundName: string;

  /**
   * Node for playing sounds.
   *
   * @param options - {@link SoundPlayerOptions}
   */
  constructor(options: SoundPlayerOptions) {
    super(options);
    this.soundName = options.soundName;
  }

  override initialize(): void {}

  /**
   * Remove an action from this node. If the action is running, it will be
   * stopped.
   *
   * @privateRemarks This methods overrides the `removeAction` method from the
   * `M2Node` class. It is necessary to override this method because the
   * `SoundPlayer` class has a special case for removing actions that play
   * sounds.
   *
   * @param key - key (string identifier) of the action to remove
   */
  override removeAction(key: string): void {
    const actionToRemove = this.actions.find((action) => action.key === key);
    if (actionToRemove?.type === ActionType.Play) {
      this.stopSoundActionAudio(actionToRemove);
    }
    this.actions = this.actions.filter((action) => action.key !== key);
  }

  /**
   * Remove all actions from this node. If actions are running, they will be
   * stopped.
   *
   * @privateRemarks This methods overrides the `removeAllActions` method from
   * the `M2Node` class. It is necessary to override this method because the
   * `SoundPlayer` class has a special case for removing actions that play
   * sounds.
   */
  override removeAllActions(): void {
    while (this.actions.length) {
      const removedAction = this.actions.pop();
      if (removedAction?.type === ActionType.Play) {
        this.stopSoundActionAudio(removedAction);
      }
    }
  }

  /**
   * Stops the audio source node for a sound play action.
   *
   * @remarks When a SoundPlayer play action is removed, the audio source node
   * must be stopped and disconnected.
   *
   * @param playAction - the play action of the sound to stop
   */
  private stopSoundActionAudio(playAction: PlayAction) {
    if (playAction.running) {
      const m2Sound = this.game.soundManager.getSound(this.soundName);
      m2Sound.audioBufferSource?.stop();
      m2Sound.audioBufferSource?.disconnect();
    }
  }

  dispose(): void {}

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override duplicate(newName?: string): SoundPlayer {
    throw new M2Error("Method not implemented.");
  }
}
