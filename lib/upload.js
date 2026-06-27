import { supabase } from '@/lib/supabase';

export async function uploadImage(file, userId, folder = 'uploads') {
  if (!file) return null;
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
  const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}
