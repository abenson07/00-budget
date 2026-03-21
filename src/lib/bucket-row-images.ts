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
