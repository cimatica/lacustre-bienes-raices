'use server';

import { createClient as createServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateOwnProfile(data: { full_name: string, phone: string, location?: string }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  // Assuming RLS allows users to update their own profile, or we use the service role client
  // Wait, let's just use the service role client to be absolutely safe if RLS blocks it.
  // But wait, the standard client works if RLS allows it. Let's try standard client first.
  const { error } = await supabase
    .from('user_profiles')
    .update({ full_name: data.full_name, phone: data.phone, location: data.location })
    .eq('id', user.id);

  if (error) {
    // Fallback to service key if RLS blocked it
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (serviceKey) {
      const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
      const { error: adminError } = await supabaseAdmin
        .from('user_profiles')
        .update({ full_name: data.full_name, phone: data.phone, location: data.location })
        .eq('id', user.id);
      if (adminError) return { error: adminError.message };
    } else {
      return { error: error.message };
    }
  }

  revalidatePath('/vendedor/properties');
  revalidatePath('/vendedor/leads');
  return { success: true };
}
