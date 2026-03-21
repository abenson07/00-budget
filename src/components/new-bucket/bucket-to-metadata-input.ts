import type { BucketMetadataInput } from "@/lib/bucket-metadata";
import type { Bucket } from "@/lib/types";

/** Maps a persisted-shape bucket to metadata validation input. */
export function bucketToMetadataInput(b: Bucket): BucketMetadataInput {
  if (b.type === "essential" && b.essential_subtype === "bill") {
    return {
      name: b.name,
      order: b.order,
      type: "essential",
      essential_subtype: "bill",
      due_date: b.due_date,
      alert_date: b.alert_date,
      top_off: b.top_off,
      percentage: b.percentage,
      goal_target_date: "",
    };
  }
  if (b.type === "essential") {
    return {
      name: b.name,
      order: b.order,
      type: "essential",
      essential_subtype: "essential_spending",
      due_date: "",
      alert_date: "",
      top_off: b.top_off,
      percentage: b.percentage,
      goal_target_date: "",
    };
  }
  return {
    name: b.name,
    order: b.order,
    type: "discretionary",
    essential_subtype: "essential_spending",
    due_date: "",
    alert_date: "",
    top_off: b.top_off,
    percentage: b.percentage,
    goal_target_date: b.goal_target_date ?? "",
  };
}
