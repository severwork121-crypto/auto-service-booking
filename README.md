# Auto Service Booking

PWA для записи в автосервис/детейлинг-студию.

## Запуск

\`\`\`bash
npm install
cp .env.example .env   # заполни ключи Supabase
npm run dev
\`\`\`

Открой http://localhost:5173

## Supabase

1. Создай проект на https://supabase.com
2. Скопируй URL и anon key в .env
3. Установи Supabase CLI и выполни:
   \`\`\`bash
   supabase link --project-ref <ref>
   supabase db push
   supabase functions deploy create-booking
   supabase functions deploy assistant
   \`\`\`

4. Добавь в демо-данные через SQL Editor:
\`\`\`sql
INSERT INTO tenants (slug, name, description, address, phone, timezone, working_hours)
VALUES ('studio-abc', 'Demo Detail Studio', 'Детейлинг', 'Москва', '+7 999 000-00-00', 'Europe/Moscow',
  '{"1":{"start":"09:00","end":"20:00"},"2":{"start":"09:00","end":"20:00"},"3":{"start":"09:00","end":"20:00"},"4":{"start":"09:00","end":"20:00"},"5":{"start":"09:00","end":"20:00"},"6":{"start":"10:00","end":"18:00"}}'::jsonb);

INSERT INTO services (tenant_id, name, price, duration_minutes)
SELECT id, 'Полировка', 8000, 240 FROM tenants WHERE slug = 'studio-abc';
\`\`\`

5. Открой http://localhost:5173/s/studio-abc/
