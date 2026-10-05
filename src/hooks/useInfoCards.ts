import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface InfoCard {
  id: string;
  tenant_id: string;
  title: string;
  text: string;
  sort_order: number;
}

export function useInfoCards(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['info-cards-all', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('info_cards')
        .select('*')
        .eq('tenant_id', tenantId!)
        .order('sort_order');
      if (error) throw error;
      return data as InfoCard[];
    },
    enabled: !!tenantId,
  });
}

export function useSaveInfoCards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ cards }: { cards: InfoCard[] }) => {
      const results = await Promise.all(
        cards.map((c) =>
          supabase
            .from('info_cards')
            .update({ title: c.title, text: c.text })
            .eq('id', c.id)
            .select()
        )
      );
      for (const r of results) {
        if (r.error) throw r.error;
        if (!r.data || r.data.length === 0) {
          throw new Error('RLS: обновление отклонено');
        }
      }
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['info-cards-all'] });
      qc.invalidateQueries({ queryKey: ['info-cards'] });
    },
    onError: (err) => {
      alert('Не удалось сохранить карточки: ' + (err as Error).message);
    },
  });
}