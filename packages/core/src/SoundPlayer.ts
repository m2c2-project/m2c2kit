import { M2Node } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { SoundPlayerOptions } from "./SoundPlayerOptions";

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
    throw new Error("Method not implemented.");
  }
}
