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
    .select('role_types(name)')
    .eq('id', user.id)
    .maybeSingle();

  const roleTypes: any = roleData?.role_types;
  const roleName = roleTypes ? (Array.isArray(roleTypes) ? roleTypes[0]?.name : roleTypes?.name) : null;
  if (!roleName || roleName !== 'administrador') {
    return { error: 'No autorizado' };
  }

  // Get new role id
  const { data: newRoleData } = await supabase
    .from('role_types')
    .select('id')
    .eq('name', newRole)
    .maybeSingle();

  if (!newRoleData) {
    return { error: 'Rol no válido' };
  }

  // Validate if user has assigned properties
  const { count: assignmentCount } = await supabase
    .from('property_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (assignmentCount && assignmentCount > 0) {
    return { error: 'No se puede cambiar el rol porque el usuario tiene propiedades asignadas.' };
  }

  // Update role
  const { error } = await supabase
    .from('user_roles')
    .update({ role_id: newRoleData.id })
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
    .select('role_types(name)')
    .eq('id', user.id)
    .maybeSingle();

  const roleTypes: any = roleData?.role_types;
  const roleName = roleTypes ? (Array.isArray(roleTypes) ? roleTypes[0]?.name : roleTypes?.name) : null;
  if (!roleName || roleName !== 'administrador') {
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

  // Trigger inserts into user_profiles usually, we update it
  if (authData?.user) {
    // 1. Update user_profiles
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({ 
        id: authData.user.id,
        email: email,
        full_name: fullName
      });

    // 2. Assign role_id
    const { data: roleType } = await supabaseAdmin
      .from('role_types')
      .select('id')
      .eq('name', role)
      .maybeSingle();

    if (roleType) {
      const { error: updateError } = await supabaseAdmin
        .from('user_roles')
        .upsert({ 
          id: authData.user.id,
          role_id: roleType.id
        });

      if (updateError) {
        return { error: 'Usuario creado pero falló al asignar rol: ' + updateError.message };
      }
    }
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function deleteUserByAdmin(userId: string) {
  const supabaseServer = await createServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const { data: roleData } = await supabaseServer
    .from('user_roles')
    .select('role_types(name)')
    .eq('id', user.id)
    .maybeSingle();

  const roleTypes: any = roleData?.role_types;
  const roleName = roleTypes ? (Array.isArray(roleTypes) ? roleTypes[0]?.name : roleTypes?.name) : null;
  if (!roleName || roleName !== 'administrador') {
    return { error: 'No autorizado' };
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return { error: 'Falta clave maestra' };

  const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateUserProfile(userId: string, data: { full_name: string, phone: string }) {
  const supabaseServer = await createServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const { data: roleData } = await supabaseServer
    .from('user_roles')
    .select('role_types(name)')
    .eq('id', user.id)
    .maybeSingle();

  const roleTypes: any = roleData?.role_types;
  const roleName = roleTypes ? (Array.isArray(roleTypes) ? roleTypes[0]?.name : roleTypes?.name) : null;
  if (!roleName || roleName !== 'administrador') {
    return { error: 'No autorizado' };
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return { error: 'Falta clave maestra' };

  const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({ full_name: data.full_name, phone: data.phone })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateUserStatus(userId: string, status: string) {
  const supabaseServer = await createServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const { data: roleData } = await supabaseServer
    .from('user_roles')
    .select('role_types(name)')
    .eq('id', user.id)
    .maybeSingle();

  const roleTypes: any = roleData?.role_types;
  const roleName = roleTypes ? (Array.isArray(roleTypes) ? roleTypes[0]?.name : roleTypes?.name) : null;
  if (!roleName || roleName !== 'administrador') {
    return { error: 'No autorizado' };
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return { error: 'Falta clave maestra' };

  const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({ status: status })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}
