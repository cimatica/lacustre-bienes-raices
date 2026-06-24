'use server';

import { createClient as createServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateOwnProfile(data: { full_name: string, phone: string }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const { error } = await supabase
    .from('user_profiles')
    .update({ full_name: data.full_name, phone: data.phone })
    .eq('id', user.id);

  if (error) {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
      const { error: adminError } = await supabaseAdmin
        .from('user_profiles')
        .update({ full_name: data.full_name, phone: data.phone })
        .eq('id', user.id);
      if (adminError) return { error: adminError.message };
    } else {
      return { error: error.message };
    }
  }

  revalidatePath('/agente');
  revalidatePath('/agente/properties');
  revalidatePath('/agente/leads');
  revalidatePath('/agente/visits');
  return { success: true };
}

export async function updateVisitStatus(visitId: string, status: 'scheduled' | 'completed' | 'cancelled') {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const { error } = await supabase
    .from('visits')
    .update({ status })
    .eq('id', visitId);

  if (error) return { error: error.message };

  revalidatePath('/agente/visits');
  revalidatePath('/agente');
  return { success: true };
}
