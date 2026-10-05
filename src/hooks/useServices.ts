import { useQuery } from '@tanstack/react-query';
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
    enabled: !!tenantId
  });
}
