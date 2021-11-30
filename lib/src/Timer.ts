export class Timer {
  private originTime = -1;
  private startTime = -1;
  private stopTime = -1;
  private stopped = true;
  private _elapsed = -1;
  private name: string;

  private static _timers = new Array<Timer>();

  constructor(name: string) {
    this.name = name;
  }

  public static Start(name: string): void {
    let timer = this._timers.filter((t) => t.name === name).find(Boolean);
    if (timer === undefined) {
      timer = new Timer(name);
      timer.originTime = window.performance.now();
      timer._elapsed = 0;
      this._timers.push(timer);
    }

    timer.startTime = window.performance.now();
    timer.stopped = false;
  }

  public static Stop(name: string): void {
    const timer = this._timers.filter((t) => t.name === name).find(Boolean);
    if (timer === undefined) {
      throw new Error("timer with this name does not exist");
    }

    if (timer.stopped === true) {
      throw new Error("timer is already stopped");
    }

    timer.stopTime = window.performance.now();
    timer._elapsed = timer._elapsed + timer.stopTime - timer.startTime;
    timer.stopped = true;
  }

  static Restart(name: string): void {
    const timer = this._timers.filter((t) => t.name === name).find(Boolean);
    if (timer === undefined) {
      throw new Error("timer with this name does not exist");
    }

    timer.startTime = window.performance.now();
    timer._elapsed = 0;
    timer.stopped = false;
    console.log("timer restarted");
  }

  static Elapsed(name: string): number {
    const timer = this._timers.filter((t) => t.name === name).find(Boolean);
    if (timer === undefined) {
      throw new Error("timer with this name does not exist");
    }

    if (timer.stopped) {
      return timer._elapsed;
    }

    return timer._elapsed + window.performance.now() - timer.startTime;
  }

  static Remove(name: string): void {
    const timer = this._timers.filter((t) => t.name === name).find(Boolean);
    if (timer === undefined) {
      throw new Error("timer with this name does not exist");
    }

    this._timers.filter((t) => t.name != name);
  }

  static Exists(name: string): boolean {
    return this._timers.some((t) => t.name === name);
  }

  static RemoveAll(): void {
    this._timers = new Array<Timer>();
  }
}
