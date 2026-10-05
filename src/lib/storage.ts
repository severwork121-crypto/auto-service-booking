import { supabase } from './supabase';

const BUCKET = 'tenant-assets';
const MAX_SIZE = 5 * 1024 * 1024;

export async function uploadTenantImage(
  slug: string,
  file: File,
  kind: 'hero' | 'logo' | 'gallery'
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Файл должен быть изображением');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('Файл больше 5 МБ');
  }

  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    throw new Error('Вы не авторизованы. Войдите заново.');
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${slug}/${kind}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true,
      cacheControl: '31536000',
      contentType: file.type,
    });

  if (error) throw new Error(`Storage: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}