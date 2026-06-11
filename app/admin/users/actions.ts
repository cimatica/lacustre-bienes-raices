'use server';

import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createServerClient();
  
  // Verify current user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!roleData || roleData.role !== 'administrador') {
    return { error: 'No autorizado' };
  }

  // Update role
  const { error } = await supabase
    .from('user_roles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function createUserByAdmin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const role = formData.get('role') as string;

  if (!email || !password || !fullName || !role) {
    return { error: 'Todos los campos son requeridos' };
  }

  const supabaseServer = await createServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const { data: roleData } = await supabaseServer
    .from('user_roles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!roleData || roleData.role !== 'administrador') {
    return { error: 'No autorizado' };
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return { error: 'Falta la clave SUPABASE_SERVICE_ROLE_KEY en el servidor' };
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (authError) {
    return { error: authError.message };
  }

  // Trigger inserta 'usuario' por defecto, actualizamos con rol real y nombre.
  if (authData?.user) {
    const { error: updateError } = await supabaseAdmin
      .from('user_roles')
      .update({ 
        role: role,
        full_name: fullName
      })
      .eq('id', authData.user.id);

    if (updateError) {
      return { error: 'Usuario creado pero falló al asignar detalles: ' + updateError.message };
    }
  }

  revalidatePath('/admin/users');
  return { success: true };
}
