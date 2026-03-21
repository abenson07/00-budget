/** Unsplash stills for discretionary row art (varied per bucket id). */
const DISCRETIONARY_IMAGES = [
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=720&q=80",
] as const;

export function discretionaryImageForBucketId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return DISCRETIONARY_IMAGES[h % DISCRETIONARY_IMAGES.length];
}

/** Cover art for the aggregated essentials row on the buckets list. */
export const ESSENTIALS_LIST_IMAGE =
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=720&q=80";

const ESSENTIAL_ROW_IMAGES = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=720&q=80",
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=720&q=80",
] as const;

export function essentialImageForBucketId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return ESSENTIAL_ROW_IMAGES[h % ESSENTIAL_ROW_IMAGES.length];
}
