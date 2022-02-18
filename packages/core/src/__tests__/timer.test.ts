/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Timer } from "../../build-umd";
import { JSDOM } from "jsdom";

const dom = new JSDOM(``);
// @ts-ignore
global.window = dom.window;

const sleep = (ms: number) => (perfCounter = perfCounter + ms);

let perfCounter = 0;
global.window.performance.now = () => {
  return perfCounter;
};

beforeEach(() => {
  Timer.removeAll();
});

describe("Timer", () => {
  it("returns 500ms elapsed after 500ms", () => {
    Timer.start("t1");
    sleep(500);
    expect(Timer.elapsed("t1")).toBe(500);
  });

  it("stops after stop is called", () => {
    Timer.start("t1");
    sleep(500);
    Timer.stop("t1");
    sleep(250);
    expect(Timer.elapsed("t1")).toBe(500);
  });

  it("removes a timer and can start a new one with the same name", () => {
    Timer.start("t1");
    sleep(500);
    Timer.remove("t1");
    sleep(100);
    Timer.start("t1");
    sleep(800);
    expect(Timer.elapsed("t1")).toBe(800);
  });

  it("keeps correct elapsed time after starting and stopping multiple times", () => {
    Timer.start("t1");
    sleep(500);
    Timer.stop("t1");
    sleep(500);
    Timer.start("t1");
    sleep(1500);
    Timer.stop("t1");
    expect(Timer.elapsed("t1")).toBe(2000);
  });

  it("restarts a running timer", () => {
    Timer.start("t1");
    sleep(500);
    Timer.restart("t1");
    sleep(1500);
    Timer.stop("t1");
    expect(Timer.elapsed("t1")).toBe(1500);
  });

  it("restarts a stopped timer", () => {
    Timer.start("t1");
    sleep(500);
    Timer.stop("t1");
    Timer.restart("t1");
    sleep(750);
    Timer.stop("t1");
    expect(Timer.elapsed("t1")).toBe(750);
  });

  it("is true that an existing timer exists", () => {
    Timer.start("t1");
    sleep(500);
    expect(Timer.exists("t1")).toBeTruthy();
  });

  it("is false that a non-existent timer exists", () => {
    sleep(500);
    expect(Timer.exists("t1")).toBeFalsy();
  });

  it("throws error when getting elapsed time of timer that wasn't started", () => {
    expect(() => {
      Timer.elapsed("t1");
    }).toThrow();
  });

  it("throws error when restarting a timer that wasn't ever started", () => {
    expect(() => {
      Timer.restart("t1");
    }).toThrow();
  });

  it("throws error when stopping a timer that wasn't started", () => {
    expect(() => {
      Timer.stop("t1");
    }).toThrow();
  });

  it("throws error when stopping a timer that is already stopped", () => {
    expect(() => {
      Timer.start("t1");
      sleep(500);
      Timer.stop("t1");
      Timer.stop("t1");
    }).toThrow();
  });

  it("throws error when removing a timer that wasn't ever started", () => {
    expect(() => {
      Timer.remove("t1");
    }).toThrow();
  });

  it("throws error when removing a timer more than once", () => {
    Timer.start("t1");
    sleep(500);
    Timer.remove("t1");
    expect(() => {
      Timer.remove("t1");
    }).toThrow();
  });

  it("throws error when starting a timer that is already running", () => {
    Timer.start("t1");
    sleep(500);
    expect(() => {
      Timer.start("t1");
    }).toThrow();
  });

  it("removes a started timer", () => {
    Timer.start("t1");
    sleep(500);
    Timer.remove("t1");
    expect(Timer.exists("t1")).toBeFalsy();
  });

  it("removes a stopped timer", () => {
    Timer.start("t1");
    sleep(500);
    Timer.stop("t1");
    Timer.remove("t1");
    expect(Timer.exists("t1")).toBeFalsy();
  });

  it("removes all timers", () => {
    Timer.start("t1");
    Timer.start("t2");
    sleep(500);
    Timer.removeAll();
    expect(Timer.exists("t1")).toBeFalsy();
    expect(Timer.exists("t2")).toBeFalsy();
  });

  it("can call remove all timers even if no timers exist", () => {
    Timer.removeAll();
  });
});
