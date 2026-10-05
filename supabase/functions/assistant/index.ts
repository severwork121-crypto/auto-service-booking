import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  try {
    const { tenantId, message, history = [] } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: tenant } = await supabase
      .from('tenants').select('name, address, phone').eq('id', tenantId).single();

    const { data: services } = await supabase
      .from('services').select('id, name, price, duration_minutes')
      .eq('tenant_id', tenantId).eq('is_active', true);

    let slots: any[] = [];
    const firstId = services?.[0]?.id;
    if (firstId) {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase.rpc('get_available_slots', {
        p_tenant_id: tenantId,
        p_service_id: firstId,
        p_date: today
      });
      slots = data ?? [];
    }

    const systemPrompt = 'Ты — помощник автосервиса "' + (tenant?.name ?? '') + '". ' +
      'Адрес: ' + (tenant?.address ?? '—') + '. Телефон: ' + (tenant?.phone ?? '—') + '. ' +
      'Услуги: ' + (services ?? []).map((s: any) => s.name + ' — ' + s.price + '₽').join('; ') + '. ' +
      'Свободные слоты: ' + slots.slice(0, 5).map((s: any) => s.slot_start).join(', ') + '. ' +
      'Отвечай только на основе этих данных. Если не хватает — задай уточняющий вопрос.';

    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! });
    const completion = await openai.chat.completions.create({
      model: Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message }
      ],
      max_tokens: 500
    });

    return new Response(
      JSON.stringify({ reply: completion.choices[0]?.message?.content ?? '' }),
      { headers: { 'Content-Type': 'application/json', ...cors } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...cors }
    });
  }
});
