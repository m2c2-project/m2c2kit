import { Futurable } from "../Futurable";

describe("Futurable", () => {
  it("updates dependent Futurable", () => {
    const futurable1 = new Futurable();
    const futurable2 = new Futurable(3);
    futurable2.add(futurable1);
    expect(futurable1.value).toBe(Infinity);
    futurable1.assign(2);
    expect(futurable2.value).toBe(5);
    futurable1.assign(Infinity);
    expect(futurable2.value).toBe(Infinity);
  });

  it("adds numbers", () => {
    const futurable = new Futurable(1);
    futurable.add(2);
    expect(futurable.value).toBe(3);
  });

  it("adds Futurables", () => {
    const futurable = new Futurable(1);
    futurable.add(new Futurable(2));
    expect(futurable.value).toBe(3);
  });

  it("subtracts numbers", () => {
    const futurable = new Futurable(3);
    futurable.subtract(2);
    expect(futurable.value).toBe(1);
  });

  it("subtracts Futurables", () => {
    const futurable = new Futurable(3);
    futurable.subtract(new Futurable(2));
    expect(futurable.value).toBe(1);
  });

  it("assigns numbers", () => {
    const futurable = new Futurable();
    futurable.assign(1);
    expect(futurable.value).toBe(1);
  });

  it("assigns Futurables", () => {
    const futurable = new Futurable(new Futurable(1));
    expect(futurable.value).toBe(1);
  });

  it("constructs with a number", () => {
    const futurable = new Futurable(1);
    expect(futurable.value).toBe(1);
  });

  it("constructs with a Futurable", () => {
    const futurable = new Futurable(new Futurable(1));
    expect(futurable.value).toBe(1);
  });

  it("constructs with no arguments", () => {
    const futurable = new Futurable();
    expect(futurable.value).toBe(Infinity);
  });

  it("throws an error when an expression involves itself", () => {
    const futurable = new Futurable();
    expect(() => futurable.add(futurable)).toThrow();
  });

  it("warns to console when expression is long", () => {
    const warnSpy = jest.spyOn(global.console, "warn");
    const futurable = new Futurable(1);
    for (let i = 0; i < 40; i++) {
      futurable.add(1);
    }
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
