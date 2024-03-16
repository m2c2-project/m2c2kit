/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LegacyTimer } from "..";
import { TestHelpers } from "./TestHelpers";

beforeEach(() => {
  LegacyTimer.removeAll();
  TestHelpers.setupDomAndGlobals();
});

describe("LegacyTimer", () => {
  it("returns 500ms elapsed after 500ms", () => {
    LegacyTimer.start("t1");
    TestHelpers.sleep(500);
    expect(LegacyTimer.elapsed("t1")).toBe(500);
  });

  it("stops after stop is called", () => {
    LegacyTimer.start("t1");
    TestHelpers.sleep(500);
    LegacyTimer.stop("t1");
    TestHelpers.sleep(250);
    expect(LegacyTimer.elapsed("t1")).toBe(500);
  });

  it("removes a timer and can start a new one with the same name", () => {
    LegacyTimer.start("t1");
    TestHelpers.sleep(500);
    LegacyTimer.remove("t1");
    TestHelpers.sleep(100);
    LegacyTimer.start("t1");
    TestHelpers.sleep(800);
    expect(LegacyTimer.elapsed("t1")).toBe(800);
  });

  it("keeps correct elapsed time after starting and stopping multiple times", () => {
    LegacyTimer.start("t1");
    TestHelpers.sleep(500);
    LegacyTimer.stop("t1");
    TestHelpers.sleep(500);
    LegacyTimer.start("t1");
    TestHelpers.sleep(1500);
    LegacyTimer.stop("t1");
    expect(LegacyTimer.elapsed("t1")).toBe(2000);
  });

  it("restarts a running timer", () => {
    LegacyTimer.start("t1");
    TestHelpers.sleep(500);
    LegacyTimer.restart("t1");
    TestHelpers.sleep(1500);
    LegacyTimer.stop("t1");
    expect(LegacyTimer.elapsed("t1")).toBe(1500);
  });

  it("restarts a stopped timer", () => {
    LegacyTimer.start("t1");
    TestHelpers.sleep(500);
    LegacyTimer.stop("t1");
    LegacyTimer.restart("t1");
    TestHelpers.sleep(750);
    LegacyTimer.stop("t1");
    expect(LegacyTimer.elapsed("t1")).toBe(750);
  });

  it("is true that an existing timer exists", () => {
    LegacyTimer.start("t1");
    TestHelpers.sleep(500);
    expect(LegacyTimer.exists("t1")).toBeTruthy();
  });

  it("is false that a non-existent timer exists", () => {
    TestHelpers.sleep(500);
    expect(LegacyTimer.exists("t1")).toBeFalsy();
  });

  it("throws error when getting elapsed time of timer that wasn't started", () => {
    expect(() => {
      LegacyTimer.elapsed("t1");
    }).toThrow();
  });

  it("throws error when restarting a timer that wasn't ever started", () => {
    expect(() => {
      LegacyTimer.restart("t1");
    }).toThrow();
  });

  it("throws error when stopping a timer that wasn't started", () => {
    expect(() => {
      LegacyTimer.stop("t1");
    }).toThrow();
  });

  it("throws error when stopping a timer that is already stopped", () => {
    expect(() => {
      LegacyTimer.start("t1");
      TestHelpers.sleep(500);
      LegacyTimer.stop("t1");
      LegacyTimer.stop("t1");
    }).toThrow();
  });

  it("throws error when removing a timer that wasn't ever started", () => {
    expect(() => {
      LegacyTimer.remove("t1");
    }).toThrow();
  });

  it("throws error when removing a timer more than once", () => {
    LegacyTimer.start("t1");
    TestHelpers.sleep(500);
    LegacyTimer.remove("t1");
    expect(() => {
      LegacyTimer.remove("t1");
    }).toThrow();
  });

  it("throws error when starting a timer that is already running", () => {
    LegacyTimer.start("t1");
    TestHelpers.sleep(500);
    expect(() => {
      LegacyTimer.start("t1");
    }).toThrow();
  });

  it("removes a started timer", () => {
    LegacyTimer.start("t1");
    TestHelpers.sleep(500);
    LegacyTimer.remove("t1");
    expect(LegacyTimer.exists("t1")).toBeFalsy();
  });

  it("removes a stopped timer", () => {
    LegacyTimer.start("t1");
    TestHelpers.sleep(500);
    LegacyTimer.stop("t1");
    LegacyTimer.remove("t1");
    expect(LegacyTimer.exists("t1")).toBeFalsy();
  });

  it("removes all timers", () => {
    LegacyTimer.start("t1");
    LegacyTimer.start("t2");
    TestHelpers.sleep(500);
    LegacyTimer.removeAll();
    expect(LegacyTimer.exists("t1")).toBeFalsy();
    expect(LegacyTimer.exists("t2")).toBeFalsy();
  });

  it("can call remove all timers even if no timers exist", () => {
    LegacyTimer.removeAll();
  });
});
