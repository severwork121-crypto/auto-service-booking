import { useQuery } from '@tanstack/react-query';
import { fetchTenantBySlug } from '@/lib/tenant';

export function useTenant(slug: string) {
  return useQuery({
    queryKey: ['tenant', slug],
    queryFn: () => fetchTenantBySlug(slug),
    enabled: !!slug
  });
}
