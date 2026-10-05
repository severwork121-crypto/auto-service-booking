import { supabase } from './supabase';

const BUCKET = 'tenant-assets';
const MAX_SIZE = 5 * 1024 * 1024;

export async function uploadTenantImage(
  slug: string,
  file: File,
  kind: 'hero' | 'logo'
): Promise<string> {
  console.log('[upload] начало', { slug, kind, size: file.size, type: file.type });

  if (!file.type.startsWith('image/')) {
    throw new Error('Файл должен быть изображением');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('Файл больше 5 МБ');
  }

  // Проверяем, что есть сессия
  const { data: session } = await supabase.auth.getSession();
  console.log('[upload] сессия:', !!session.session, 'user:', session.session?.user?.email);
  if (!session.session) {
    throw new Error('Вы не авторизованы. Войдите заново.');
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${slug}/${kind}-${Date.now()}.${ext}`;
  console.log('[upload] путь:', path);

  const { error, data } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true,
      cacheControl: '31536000',
      contentType: file.type,
    });

  console.log('[upload] результат:', { error, data });

  if (error) {
    throw new Error(`Storage: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  console.log('[upload] публичный URL:', urlData.publicUrl);

  return urlData.publicUrl;
}