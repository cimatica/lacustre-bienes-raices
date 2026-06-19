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
