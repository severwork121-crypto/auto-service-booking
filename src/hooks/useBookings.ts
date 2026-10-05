import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface BookingWithService {
  id: string;
  client_name: string;
  client_phone: string;
  client_car: string;
  start_at: string;
  end_at: string;
  status: 'confirmed' | 'arrived' | 'done' | 'cancelled';
  payment_amount: number;
  payment_type: string | null;
  service_id: string;
  services: {
    name: string;
    price: number;
  } | null;
}

export function useBookings(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['bookings', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          client_name,
          client_phone,
          client_car,
          start_at,
          end_at,
          status,
          payment_amount,
          payment_type,
          service_id,
          services (name, price)
        `)
        .eq('tenant_id', tenantId!)
        .order('start_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as BookingWithService[];
    },
    enabled: !!tenantId,
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingWithService['status'] }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('RLS: обновление отклонено');
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err) => {
      alert('Не удалось обновить: ' + (err as Error).message);
    },
  });
}

export function useUpdateBookingPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      amount,
      type,
    }: {
      id: string;
      amount: number;
      type: 'paid' | 'refund';
    }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ payment_amount: amount, payment_type: type })
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('RLS: обновление отклонено');
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err) => {
      alert('Не удалось сохранить оплату: ' + (err as Error).message);
    },
  });
}