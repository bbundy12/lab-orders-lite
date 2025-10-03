import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
  });

  it("applies tailwind merge precedence", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
