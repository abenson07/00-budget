import { createBrowserClient } from "@supabase/ssr";
import { resolveSupabasePublishableKey } from "@/utils/supabase/publishable-key";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = resolveSupabasePublishableKey();

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or a publishable key (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};
