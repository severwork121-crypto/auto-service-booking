import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  timezone: string;
  working_hours: Record<string, { start: string; end: string } | null>;
  logo_url: string | null;
  hero_image_url: string | null;
}

export async function fetchTenantBySlug(slug: string): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function useTenant(slug: string) {
  return useQuery({
    queryKey: ['tenant', slug],
    queryFn: () => fetchTenantBySlug(slug),
    enabled: !!slug,
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Tenant> & { id: string }) => {
      const { id, ...rest } = patch;
      const { data, error } = await supabase
        .from('tenants')
        .update(rest)
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('RLS: обновление отклонено');
      }
      return data[0];
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant'] });
    },
    onError: (err) => {
      alert('Не удалось сохранить: ' + (err as Error).message);
    },
  });
}