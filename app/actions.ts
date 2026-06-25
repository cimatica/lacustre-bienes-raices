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

export async function scheduleVisitAction(propertyId: string, visitDate: string, message?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from('visits').insert({
    user_id: user.id,
    property_id: propertyId,
    visit_date: visitDate,
    status: 'scheduled',
    message: message || ''
  });

  if (!error) {
    revalidatePath('/', 'layout');
    return true;
  }
  return false;
}
