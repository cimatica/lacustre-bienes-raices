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

  const { createAdminClient } = await import('@/utils/supabase/admin');
  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from('visits')
    .update({ status })
    .eq('id', visitId);

  if (error) return { error: error.message };

  revalidatePath('/agente/visits');
  revalidatePath('/agente');
  revalidatePath('/vendedor/visits');
  revalidatePath('/vendedor');
  revalidatePath('/perfil');
  return { success: true };
}

export async function rescheduleVisit(visitId: string, newDate: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const { createAdminClient } = await import('@/utils/supabase/admin');
  const adminSupabase = createAdminClient();

  // Get visit details for the email notification mock
  const { data: visitData } = await adminSupabase
    .from('visits')
    .select('user_profiles(full_name, email), properties(title)')
    .eq('id', visitId)
    .maybeSingle();

  const { error } = await adminSupabase
    .from('visits')
    .update({ visit_date: newDate, status: 'scheduled' })
    .eq('id', visitId);

  if (error) return { error: error.message };

  // Simulated Email Notification
  if (visitData) {
    const formattedDate = new Date(newDate).toLocaleString('es-CL', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    console.log(`\n\n======================================`);
    console.log(`📩 ENVIANDO NOTIFICACIÓN POR EMAIL`);
    console.log(`Para: ${visitData.user_profiles?.email}`);
    console.log(`Asunto: Visita Reprogramada - ${visitData.properties?.title}`);
    console.log(`Mensaje: Hola ${visitData.user_profiles?.full_name}, tu visita ha sido reprogramada exitosamente para el ${formattedDate}.`);
    console.log(`======================================\n\n`);
  }

  revalidatePath('/agente/visits');
  revalidatePath('/agente');
  revalidatePath('/vendedor/visits');
  revalidatePath('/vendedor');
  revalidatePath('/perfil');
  return { success: true };
}

export async function deleteVisit(visitId: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const { createAdminClient } = await import('@/utils/supabase/admin');
  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from('visits')
    .delete()
    .eq('id', visitId);

  if (error) return { error: error.message };

  revalidatePath('/agente/visits');
  revalidatePath('/agente');
  revalidatePath('/vendedor/visits');
  revalidatePath('/vendedor');
  revalidatePath('/perfil');
  return { success: true };
}
