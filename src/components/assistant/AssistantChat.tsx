import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tenant } from '@/lib/tenant';
import type { Service } from '@/hooks/useServices';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const EXAMPLES = [
  'Когда ближайшее окно?',
  'Какие услуги есть?',
  'Как вас найти?',
];

type Intent =
  | 'availability'
  | 'price'
  | 'address'
  | 'phone'
  | 'hours'
  | 'services'
  | 'help'
  | 'unknown';

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();

  if (/окн|свободн|слот|ближайш|когда.*запис|когда.*можн|есть.*врем/i.test(t))
    return 'availability';
  if (/скольк.*сто|цена|стои|стоит|прайс|почём|почем/i.test(t)) return 'price';
  if (/адрес|где.*нахо|как.*(?:найти|доехать|добраться|дойти)|как.*до вас|где вы|локац/i.test(t))
    return 'address';
  if (/телефон|позвон|номер|связат|контакт/i.test(t)) return 'phone';
  if (/график|работает|часы|режим|во сколько.*(?:откры|закры|работ)/i.test(t)) return 'hours';
  if (/услуг|какие.*есть|что.*дела|что.*может|сервис|что.*предлаг/i.test(t))
    return 'services';
  if (/помощ|привет|здравств|help|что ты умеешь/i.test(t)) return 'help';

  return 'unknown';
}

function findServiceByText(services: Service[], text: string): Service | null {
  const t = text.toLowerCase();
  for (const s of services) {
    const name = s.name.toLowerCase();
    if (t.includes(name)) return s;

    const stem = name.slice(0, Math.max(4, name.length - 2));
    if (stem.length >= 4 && t.includes(stem)) return s;

    const words = name.split(/\s+/).filter((w) => w.length >= 4);
    for (const w of words) {
      const ws = w.slice(0, Math.max(4, w.length - 2));
      if (t.includes(ws)) return s;
    }
  }
  return null;
}

async function findNearestSlots(
  tenantId: string,
  serviceId: string,
  days = 5,
  limit = 3
): Promise<{ start: string }[]> {
  const out: { start: string }[] = [];
  const today = new Date();
  for (let i = 0; i < days && out.length < limit; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const { data } = await supabase.rpc('get_available_slots', {
      p_tenant_id: tenantId,
      p_service_id: serviceId,
      p_date: dateStr,
    });
    for (const s of (data ?? []) as { slot_start: string }[]) {
      out.push({ start: s.slot_start });
      if (out.length >= limit) break;
    }
  }
  return out;
}

