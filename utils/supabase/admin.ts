import { createClient } from '@supabase/supabase-js';

// Admin client to bypass RLS for fetching data across users (like agents viewing leads/visits)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
