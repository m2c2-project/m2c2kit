import { EventBase } from "./EventBase";
export interface GameEvent extends EventBase {
  gameUuid: string;
  gameName: string;
}
