/**
 * Supabase “anon” / publishable client key. Dashboards may expose this as
 * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (new) or `NEXT_PUBLIC_SUPABASE_ANON_KEY` (common in docs).
 */
export function resolveSupabasePublishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
