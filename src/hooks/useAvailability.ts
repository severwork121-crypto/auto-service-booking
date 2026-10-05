import { useQuery } from '@tanstack/react-query';
import { formatInTimeZone } from 'date-fns-tz';
import { supabase } from '@/lib/supabase';

export interface Slot {
  slot_start: string;
  slot_end: string;
}

export function useAvailability(
  tenantId: string | undefined,
  serviceId: string | undefined,
  date: Date,
  timezone: string
) {
  const dateStr = formatInTimeZone(date, timezone, 'yyyy-MM-dd');
  return useQuery({
    queryKey: ['availability', tenantId, serviceId, dateStr],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_tenant_id: tenantId!,
        p_service_id: serviceId!,
        p_date: dateStr
      });
      if (error) throw error;
      return (data ?? []) as Slot[];
    },
    enabled: !!tenantId && !!serviceId,
    staleTime: 30_000
  });
}
