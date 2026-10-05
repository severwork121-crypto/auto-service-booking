import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const schema = z.object({
  tenantId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startAt: z.string(),
  clientName: z.string().min(2),
  clientPhone: z.string().min(10),
  clientCar: z.string().min(2),
  idempotencyKey: z.string().uuid()
});

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const p = schema.parse(await req.json());
    const { data, error } = await supabase.rpc('create_booking_atomic', {
      p_tenant_id: p.tenantId,
      p_service_id: p.serviceId,
      p_client_name: p.clientName,
      p_client_phone: p.clientPhone,
      p_client_car: p.clientCar,
      p_start_at: p.startAt,
      p_idempotency_key: p.idempotencyKey
    });
    if (error) {
      const status = error.message.includes('SLOT_TAKEN') ? 409 : 400;
      return new Response(JSON.stringify({ error: error.message }), {
        status, headers: { 'Content-Type': 'application/json', ...cors }
      });
    }
    return new Response(JSON.stringify({ bookingId: data }), {
      headers: { 'Content-Type': 'application/json', ...cors }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...cors }
    });
  }
});
