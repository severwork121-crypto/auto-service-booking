import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  price: number;
  duration_minutes: number;
  prep_time_minutes: number;
  bay_count: number;
  is_active: boolean;
}

/**
 * Активные услуги — для клиентской части.
 */
export function useServices(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['services', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('tenant_id', tenantId!)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Service[];
    },
    enabled: !!tenantId,
  });
}

/**
 * Все услуги, включая архивированные — для админки.
 */
export function useAllServices(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['services-all', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('tenant_id', tenantId!)
        .order('is_active', { ascending: false })
        .order('name');
      if (error) throw error;
      return data as Service[];
    },
    enabled: !!tenantId,
  });
}

interface ServiceInput {
  name: string;
  price: number;
  duration_minutes: number;
  prep_time_minutes: number;
  bay_count: number;
}

/**
 * Создать новую услугу.
 */
export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ServiceInput & { tenant_id: string }) => {
      const { data, error } = await supabase
        .from('services')
        .insert({
          tenant_id: input.tenant_id,
          name: input.name,
          price: input.price,
          duration_minutes: input.duration_minutes,
          prep_time_minutes: input.prep_time_minutes,
          bay_count: input.bay_count,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
      qc.invalidateQueries({ queryKey: ['services-all'] });
    },
    onError: (err) => {
      alert('Не удалось создать услугу: ' + (err as Error).message);
    },
  });
}

/**
 * Обновить существующую услугу.
 */
export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: ServiceInput & { id: string }) => {
      const { data, error } = await supabase
        .from('services')
        .update({
          name: patch.name,
          price: patch.price,
          duration_minutes: patch.duration_minutes,
          prep_time_minutes: patch.prep_time_minutes,
          bay_count: patch.bay_count,
        })
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('RLS: обновление отклонено');
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
      qc.invalidateQueries({ queryKey: ['services-all'] });
    },
    onError: (err) => {
      alert('Не удалось сохранить: ' + (err as Error).message);
    },
  });
}

/**
 * Архивировать / вернуть из архива.
 * Услугу нельзя удалить физически — на неё ссылаются записи.
 */
export function useToggleServiceActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('services')
        .update({ is_active })
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('RLS: обновление отклонено');
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
      qc.invalidateQueries({ queryKey: ['services-all'] });
    },
    onError: (err) => {
      alert('Не удалось изменить статус: ' + (err as Error).message);
    },
  });
}