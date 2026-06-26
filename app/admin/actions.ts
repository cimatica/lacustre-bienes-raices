'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function extractPathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const parts = url.split('/property_images/');
  return parts.length > 1 ? parts[1] : null;
}

export async function togglePropertyStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Verificamos permisos manualmente antes de usar adminSupabase
  const { data: roleData } = await supabase.from('user_roles').select('role_types(name)').eq('id', user.id).maybeSingle();
  const isAdmin = roleData?.role_types?.name === 'administrador';

  let hasPermission = isAdmin;
  if (!hasPermission) {
    // Si no es admin, revisamos si está asignado a esta propiedad
    const { data: assignments } = await supabase
      .from('property_assignments')
      .select('id')
      .eq('property_id', id)
      .eq('user_id', user.id);
    if (assignments && assignments.length > 0) {
      hasPermission = true;
    }
  }

  if (!hasPermission) {
    return { error: "No tienes permisos para modificar esta propiedad." };
  }

  const { createAdminClient } = await import('@/utils/supabase/admin');
  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from('properties')
    .update({ is_active: !currentStatus })
    .eq('id', id);

  if (error) {
    console.error("Error toggling property status:", error);
    return { error: error.message };
  }

  revalidatePath('/admin/properties');
  revalidatePath('/vendedor/properties');
  revalidatePath('/agente/properties');
  revalidatePath('/');
  return { success: true };
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role_types(name)')
      .eq('id', user.id)
      .maybeSingle();
    if (roleData?.role_types?.name === 'vendedor') {
      throw new Error('Los vendedores no tienen permiso para eliminar propiedades.');
    }
  }


  // 1. Obtener la propiedad y sus imágenes asociadas para borrar del Storage
  const { data: property, error: fetchError } = await supabase
    .from('properties')
    .select('image_url, property_images(image_url)')
    .eq('id', id)
    .maybeSingle();
    
  if (fetchError) {
    console.error("Error fetching property for deletion:", fetchError);
    throw new Error('Error al buscar la propiedad para eliminar.');
  }

  // 2. Extraer rutas de imágenes del bucket
  const pathsToDelete: string[] = [];
  
  const mainImagePath = extractPathFromUrl(property?.image_url);
  if (mainImagePath) pathsToDelete.push(mainImagePath);

  if (property?.property_images && property.property_images.length > 0) {
    for (const img of property.property_images) {
      const galleryPath = extractPathFromUrl(img.image_url);
      if (galleryPath) pathsToDelete.push(galleryPath);
    }
  }

  // 3. Eliminar archivos de Supabase Storage
  if (pathsToDelete.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('property_images')
      .remove(pathsToDelete);
      
    if (storageError) {
      console.error("Error deleting images from storage:", storageError);
      // No lanzamos error aquí para permitir que la propiedad se borre de la BD incluso si fallan algunas imágenes huérfanas
    }
  }

  // 4. Eliminar el registro de la base de datos (ON DELETE CASCADE borrará de property_images automáticamente)
  const { error: deleteError } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error("Error deleting property from DB:", deleteError);
    throw new Error('No se pudo eliminar la propiedad de la base de datos.');
  }

  revalidatePath('/admin/properties');
  revalidatePath('/'); // Revalidate public pages
}

export async function updateCommercialStatus(id: string, statusId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('properties')
    .update({ commercial_status_id: statusId })
    .eq('id', id);

  if (error) {
    console.error("Error updating commercial status:", error);
    throw new Error('No se pudo actualizar la situación comercial de la propiedad.');
  }

  revalidatePath('/admin/properties');
  revalidatePath(`/admin/properties/${id}`);
}

export async function assignPropertyUser(propertyId: string, userId: string, roleTypeName: 'vendedor' | 'agente') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: callerRoleData } = await supabase.from('user_roles').select('role_types(name)').eq('id', user.id).maybeSingle();
  const callerRole = callerRoleData?.role_types?.name;

  if (callerRole !== 'administrador' && callerRole !== 'vendedor') {
    throw new Error('No autorizado para asignar usuarios');
  }

  if (callerRole === 'vendedor' && roleTypeName === 'vendedor' && userId !== user.id) {
    throw new Error('Los vendedores solo pueden asignarse a sí mismos');
  }

  const { createAdminClient } = await import('@/utils/supabase/admin');
  const adminSupabase = createAdminClient();
  
  // Get role type id
  const { data: roleType } = await adminSupabase
    .from('role_types')
    .select('id')
    .eq('name', roleTypeName)
    .maybeSingle();

  if (!roleType) {
    throw new Error('Rol no válido');
  }

  const { error } = await adminSupabase
    .from('property_assignments')
    .upsert({
      property_id: propertyId,
      user_id: userId,
      role_type_id: roleType.id
    }, { onConflict: 'property_id, role_type_id' });

  if (error) {
    console.error("Error assigning user to property:", error);
    throw new Error('No se pudo asignar el usuario a la propiedad.');
  }

  revalidatePath('/admin/properties');
}

export async function unassignPropertyUser(propertyId: string, roleTypeName: 'vendedor' | 'agente') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: callerRoleData } = await supabase.from('user_roles').select('role_types(name)').eq('id', user.id).maybeSingle();
  const callerRole = callerRoleData?.role_types?.name;

  if (callerRole !== 'administrador' && callerRole !== 'vendedor') {
    throw new Error('No autorizado para desasignar usuarios');
  }

  const { createAdminClient } = await import('@/utils/supabase/admin');
  const adminSupabase = createAdminClient();
  
  const { data: roleType } = await adminSupabase
    .from('role_types')
    .select('id')
    .eq('name', roleTypeName)
    .maybeSingle();

  if (!roleType) return;

  await adminSupabase
    .from('property_assignments')
    .delete()
    .eq('property_id', propertyId)
    .eq('role_type_id', roleType.id);

  revalidatePath('/admin/properties');
}

export async function getAvailablePersonnel() {
  // Use service role key to bypass RLS so Vendedores can see all Agents/Sellers
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseKey);

  const { data: roleUsers } = await supabaseAdmin
    .from('user_roles')
    .select('user_profiles(id, full_name), role_types(name)');
  
  if (!roleUsers) return { sellers: [], agents: [] };

  const sellers = roleUsers
    .filter((ru: any) => ru.role_types?.name === 'vendedor')
    .map((ru: any) => ({ id: ru.user_profiles.id, name: ru.user_profiles.full_name }));
  const agents = roleUsers
    .filter((ru: any) => ru.role_types?.name === 'agente')
    .map((ru: any) => ({ id: ru.user_profiles.id, name: ru.user_profiles.full_name }));

  return { sellers, agents };
}
