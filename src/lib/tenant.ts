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
  const { data, error } = await supabase.from('tenants').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data;
}
