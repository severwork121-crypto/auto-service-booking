import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { bookingSchema, type BookingForm } from '@/lib/schemas';

export interface CreateBookingInput extends BookingForm {
  tenantId: string;
  idempotencyKey: string;
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      const parsed = bookingSchema.parse(input);
      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: {
          ...parsed,
          tenantId: input.tenantId,
          idempotencyKey: input.idempotencyKey,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { bookingId: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['availability'] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}