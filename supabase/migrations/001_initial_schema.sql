CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'Europe/Moscow',
  working_hours JSONB DEFAULT '{}',
  logo_url TEXT,
  hero_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration_minutes INTEGER NOT NULL,
  prep_time_minutes INTEGER DEFAULT 15,
  bay_count INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_car TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'confirmed',
  payment_amount NUMERIC DEFAULT 0,
  payment_type TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bookings_tenant_start_idx ON bookings (tenant_id, start_at);

CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS info_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION get_available_slots(
  p_tenant_id UUID,
  p_service_id UUID,
  p_date DATE
) RETURNS TABLE(slot_start TIMESTAMPTZ, slot_end TIMESTAMPTZ) AS $$
DECLARE
  v_service RECORD;
  v_tz TEXT;
  v_wh JSONB;
  v_work_start TIME;
  v_work_end TIME;
  v_cursor TIMESTAMPTZ;
  v_day_start TIMESTAMPTZ;
  v_day_end TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_service FROM services WHERE id = p_service_id;
  SELECT timezone, working_hours INTO v_tz, v_wh FROM tenants WHERE id = p_tenant_id;

  SELECT (v_wh ->> to_char(p_date, 'ID'))::TIME,
         (v_wh ->> (to_char(p_date, 'ID') || '_end'))::TIME
    INTO v_work_start, v_work_end;

  IF v_work_start IS NULL OR v_work_end IS NULL THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM holidays WHERE tenant_id = p_tenant_id AND date = p_date) THEN RETURN; END IF;

  v_day_start := (p_date::TEXT || ' ' || v_work_start::TEXT)::TIMESTAMPTZ AT TIME ZONE v_tz;
  v_day_end := (p_date::TEXT || ' ' || v_work_end::TEXT)::TIMESTAMPTZ AT TIME ZONE v_tz;
  v_cursor := v_day_start;

  WHILE v_cursor + (v_service.duration_minutes || ' minutes')::INTERVAL <= v_day_end LOOP
    IF NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.tenant_id = p_tenant_id
        AND b.status <> 'cancelled'
        AND tstzrange(
          b.start_at - (v_service.prep_time_minutes || ' minutes')::INTERVAL,
          b.end_at + (v_service.prep_time_minutes || ' minutes')::INTERVAL
        ) && tstzrange(v_cursor, v_cursor + (v_service.duration_minutes || ' minutes')::INTERVAL)
    ) THEN
      slot_start := v_cursor;
      slot_end := v_cursor + (v_service.duration_minutes || ' minutes')::INTERVAL;
      RETURN NEXT;
    END IF;
    v_cursor := v_cursor + '30 minutes'::INTERVAL;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_tenant_id UUID,
  p_service_id UUID,
  p_client_name TEXT,
  p_client_phone TEXT,
  p_client_car TEXT,
  p_start_at TIMESTAMPTZ,
  p_idempotency_key TEXT
) RETURNS UUID AS $$
DECLARE
  v_service RECORD;
  v_end_at TIMESTAMPTZ;
  v_booking_id UUID;
  v_existing UUID;
BEGIN
  SELECT id INTO v_existing FROM bookings WHERE idempotency_key = p_idempotency_key;
  IF v_existing IS NOT NULL THEN RETURN v_existing; END IF;

  SELECT * INTO v_service FROM services WHERE id = p_service_id;
  v_end_at := p_start_at + (v_service.duration_minutes || ' minutes')::INTERVAL;

  PERFORM pg_advisory_xact_lock(hashtext(p_tenant_id::TEXT || p_start_at::TEXT));

  IF EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.tenant_id = p_tenant_id
      AND b.status <> 'cancelled'
      AND tstzrange(b.start_at, b.end_at) && tstzrange(p_start_at, v_end_at)
  ) THEN
    RAISE EXCEPTION 'SLOT_TAKEN';
  END IF;

  INSERT INTO bookings (
    tenant_id, service_id, client_name, client_phone, client_car,
    start_at, end_at, idempotency_key
  ) VALUES (
    p_tenant_id, p_service_id, p_client_name, p_client_phone, p_client_car,
    p_start_at, v_end_at, p_idempotency_key
  ) RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenants_public_read ON tenants FOR SELECT USING (true);
CREATE POLICY services_public_read ON services FOR SELECT USING (is_active);
CREATE POLICY gallery_public_read ON gallery FOR SELECT USING (true);
CREATE POLICY info_cards_public_read ON info_cards FOR SELECT USING (true);
CREATE POLICY bookings_public_read ON bookings FOR SELECT USING (true);
