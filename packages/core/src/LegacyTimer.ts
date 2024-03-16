/**
 * A class to create, start, and stop named timers that measure elapsed time in milliseconds.
 *
 * @deprecated Use Timer class instead. To migrate to the Timer class, use Timer.startNew() to create and start a new timer instead
 * of LegacyTimer.start().
 */
export class LegacyTimer {
  // startTime is the timestamp of the current active run
  private startTime = NaN;
  private stopTime = NaN;
  private stopped = true;
  /**
   * cumulativeElapsed is a cumulative total of elapsed time while the timer
   * was in previous started (running) states, NOT INCLUDING the possibly
   * active run's duration
   */
  private cumulativeElapsed = NaN;
  private name: string;

  private static _timers = new Array<LegacyTimer>();

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Aliases performance.now()
   *
   * @remarks The m2c2kit Timer class is designed to measure elapsed durations
   * after a designated start point for a uniquely named timer. However, if a
   * timestamp based on the
   * [time origin](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp#the_time_origin)
   * is needed, this method can be used.
   *
   * @deprecated Use Timer class.
   *
   * @returns a [DOMHighResTimeStamp](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp)
   */
  public static now(): number {
    return window.performance.now();
  }

  /**
   * Starts a millisecond-resolution timer based on
   * [performance.now()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now).
   *
   * @remarks The method throws an error if a timer with the given
   * name is already in a started state.
   *
   * @deprecated Use Timer class. Use Timer.startNew() to create and start a new timer or Timer.new() to create a new timer without starting it.
   *
   * @param name - The name of the timer to be started
   */
  public static start(name: string): void {
    let timer = this._timers.filter((t) => t.name === name).find(Boolean);
    if (timer === undefined) {
      timer = new LegacyTimer(name);
      timer.cumulativeElapsed = 0;
      this._timers.push(timer);
    } else {
      if (timer.stopped == false) {
        throw new Error(
          `can't start timer. timer with name ${name} is already started`,
        );
      }
    }

    timer.startTime = window.performance.now();
    timer.stopped = false;
  }

  /**
   * Stops a timer.
   *
   * @remarks The method throws an error if a timer with the given
   * name is already in a stopped state, or if a timer with the
   * given name has not been started.
   *
   * @deprecated Use Timer class.
   *
   * @param name - The name of the timer to be stopped
   */
  public static stop(name: string): void {
    const timer = this._timers.filter((t) => t.name === name).find(Boolean);
    if (timer === undefined) {
      throw new Error(
        `can't stop timer. timer with name ${name} does not exist`,
      );
    }

    if (timer.stopped === true) {
      throw new Error(
        `can't stop timer. timer with name ${name} is already stopped`,
      );
    }

    timer.stopTime = window.performance.now();
    timer.cumulativeElapsed =
      timer.cumulativeElapsed + timer.stopTime - timer.startTime;
    timer.stopped = true;
  }

  /**
   * Restarts a timer.
   *
   * @remarks The timer elapsed duration is set to 0 and it starts anew.
   * The method throws an error if a timer with the given
   * name does not exist (if there is not a started or stopped timer
   * with the given name).
   *
   * @deprecated Use Timer class. Use Timer.startNew() to create and start a new timer with the same name.
   *
   * @param name - The name of the timer to be restarted
   */
  static restart(name: string): void {
    const timer = this._timers.filter((t) => t.name === name).find(Boolean);
    if (timer === undefined) {
      throw new Error(
        `can't restart timer. timer with name ${name} does not exist`,
      );
    }

    timer.startTime = window.performance.now();
    timer.cumulativeElapsed = 0;
    timer.stopped = false;
  }

  /**
   * Returns the total time elapsed, in milliseconds, of the timer.
   *
   * @remarks The total time elapsed will include all durations from multiple
   * starts and stops of the timer, if applicable. A timer's elapsed duration
   * can be read while it is in started or stopped state. The method throws
   * an error if a timer with the given name does not exist.
   *
   * @deprecated Use Timer class.
   *
   * @param name - The name of the timer whose elapsed duration is requested
   */
  static elapsed(name: string): number {
    const timer = this._timers.filter((t) => t.name === name).find(Boolean);
    if (timer === undefined) {
      throw new Error(
        `can't get elapsed time. timer with name ${name} does not exist`,
      );
    }

    if (timer.stopped) {
      return timer.cumulativeElapsed;
    }

    // To the previous cumulative elapsed durations, add the active run duration
    return timer.cumulativeElapsed + window.performance.now() - timer.startTime;
  }

  /**
   * Removes a timer.
   *
   * @remarks After removal, no additional methods can be used with a timer
   * of the given name, other than to start a new timer with the given name,
   * whose duration will begin at 0 again. The method throws an error if
   * a timer with the given name does not exist.
   *
   * @deprecated Use Timer class.
   *
   * @param name - The name of the timer to be removed
   */
  static remove(name: string): void {
    const timer = this._timers.filter((t) => t.name === name).find(Boolean);
    if (timer === undefined) {
      throw new Error(
        `can't remove timer. timer with name ${name} does not exist`,
      );
    }

    this._timers = this._timers.filter((t) => t.name != name);
  }

  /**
   * Remove all timers.
   *
   * @remarks This method will {@link remove} any timers in a started or
   * stopped state. This method is idempotent; method is safe to call even
   * if there are no timers to remove; no errors are thrown if there are
   * not any timers that can be removed.
   *
   * @deprecated Use Timer class.
   */
  static removeAll(): void {
    this._timers = new Array<LegacyTimer>();
  }

  /**
   * Checks if a timer of the given name exists.
   *
   * @remarks The method checks if there is a timer with the given name.
   *
   * @deprecated Use Timer class.
   *
   * @param name - The name of the timer to check for existence
   * @returns boolean
   */
  static exists(name: string): boolean {
    return this._timers.some((t) => t.name === name);
  }
}
