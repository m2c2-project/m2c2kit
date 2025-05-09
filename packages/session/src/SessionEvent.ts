import { M2Event } from "@m2c2kit/core";
import { Session } from "./Session";

/** Base interface for all Session events. */
export interface SessionEvent extends M2Event<Session> {
  target: Session;
}

export const SessionEventType = {
  SessionInitialize: "SessionInitialize",
  SessionStart: "SessionStart",
  SessionEnd: "SessionEnd",
  SessionData: "SessionData",
} as const;

export type SessionEventType =
  (typeof SessionEventType)[keyof typeof SessionEventType];
