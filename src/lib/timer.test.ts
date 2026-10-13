import { describe, expect, it } from "vitest";
import { formatElapsed } from "./timer.js";

describe("formatElapsed", () => {
  it("formats minutes and seconds", () => {
    expect(formatElapsed(0)).toBe("00:00");
    expect(formatElapsed(999)).toBe("00:00");
    expect(formatElapsed(61_000)).toBe("01:01");
    expect(formatElapsed(59 * 60_000 + 59_000)).toBe("59:59");
  });

  it("adds hours once an hour has passed", () => {
    expect(formatElapsed(3_600_000)).toBe("01:00:00");
    expect(formatElapsed(3_600_000 * 11 + 125_000)).toBe("11:02:05");
  });
});
