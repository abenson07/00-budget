import { describe, expect, it } from "vitest";
import { swapOrderWithNeighbor } from "./discretionary-priority";
import type { Bucket } from "./types";

function discBucket(id: string, order: number): Bucket {
  return {
    id,
    name: `Bucket ${id}`,
    order,
    amount: 0,
    top_off: null,
    percentage: null,
    type: "discretionary",
    goal_target_date: null,
    locked: false,
  };
}

describe("swapOrderWithNeighbor", () => {
  it("swaps order values with the previous item", () => {
    const buckets = [discBucket("a", 0), discBucket("b", 10), discBucket("c", 20)];
    const result = swapOrderWithNeighbor(buckets, "b", "up");
    expect(result).toEqual([
      { id: "b", order: 0 },
      { id: "a", order: 10 },
    ]);
  });

  it("returns null when already first", () => {
    const buckets = [discBucket("a", 0), discBucket("b", 10), discBucket("c", 20)];
    const result = swapOrderWithNeighbor(buckets, "a", "up");
    expect(result).toBeNull();
  });
});
