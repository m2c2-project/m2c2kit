import { M2NodeEvent } from "./M2NodeEvent";

/**
 * Describes an event on the device's built-in keyboard.
 *
 * @remarks The built-in keyboard is defined as the hardware keyboard on a
 * desktop/laptop or the built-in soft keyboard on a tablet or phone. The
 * latter is not used in m2c2kit. On tablet or phone, the `VirtualKeyboard`
 * in the `@m2c2kit/addons` package should be used for key events.
 * @remarks Key events can occur only on a `Scene` node.
 */
export interface M2KeyboardEvent extends M2NodeEvent {
  /** String that is generated when key is pressed, with any modifiers (e.g., Shift) applied. */
  key: string;
  /** Code for the key, not taking into account any modifiers. */
  code: string;
  /** True if the Shift key is pressed. */
  shiftKey: boolean;
  /** True if the Control key is pressed. */
  ctrlKey: boolean;
  /** True if the Alt key is pressed. */
  altKey: boolean;
  /** True if the Meta key is pressed. */
  metaKey: boolean;
  /** True if the event is being repeated. */
  repeat: boolean;
}