function formatSlot(iso: string, timezone: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    timeZone: timezone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(p: number): string {
  return p.toLocaleString('ru-RU') + ' ₽';
}

function formatHours(
  hours: Record<string, { start: string; end: string } | null>
): string {
  const days: [string, string][] = [
    ['1', 'Пн'],
    ['2', 'Вт'],
    ['3', 'Ср'],
    ['4', 'Чт'],
    ['5', 'Пт'],
    ['6', 'Сб'],
    ['7', 'Вс'],
  ];

  // Определяем сегодняшний день недели (1–7)
  const jsDay = new Date().getDay();
  const todayNum = jsDay === 0 ? '7' : String(jsDay);

  const lines: string[] = [];
  for (const [num, label] of days) {
    const v = hours[num];
    const value = v ? `${v.start}–${v.end}` : 'выходной';
    const marker = num === todayNum ? ' ← сегодня' : '';
    lines.push(`${label}: ${value}${marker}`);
  }
  return lines.join('\n');
}

export function AssistantChat({
  tenant,
  services,
}: {
  tenant: Tenant;
  services: Service[];
}) {
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function answer(text: string): Promise<string> {
    const intent = detectIntent(text);

    switch (intent) {
      case 'availability': {
        if (!services.length) return 'К сожалению, у нас пока нет услуг для записи.';
        const slots = await findNearestSlots(tenant.id, services[0].id);
        if (!slots.length) {
          return (
            'На ближайшие дни всё занято 😔\nПопробуйте выбрать другую услугу или позвоните нам: ' +
            (tenant.phone ?? '—')
          );
        }
        const list = slots.map((s) => '• ' + formatSlot(s.start, tenant.timezone)).join('\n');
        return `Ближайшие свободные окна:\n${list}\n\nВыбрать удобное время можно на странице «Услуги».`;
      }

      case 'price': {
        const found = findServiceByText(services, text);
        if (found) {
          return `${found.name} — ${formatPrice(found.price)} (${found.duration_minutes} мин).\n\nЗаписаться можно на странице «Услуги».`;
        }
        if (!services.length) return 'Прайс пока не заполнен.';
        const list = services
          .map((s) => `• ${s.name} — ${formatPrice(s.price)}`)
          .join('\n');
        return `Не нашёл такую услугу в прайсе. Вот что у нас есть:\n${list}`;
      }

      case 'address': {
        if (!tenant.address)
          return 'Адрес пока не заполнен. Позвоните нам: ' + (tenant.phone ?? '—');
        return `Мы находимся по адресу:\n${tenant.address}\n\nТелефон: ${tenant.phone ?? '—'}`;
      }

      case 'phone': {
        return tenant.phone ? `Наш телефон: ${tenant.phone}` : 'Телефон пока не указан.';
      }

      case 'hours': {
        if (!tenant.working_hours || !Object.keys(tenant.working_hours).length) {
          return 'График пока не заполнен.';
        }
        return `Мы работаем:\n${formatHours(tenant.working_hours)}`;
      }

      case 'services': {
        if (!services.length) return 'Услуги пока не заполнены.';
        const list = services
          .map((s) => `• ${s.name} — ${formatPrice(s.price)} (${s.duration_minutes} мин)`)
          .join('\n');
        return `Мы предлагаем:\n${list}\n\nЗаписаться можно на странице «Услуги».`;
      }

      case 'help': {
        return (
          'Я помогу с вопросами:\n' +
          '• когда есть свободное время\n' +
          '• сколько стоит услуга\n' +
          '• какие у нас услуги\n' +
          '• как нас найти\n' +
          '• какой у нас график\n\n' +
          'Просто напишите вопрос.'
        );
      }

      default: {
        const found = findServiceByText(services, text);
        if (found) {
          return `${found.name} — ${formatPrice(found.price)} (${found.duration_minutes} мин).`;
        }
        return 'Не совсем понял вопрос 🤔 Попробуйте спросить про услуги, цены, свободное время или адрес.';
      }
    }
  }

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setHistory((h) => [...h, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const reply = await answer(text);
      setHistory((h) => [...h, { role: 'assistant', content: reply }]);
    } catch {
      setHistory((h) => [
        ...h,
        { role: 'assistant', content: 'Что-то пошло не так. Попробуйте ещё раз.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {EXAMPLES.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="input"
            style={{
              width: 'auto',
              padding: '8px 14px',
              fontSize: 13,
              cursor: 'pointer',
              borderRadius: 10,
            }}
          >
            {q}
          </button>
        ))}
      </div>

      <div
        style={{
          minHeight: 120,
          maxHeight: 400,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 12,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {history.length === 0 && (
          <span style={{ opacity: 0.5, fontSize: 14 }}>
            Задайте вопрос — например, про цены или свободное время.
          </span>
        )}
        {history.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: 12,
              background: m.role === 'user' ? '#4690FF' : 'rgba(255,255,255,0.08)',
              fontSize: 14,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <span style={{ opacity: 0.5, fontSize: 13, fontStyle: 'italic' }}>
            Печатает…
          </span>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        style={{ display: 'flex', gap: 8 }}
      >
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ваш вопрос…"
        />
        <button className="btn-primary" type="submit" disabled={loading}>
          Отправить
        </button>
      </form>
    </div>
  );
}