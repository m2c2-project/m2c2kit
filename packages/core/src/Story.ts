import { Scene } from "./Scene";
import { StoryOptions } from "./StoryOptions";

export abstract class Story {
  // We need to include options as argument, because the concrete classes use them
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static create(options?: StoryOptions): Array<Scene> {
    return new Array<Scene>();
  }
}
