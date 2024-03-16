/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Timer } from "..";
import { TestHelpers } from "./TestHelpers";

beforeEach(() => {
  Timer.removeAll();
  TestHelpers.setupDomAndGlobals();
});

describe("Timer", () => {
  it("returns 500ms elapsed after 500ms", () => {
    Timer.startNew("t1");
    TestHelpers.sleep(500);
    expect(Timer.elapsed("t1")).toBe(500);
  });

  it("stops after stop is called", () => {
    Timer.startNew("t1");
    TestHelpers.sleep(500);
    Timer.stop("t1");
    TestHelpers.sleep(250);
    expect(Timer.elapsed("t1")).toBe(500);
  });

  it("starts a new timer with the same name as an existing running timer", () => {
    Timer.startNew("t1");
    TestHelpers.sleep(500);
    Timer.startNew("t1");
    TestHelpers.sleep(800);
    expect(Timer.elapsed("t1")).toBe(800);
  });

  it("starts a new timer with the same name as an existing stopped timer", () => {
    Timer.startNew("t1");
    TestHelpers.sleep(500);
    Timer.stop("t1");
    Timer.startNew("t1");
    TestHelpers.sleep(700);
    expect(Timer.elapsed("t1")).toBe(700);
  });

  it("removes a timer and can start a new one with the same name", () => {
    Timer.startNew("t1");
    TestHelpers.sleep(500);
    Timer.remove("t1");
    TestHelpers.sleep(100);
    Timer.startNew("t1");
    TestHelpers.sleep(800);
    expect(Timer.elapsed("t1")).toBe(800);
  });

  it("keeps correct elapsed time after starting and stopping multiple times", () => {
    Timer.startNew("t1");
    TestHelpers.sleep(500);
    Timer.stop("t1");
    TestHelpers.sleep(500);
    Timer.start("t1");
    TestHelpers.sleep(1500);
    Timer.stop("t1");
    Timer.start("t1");
    TestHelpers.sleep(100);
    expect(Timer.elapsed("t1")).toBe(2100);
  });

  it("starts a created timer", () => {
    Timer.new("t1");
    TestHelpers.sleep(500);
    Timer.start("t1");
    TestHelpers.sleep(1500);
    Timer.stop("t1");
    expect(Timer.elapsed("t1")).toBe(1500);
  });

  it("starts and stops created timer multiple times", () => {
    Timer.new("t1");
    TestHelpers.sleep(500);
    Timer.start("t1");
    TestHelpers.sleep(1500);
    Timer.stop("t1");
    TestHelpers.sleep(10);
    Timer.start("t1");
    TestHelpers.sleep(50);
    Timer.stop("t1");
    TestHelpers.sleep(100);
    Timer.start("t1");
    TestHelpers.sleep(200);
    expect(Timer.elapsed("t1")).toBe(1750);
  });

  it("creates but does not start a new timer whose elapsed time is 0", () => {
    Timer.new("t1");
    TestHelpers.sleep(500);
    expect(Timer.elapsed("t1")).toBe(0);
  });

  it("elapsed time of runner timing is same as time when immediately stopped", () => {
    Timer.startNew("t1");
    TestHelpers.sleep(600);
    expect(Timer.elapsed("t1")).toBe(600);
    Timer.stop("t1");
    expect(Timer.elapsed("t1")).toBe(600);
  });

  it("creates a new timer that replaces existing timer with same name", () => {
    Timer.startNew("t1");
    TestHelpers.sleep(500);
    Timer.new("t1");
    expect(Timer.elapsed("t1")).toBe(0);
  });

  it("is true that an existing timer exists", () => {
    Timer.startNew("t1");
    TestHelpers.sleep(500);
    expect(Timer.exists("t1")).toBeTruthy();
  });

  it("is false that a non-existent timer exists", () => {
    TestHelpers.sleep(500);
    expect(Timer.exists("t1")).toBeFalsy();
  });

  it("throws error when getting elapsed time of timer that wasn't created", () => {
    expect(() => {
      Timer.elapsed("t1");
    }).toThrow();
  });

  it("throws error when starting a timer that wasn't created", () => {
    expect(() => {
      Timer.start("t1");
    }).toThrow();
  });

  it("throws error when stopping a timer that wasn't created", () => {
    expect(() => {
      Timer.stop("t1");
    }).toThrow();
  });

  it("throws error when stopping a timer that is already stopped", () => {
    expect(() => {
      Timer.startNew("t1");
      TestHelpers.sleep(500);
      Timer.stop("t1");
      Timer.stop("t1");
    }).toThrow();
  });

  it("throws error when removing a timer that wasn't ever created", () => {
    expect(() => {
      Timer.remove("t1");
    }).toThrow();
  });

  it("throws error when removing a timer more than once", () => {
    Timer.startNew("t1");
    TestHelpers.sleep(500);
    Timer.remove("t1");
    expect(() => {
      Timer.remove("t1");
    }).toThrow();
  });

  it("throws error when starting a timer that is already running", () => {
    Timer.startNew("t1");
    TestHelpers.sleep(500);
    expect(() => {
      Timer.start("t1");
    }).toThrow();
  });

  it("removes a started timer", () => {
    Timer.startNew("t1");
    TestHelpers.sleep(500);
    Timer.remove("t1");
    expect(Timer.exists("t1")).toBeFalsy();
  });

  it("removes a created but not yet started timer", () => {
    Timer.new("t1");
    TestHelpers.sleep(500);
    Timer.remove("t1");
    expect(Timer.exists("t1")).toBeFalsy();
  });

  it("removes a stopped timer", () => {
    Timer.startNew("t1");
    TestHelpers.sleep(500);
    Timer.stop("t1");
    Timer.remove("t1");
    expect(Timer.exists("t1")).toBeFalsy();
  });

  it("removes all timers", () => {
    Timer.startNew("t1");
    Timer.startNew("t2");
    TestHelpers.sleep(500);
    Timer.removeAll();
    expect(Timer.exists("t1")).toBeFalsy();
    expect(Timer.exists("t2")).toBeFalsy();
  });

  it("can call remove all timers even if no timers exist", () => {
    Timer.removeAll();
  });
});
