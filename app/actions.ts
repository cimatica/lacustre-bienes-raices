'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleFavoriteAction(propertyId: string, isCurrentlyFavorite: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  if (isCurrentlyFavorite) {
    const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('property_id', propertyId);
    if (!error) {
      revalidatePath('/', 'layout');
      return true;
    }
  } else {
    const { error } = await supabase.from('favorites').insert({ user_id: user.id, property_id: propertyId });
    if (!error) {
      revalidatePath('/', 'layout');
      return true;
    }
  }
  return false;
}

import { headers } from 'next/headers';

export async function scheduleVisitAction(propertyId: string, visitDate: string, message?: string, turnstileToken?: string) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || '127.0.0.1';

  // 1. Verify Turnstile
  if (!turnstileToken) return { success: false, error: 'Validación de seguridad requerida (Anti-Spam)' };
  
  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}&remoteip=${ip}`
  });
  const verifyData = await verifyRes.json();
  if (!verifyData.success) {
    return { success: false, error: 'Validación de seguridad fallida' };
  }

  const supabase = await createClient();

  // 2. Check Rate Limit (max 5 per day)
  const { count } = await supabase.from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .eq('action', 'schedule_visit')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  
  if (count && count >= 5) {
    return { success: false, error: 'Has alcanzado el límite de visitas diarias permitidas.' };
  }
  
  await supabase.from('rate_limits').insert({ ip_address: ip, action: 'schedule_visit' });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Debes iniciar sesión' };

  // 3. Insert visit
  const { error } = await supabase.from('visits').insert({
    user_id: user.id,
    property_id: propertyId,
    visit_date: visitDate,
    status: 'scheduled',
    message: message || ''
  });

  if (error) return { success: false, error: 'Error al agendar visita en la base de datos' };

  // 4. Send Emails via Resend (Client & Agent)
  const { data: propData } = await supabase.from('properties')
     .select('title, property_assignments(user_id, user_profiles(email, full_name), role_types(name))')
     .eq('id', propertyId)
     .single();
  
  if (propData && process.env.RESEND_API_KEY) {
     const agentAssignment = propData.property_assignments?.find((a:any) => a.role_types?.name === 'agente');
     const agentEmail = agentAssignment?.user_profiles?.email;
     const userEmail = user.email;

     try {
       const visitDateLocal = new Date(visitDate).toLocaleString('es-CL');
       // Correo al cliente
       const res1 = await fetch('https://api.resend.com/emails', {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
         body: JSON.stringify({
           from: 'Lacustre Inmobiliaria <onboarding@resend.dev>',
           to: [userEmail],
           subject: `Visita Agendada: ${propData.title}`,
           html: `<p>Hola,</p><p>Tu visita a <strong>${propData.title}</strong> ha sido agendada exitosamente para el <strong>${visitDateLocal}</strong>.</p><p>Pronto un agente se pondrá en contacto contigo para confirmar los detalles.</p>`
         })
       });
       if (!res1.ok) console.error("Resend API Error (Client):", await res1.text());

       // Correo al Agente (si existe)
       if (agentEmail) {
         const res2 = await fetch('https://api.resend.com/emails', {
           method: 'POST',
           headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
           body: JSON.stringify({
             from: 'Lacustre Inmobiliaria <onboarding@resend.dev>',
             to: [agentEmail],
             subject: `Nueva Visita Asignada: ${propData.title}`,
             html: `<p>Hola,</p><p>Tienes una nueva visita agendada para <strong>${propData.title}</strong> el <strong>${visitDateLocal}</strong>.</p><p>Mensaje del cliente: <em>${message || 'Sin mensaje'}</em></p>`
           })
         });
         if (!res2.ok) console.error("Resend API Error (Agent):", await res2.text());
       }
     } catch (e) {
       console.error("Error enviando emails con Resend", e);
     }
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
