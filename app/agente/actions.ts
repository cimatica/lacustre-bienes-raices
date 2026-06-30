'use server';

import { createClient as createServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

async function isAuthorizedForVisit(visitId: string, userId: string, adminSupabase: any) {
  // Check if user is admin
  const { data: profile } = await adminSupabase.from('user_profiles').select('role').eq('id', userId).single();
  if (profile?.role === 'administrador') return true;

  // Get the property ID for the visit
  const { data: visit } = await adminSupabase.from('visits').select('property_id').eq('id', visitId).single();
  if (!visit) return false;

  // Check if user is assigned to this property
  const { data: assignment } = await adminSupabase
    .from('property_assignments')
    .select('id')
    .eq('property_id', visit.property_id)
    .eq('user_id', userId)
    .single();

  return !!assignment;
}

export async function updateOwnProfile(data: { full_name: string, phone: string, location?: string }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const { error } = await supabase
    .from('user_profiles')
    .update({ full_name: data.full_name, phone: data.phone, location: data.location })
    .eq('id', user.id);

  if (error) {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

  const isAuth = await isAuthorizedForVisit(visitId, user.id, adminSupabase);
  if (!isAuth) return { error: 'No autorizado para modificar esta visita' };

  const { error } = await adminSupabase
    .from('visits')
    .update({ status })
    .eq('id', visitId);

  if (error) return { error: error.message };

  // Fetch visit details to send email
  const { data: visitData } = await adminSupabase
    .from('visits')
    .select('user_profiles(email, full_name), properties(title), visit_date')
    .eq('id', visitId)
    .maybeSingle();

  if (visitData && process.env.RESEND_API_KEY) {
    const userProfiles: any = visitData.user_profiles;
    const propDetails: any = visitData.properties;
    const userEmail = Array.isArray(userProfiles) ? userProfiles[0]?.email : userProfiles?.email;
    const userName = (Array.isArray(userProfiles) ? userProfiles[0]?.full_name : userProfiles?.full_name) || 'Cliente';
    const propTitle = (Array.isArray(propDetails) ? propDetails[0]?.title : propDetails?.title) || 'Propiedad';
    const visitDate = new Date(visitData.visit_date).toLocaleString('es-CL');
    
    let subject = '';
    let html = '';
    if (status === 'completed') {
      subject = `Visita Completada: ${propTitle}`;
      html = `<p>Hola ${userName},</p><p>Tu visita a <strong>${propTitle}</strong> del ${visitDate} ha sido marcada como completada.</p><p>¡Gracias por usar nuestro portal!</p>`;
    } else if (status === 'cancelled') {
      subject = `Visita Cancelada: ${propTitle}`;
      html = `<p>Hola ${userName},</p><p>Lamentamos informarte que tu visita a <strong>${propTitle}</strong> del ${visitDate} ha sido cancelada.</p><p>Por favor contáctanos para más detalles.</p>`;
    }

    if (subject && userEmail) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Lacustre Inmobiliaria <onboarding@resend.dev>',
            to: [userEmail],
            subject: subject,
            html: html
          })
        });
        if (!res.ok) {
          console.error("Error from Resend API:", await res.text());
        }
      } catch(e) {
        console.error("Failed to fetch Resend:", e);
      }
    }
  }

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

  const isAuth = await isAuthorizedForVisit(visitId, user.id, adminSupabase);
  if (!isAuth) return { error: 'No autorizado para modificar esta visita' };

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
    const userProfiles: any = visitData.user_profiles;
    const propDetails: any = visitData.properties;
    const userEmail = Array.isArray(userProfiles) ? userProfiles[0]?.email : userProfiles?.email;
    const userName = Array.isArray(userProfiles) ? userProfiles[0]?.full_name : userProfiles?.full_name;
    const propTitle = Array.isArray(propDetails) ? propDetails[0]?.title : propDetails?.title;
    
    console.log(`\n\n======================================`);
    console.log(`📩 ENVIANDO NOTIFICACIÓN POR EMAIL`);
    console.log(`Para: ${userEmail}`);
    console.log(`Asunto: Visita Reprogramada - ${propTitle}`);
    console.log(`Mensaje: Hola ${userName}, tu visita ha sido reprogramada exitosamente para el ${formattedDate}.`);
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

  const isAuth = await isAuthorizedForVisit(visitId, user.id, adminSupabase);
  if (!isAuth) return { error: 'No autorizado para modificar esta visita' };

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
