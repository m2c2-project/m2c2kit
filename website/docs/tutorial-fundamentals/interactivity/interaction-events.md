---
sidebar_position: 2
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Events

One way of thinking of user interaction is that the user is sending **events** to the entities. For example, when the user clicks on a button, the button receives a `TapDown` event. The button can then respond to the event by executing code. The code passed into the `onTapDown()` method is called an [event handler](<https://en.wikipedia.org/wiki/Event_(computing)#Event_handler>) because it handles the `TapDown` event.

There are several types of events that can be sent to entities:

- `TapDown` - occurs when the user begins a touch or click within the bounds of the entity.
- `TapUp` - occurs when the user releases a touch or click within the bounds of the entity.
- `TapLeave` - occurs when the user holds a touch or click on the entity, but moves outside the bounds of the entity.
- `TapUpAny` - occurs when the user releases a touch or click within _or_ outside the bounds of the entity.
- `PointerDown` - occurs when the user begins a touch or click within the bounds of the entity. Same as `TapDown`.
- `PointerUp` - occurs when the user releases a touch or click within the bounds of the entity, but the touch or click _did not_ have to begin within the bounds of the entity.
- `PointerMove` - occurs when the user moves the mouse or touch within the bounds of the entity.

:::tip

The variety of tap and pointer events may seem confusing, and the difference between a tap and a pointer may also be hard to understand. In most cases, you'll just need the `TapDown` and `TapUp` events. The other events are useful for more advanced scenarios.

:::
