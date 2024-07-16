import { M2Event, M2EventType, M2NodeNewEvent } from "./M2Event";
import { Timer } from "./Timer";
import { M2EventTarget } from "./M2EventTarget";
import { M2Node } from "./M2Node";
import { ConstraintType } from "./ConstraintType";
import { Constraints } from "./Constraints";
import { ImageManager } from "./ImageManager";
import { I18n } from "./I18n";

/**
 * Event store mode.
 */
export const EventStoreMode = {
  Disabled: "Disabled",
  Record: "Record",
  Replay: "Replay",
} as const;
export type EventStoreMode =
  (typeof EventStoreMode)[keyof typeof EventStoreMode];

export class EventStore {
  private events = new Array<M2Event<M2EventTarget>>();
  private replayBeginTimestamp = NaN;
  private firstTimestamp = NaN;
  replayThoughSequence = Number.MAX_VALUE;
  serializedEventsBeforeReplay = "";

  mode: EventStoreMode = EventStoreMode.Disabled;

  private serializeEvent(event: M2Event<object>): string {
    /**
     * We will replace the target property with a string representation of the
     * target object before serializing the event. This is because the target
     * object is not serializable.
     */
    const target = event.target;

    /**
     * If the event is a "NodeNew" event and the node options contain layout
     * constraints, we need to convert the constraints to a string-keyed object
     * with the UUIDs of the nodes as values, rather than references to the
     * nodes themselves. This is because the nodes in the layout constraints
     * are not serializable.
     */
    if (
      event.type === M2EventType.NodeNew &&
      (event as M2NodeNewEvent).nodeOptions?.layout?.constraints !== undefined
    ) {
      const constraints = (event as M2NodeNewEvent).nodeOptions?.layout
        ?.constraints;

      const constraintsWithStringKeys: Constraints = {};
      for (const constraintType in constraints) {
        if (
          constraintType === "horizontalBias" ||
          constraintType === "verticalBias"
        ) {
          constraintsWithStringKeys[constraintType as ConstraintType] =
            constraints[constraintType as ConstraintType];
          continue;
        }

        const node = constraints[constraintType as ConstraintType];
        if (node instanceof M2Node) {
          constraintsWithStringKeys[constraintType as ConstraintType] =
            node.uuid;
        }
      }

      event.target = (target as M2Node).uuid;
      // @ts-expect-error already checked that value is not null
      (event as M2NodeNewEvent).nodeOptions.layout.constraints =
        constraintsWithStringKeys;
      const s = JSON.stringify(event);
      event.target = target;
      // @ts-expect-error already checked that value is not null
      (event as M2NodeNewEvent).nodeOptions.layout.constraints = constraints;
      return s;
    }

    if (target instanceof M2Node) {
      event.target = target.uuid;
      const s = JSON.stringify(event);
      event.target = target;
      return s;
    }
    if (target instanceof Element) {
      event.target = target.nodeName;
      const s = JSON.stringify(event);
      event.target = target;
      return s;
    }
    if (target instanceof ImageManager) {
      event.target = "ImageManager";
      const s = JSON.stringify(event);
      event.target = target;
      return s;
    }
    if (target instanceof I18n) {
      event.target = "I18n";
      const s = JSON.stringify(event);
      event.target = target;
      return s;
    }
    event.target = "object";
    const s = JSON.stringify(event);
    event.target = target;
    return s;
  }

  addEvent(event: M2Event<M2EventTarget>) {
    if (this.mode === EventStoreMode.Record) {
      /**
       * Typically, the sequence number is set here. However, if the event
       * is a "NodeNew" event, the sequence number was set previously. This
       * is to ensure that the sequence number for a constructor event is
       * given the right sequence number.
       */
      if (event.sequence === undefined) {
        event.sequence = m2c2Globals.eventSequence;
      }
      /**
       * Clone the event before saving it to the event store. We do this by
       * serializing the event to a string and then parsing it back into an
       * object.
       */
      const s = this.serializeEvent(event);
      this.events.push(JSON.parse(s) as M2Event<M2EventTarget>);
    }
  }

  addEvents(events: Array<M2Event<M2EventTarget>>) {
    events.forEach((event) => {
      this.addEvent(event);
    });
  }

  clearEvents() {
    this.events = [];
  }

  record() {
    this.mode = EventStoreMode.Record;
  }

  replay(events?: M2Event<M2EventTarget>[]) {
    if (events) {
      this.events = events;
    }

    if (this.events.length === 0) {
      if (this.serializedEventsBeforeReplay !== "") {
        this.events = JSON.parse(this.serializedEventsBeforeReplay);
      } else {
        console.log("Event store has no events to replay.");
        return;
      }
    }

    this.mode = EventStoreMode.Replay;
    this.replayBeginTimestamp = Timer.now();

    this.sortEventStore(this.events);

    if (this.serializedEventsBeforeReplay === "") {
      this.serializedEventsBeforeReplay = JSON.stringify(this.events);
    }
    this.firstTimestamp = this.events[0].timestamp;
    console.log(
      `Event store has ${this.events.length} events. Replay beginning.`,
    );

    const sequenceInput = document.getElementById("sequence-number");
    if (sequenceInput) {
      this.replayThoughSequence = parseInt(
        (sequenceInput as HTMLInputElement).value,
      );
    }
  }

  getEvents(): M2Event<M2EventTarget>[] {
    this.sortEventStore(this.events);
    return this.events;
  }

  dequeueEvents(timestamp: number): M2Event<M2EventTarget>[] {
    const events = new Array<M2Event<M2EventTarget>>();

    const replayTimestamp =
      timestamp - this.replayBeginTimestamp + this.firstTimestamp;

    while (
      this.events.length > 0 &&
      this.events[0].timestamp <= replayTimestamp
    ) {
      const event = this.events.shift();
      if (!event) {
        throw new Error("EventStore.dequeueEvents(): undefined event");
      }
      if (
        event.sequence !== undefined &&
        event.sequence > this.replayThoughSequence
      ) {
        continue;
      }
      events.push(event);
    }

    return events;
  }

  get eventQueueLength(): number {
    return this.events.length;
  }

  /**
   * Sorts the events in the event store.
   *
   * @remarks The events are sorted by sequence number in ascending order.
   */
  private sortEventStore(events: Array<M2Event<M2EventTarget>>) {
    events.sort((a, b) => {
      if (a.sequence === undefined || b.sequence === undefined) {
        throw new Error("EventStore.sortEventStore(): undefined sequence");
      }
      if (a.sequence !== b.sequence) {
        return a.sequence - b.sequence;
      }
      return 0;
    });
  }
}
