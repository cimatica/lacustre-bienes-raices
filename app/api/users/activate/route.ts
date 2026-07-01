import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getRelation } from '@/utils/getRelation';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Validate Admin Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role_types(name)')
      .eq('id', user.id)
      .maybeSingle();

    if (!roleData || !roleData.role_types || getRelation(roleData.role_types)?.name !== 'administrador') {
      return NextResponse.json({ error: 'Acceso denegado: Se requiere rol de administrador' }, { status: 403 });
    }

    // 2. Read Request Body
    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Falta el ID del usuario' }, { status: 400 });
    }

    // 3. Update User Status to Active
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({ status: 'Active' })
      .eq('id', targetUserId)
      .select('email, full_name')
      .maybeSingle();

    if (updateError || !updatedProfile) {
      return NextResponse.json({ error: 'Error al actualizar el estado del usuario' }, { status: 500 });
    }

    // 4. Send Email via Resend REST API (No npm package needed)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY no está configurada. El usuario fue activado pero no se envió el correo.");
      return NextResponse.json({ success: true, warning: 'Usuario activado, pero falta configurar RESEND_API_KEY para enviar el correo.' });
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Lacustre Bienes Raíces <onboarding@resend.dev>', // Change to verified domain later
        to: updatedProfile.email,
        subject: '¡Tu cuenta ha sido activada!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #006655;">¡Bienvenido a Lacustre Bienes Raíces!</h2>
            <p>Hola ${updatedProfile.full_name || 'Usuario'},</p>
            <p>Nos complace informarte que tu cuenta ha sido <strong>revisada y activada</strong> por un administrador.</p>
            <p>Ya puedes iniciar sesión en la plataforma y acceder a todas las funcionalidades.</p>
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login" style="background-color: #006655; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Iniciar Sesión Ahora</a>
            </div>
            <p style="margin-top: 40px; font-size: 12px; color: #666;">
              Si tienes alguna duda, responde a este correo.
            </p>
          </div>
        `
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Error enviando correo con Resend:", errorData);
      return NextResponse.json({ success: true, warning: 'Usuario activado, pero el envío del correo falló. Revisa la consola.' });
    }

    return NextResponse.json({ success: true, message: 'Usuario activado y correo enviado con éxito.' });
  } catch (error: any) {
    console.error("Error in activate route:", error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
