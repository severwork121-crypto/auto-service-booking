import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { BottomNav } from '@/components/layout/BottomNav';
import { downloadICS } from '@/lib/notifications';
import { CalendarCheck, Phone, Car, Clock, CheckCircle, XCircle } from '@phosphor-icons/react';

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Подтверждена',
  arrived: 'В работе',
  done: 'Готова',
  cancelled: 'Отменена',
};

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  confirmed: { bg: 'rgba(70,144,255,0.12)', color: '#7db4ff', border: 'rgba(70,144,255,0.4)' },
  arrived: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.4)' },
  done: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.4)' },
  cancelled: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.4)' },
};

const STORAGE_KEY = 'lastBookingId';

export function MyBookingPage() {
  const { slug = '' } = useParams();
  const [params] = useSearchParams();
  const urlId = params.get('id');

  const [bookingId, setBookingId] = useState<string | null>(urlId);
  const [phone, setPhone] = useState('');
  const [searchPhone, setSearchPhone] = useState<string | null>(null);

  // Если в URL нет id — берём последний из localStorage
  useEffect(() => {
    if (urlId) {
      setBookingId(urlId);
      localStorage.setItem(STORAGE_KEY, urlId);
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setBookingId(saved);
    }
  }, [urlId]);

  // Загружаем конкретную запись по id
  const { data: booking, isLoading: loadingBooking } = useQuery({
    queryKey: ['my-booking', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, services(name, price)')
        .eq('id', bookingId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!bookingId && !searchPhone,
  });

  // Загружаем записи по номеру телефона
  const { data: bookingsByPhone = [], isLoading: loadingPhone } = useQuery({
    queryKey: ['my-bookings-phone', searchPhone],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, services(name, price)')
        .eq('client_phone', searchPhone!)
        .order('start_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!searchPhone,
  });

  // === Рендер: ищем по телефону ===
  if (searchPhone) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: 32 }}>
          <button
            onClick={() => setSearchPhone(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#4690FF',
              fontSize: 14,
              padding: 0,
              marginBottom: 16,
              cursor: 'pointer',
            }}
          >
            ← Назад
          </button>
          <h1 className="section__title">Найдено: {bookingsByPhone.length}</h1>

          {loadingPhone && <p style={{ opacity: 0.6 }}>Ищем…</p>}

          {!loadingPhone && bookingsByPhone.length === 0 && (
            <div
              style={{
                padding: 32,
                textAlign: 'center',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px dashed rgba(255,255,255,0.1)',
                opacity: 0.7,
              }}
            >
              По этому номеру записей не найдено
            </div>
          )}

          <div style={{ display: 'grid', gap: 14 }}>
            {bookingsByPhone.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        </div>
        <BottomNav slug={slug} />
      </div>
    );
  }

  // === Рендер: загружаем запись ===
  if (loadingBooking) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: 32 }}>
          <h1 className="section__title">Моя запись</h1>
          <p style={{ opacity: 0.6 }}>Загружаем…</p>
        </div>
        <BottomNav slug={slug} />
      </div>
    );
  }

  // === Рендер: записи нет — приятное пустое состояние ===
  if (!booking) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: 32 }}>
          <h1 className="section__title">Моя запись</h1>

          <div
            style={{
              padding: 32,
              textAlign: 'center',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: 24,
            }}
          >
            <CalendarCheck size={40} weight="duotone" color="#4690FF" style={{ marginBottom: 12 }} />
            <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>У вас пока нет записи</h2>
            <p style={{ opacity: 0.6, margin: '0 0 20px', fontSize: 14, lineHeight: 1.5 }}>
              Запишитесь в студию — вы сможете вернуться сюда, чтобы посмотреть детали
            </p>
            <Link
              to={`/s/${slug}/services`}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: '#4690FF',
                color: '#fff',
                borderRadius: 12,
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: 15,
              }}
            >
              Записаться
            </Link>
          </div>

          <div
            style={{
              padding: 20,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p style={{ margin: '0 0 12px', fontSize: 14, opacity: 0.8 }}>
              Уже записывались? Найдите свои записи по телефону:
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder="+7 999 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button
                className="btn-primary"
                onClick={() => {
                  if (phone.replace(/\D/g, '').length >= 10) {
                    setSearchPhone(phone);
                  } else {
                    alert('Введите корректный номер телефона');
                  }
                }}
                style={{ whiteSpace: 'nowrap' }}
              >
                Найти
              </button>
            </div>
          </div>
        </div>
        <BottomNav slug={slug} />
      </div>
    );
  }

  // === Рендер: показываем запись ===
  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32 }}>
        <h1 className="section__title">Моя запись</h1>
        <BookingCard booking={booking} />
      </div>
      <BottomNav slug={slug} />
    </div>
  );
}

function BookingCard({ booking }: { booking: any }) {
  const start = new Date(booking.start_at);
  const end = new Date(booking.end_at);
  const time = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const endTime = end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const dateStr = start.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    weekday: 'short',
  });

  const statusStyle = STATUS_STYLES[booking.status] ?? STATUS_STYLES.confirmed;
  const statusLabel = STATUS_LABELS[booking.status] ?? booking.status;

  return (
    <div
      style={{
        borderRadius: 20,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
    >
      {/* Шапка с услугой и статусом */}
      <div
        style={{
          padding: 20,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
            {booking.services?.name ?? 'Услуга'}
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '4px 10px',
              borderRadius: 8,
              background: statusStyle.bg,
              color: statusStyle.color,
              border: `1px solid ${statusStyle.border}`,
              whiteSpace: 'nowrap',
            }}
          >
            {statusLabel}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            opacity: 0.75,
            fontSize: 14,
          }}
        >
          <Clock size={16} weight="bold" style={{ opacity: 0.6 }} />
          <span>
            {dateStr}, {time}–{endTime}
          </span>
        </div>
      </div>

      {/* Детали */}
      <div style={{ padding: 20, display: 'grid', gap: 12, fontSize: 14 }}>
        <Row label="Имя" value={booking.client_name} />
        <Row label="Телефон" value={booking.client_phone} />
        <Row label="Автомобиль" value={booking.client_car || '—'} />
        {booking.services?.price != null && (
          <Row label="Стоимость" value={`${booking.services.price} ₽`} />
        )}
      </div>

      {/* Кнопки */}
      {booking.status !== 'cancelled' && booking.status !== 'done' && (
        <div
          style={{
            padding: 16,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() =>
              downloadICS({
                start,
                end,
                title: booking.services?.name ?? 'Запись',
                location: 'Автосервис',
              })
            }
            style={{
              flex: '1 1 160px',
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <CalendarCheck size={18} weight="bold" />
            В календарь
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ opacity: 0.5 }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  );
}