import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface GalleryItem {
  id: string;
  tenant_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

export function useGallery(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['gallery', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('tenant_id', tenantId!)
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });
      if (error) throw error;
      return data as GalleryItem[];
    },
    enabled: !!tenantId,
  });
}

export function useAddGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tenant_id,
      image_url,
      caption,
      sort_order,
    }: {
      tenant_id: string;
      image_url: string;
      caption: string | null;
      sort_order: number;
    }) => {
      const { data, error } = await supabase
        .from('gallery')
        .insert({ tenant_id, image_url, caption, sort_order })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery'] });
    },
    onError: (err) => {
      alert('Не удалось добавить работу: ' + (err as Error).message);
    },
  });
}

export function useUpdateGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, image_url }: { id: string; image_url: string }) => {
      const { data, error } = await supabase
        .from('gallery')
        .update({ image_url })
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('RLS: обновление отклонено');
      return data[0];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery'] });
    },
    onError: (err) => {
      alert('Не удалось заменить фото: ' + (err as Error).message);
    },
  });
}

export function useUpdateGalleryCaption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, caption }: { id: string; caption: string | null }) => {
      const { data, error } = await supabase
        .from('gallery')
        .update({ caption })
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('RLS: обновление отклонено');
      return data[0];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery'] });
    },
    onError: (err) => {
      alert('Не удалось сохранить подпись: ' + (err as Error).message);
    },
  });
}

export function useDeleteGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery'] });
    },
    onError: (err) => {
      alert('Не удалось удалить: ' + (err as Error).message);
    },
  });
}