'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

function extractPathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const parts = url.split('/property_images/');
  return parts.length > 1 ? parts[1] : null;
}

export async function togglePropertyStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('properties')
    .update({ is_active: !currentStatus })
    .eq('id', id);

  if (error) {
    console.error("Error toggling property status:", error);
    throw new Error('No se pudo actualizar el estado de la propiedad.');
  }

  revalidatePath('/admin/properties');
  revalidatePath('/'); // Revalidate public pages
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();
  
  // 1. Obtener la propiedad y sus imágenes asociadas para borrar del Storage
  const { data: property, error: fetchError } = await supabase
    .from('properties')
    .select('image_url, property_images(image_url)')
    .eq('id', id)
    .single();
    
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
  
  // Get role type id
  const { data: roleType } = await supabase
    .from('role_types')
    .select('id')
    .eq('name', roleTypeName)
    .single();

  if (!roleType) {
    throw new Error('Rol no válido');
  }

  const { error } = await supabase
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
  
  const { data: roleType } = await supabase
    .from('role_types')
    .select('id')
    .eq('name', roleTypeName)
    .single();

  if (!roleType) return;

  await supabase
    .from('property_assignments')
    .delete()
    .eq('property_id', propertyId)
    .eq('role_type_id', roleType.id);

  revalidatePath('/admin/properties');
}
