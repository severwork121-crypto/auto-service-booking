import { useParams } from 'react-router-dom';
import { useTenant } from '@/hooks/useTenant';
import { useBookings, useUpdateBookingStatus, type BookingWithService } from '@/hooks/useBookings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Car, Clock, User, CheckCircle, XCircle } from '@phosphor-icons/react';

const STATUS_LABELS: Record<BookingWithService['status'], string> = {
  confirmed: 'Подтверждена',
  arrived: 'В работе',
  done: 'Готова',
  cancelled: 'Отменена',
};

const STATUS_STYLES: Record<BookingWithService['status'], string> = {
  confirmed: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
  arrived: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  done: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/40',
};

export function AdminBookingsPage() {
  const { slug = '' } = useParams();
  const { data: tenant } = useTenant(slug);
  const { data: bookings = [], isLoading } = useBookings(tenant?.id);
  const updateStatus = useUpdateBookingStatus();

  const now = new Date();
  const upcoming = bookings.filter((b) => new Date(b.end_at) >= now);
  const past = bookings.filter((b) => new Date(b.end_at) < now);

  if (!tenant) return <div style={{ padding: 40, opacity: 0.6 }}>Загрузка…</div>;

  return (
    <div style={{ display: 'grid', gap: 32, maxWidth: 960 }}>
      {/* Заголовок страницы */}
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Записи
        </h1>
        <p style={{ opacity: 0.5, margin: '8px 0 0', fontSize: 13 }}>
          Всего {bookings.length} · предстоящих {upcoming.length}
        </p>
      </div>

      {isLoading && <div style={{ opacity: 0.5 }}>Загрузка…</div>}

      {!isLoading && bookings.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.1)',
            opacity: 0.6,
            fontSize: 14,
          }}
        >
          Пока нет ни одной записи
        </div>
      )}

      {upcoming.length > 0 && (
        <Section title="Предстоящие" count={upcoming.length}>
          {upcoming.map((b) => (
            <BookingCard key={b.id} booking={b} onStatusChange={updateStatus.mutate} />
          ))}
        </Section>
      )}

      {past.length > 0 && (
        <Section title="История" count={past.length}>
          {past.map((b) => (
            <BookingCard key={b.id} booking={b} onStatusChange={updateStatus.mutate} past />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, opacity: 0.9 }}>{title}</h2>
        <span
          style={{
            fontSize: 12,
            padding: '2px 8px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            opacity: 0.6,
          }}
        >
          {count}
        </span>
      </div>
      <div style={{ display: 'grid', gap: 14 }}>{children}</div>
    </section>
  );
}

function BookingCard({
  booking,
  onStatusChange,
  past = false,
}: {
  booking: BookingWithService;
  onStatusChange: (input: { id: string; status: BookingWithService['status'] }) => void;
  past?: boolean;
}) {
  const start = new Date(booking.start_at);
  const end = new Date(booking.end_at);
  const time = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const endTime = end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const dateStr = start.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    weekday: 'short',
  });

  return (
    <div
      style={{
        borderRadius: 16,
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 18,
        transition: 'all 0.2s ease',
        opacity: past ? 0.65 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(70,144,255,0.35)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.035)';
      }}
    >
      {/* Верхняя строка: услуга + бейдж статуса */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 14,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 6,
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
            }}
          >
            {booking.services?.name ?? 'Услуга удалена'}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: 0.6,
              fontSize: 13,
            }}
          >
            <Clock size={14} weight="bold" />
            <span>
              {dateStr}, {time}–{endTime}
            </span>
          </div>
        </div>
        <Badge
          variant="outline"
          className={STATUS_STYLES[booking.status]}
          style={{ fontWeight: 500, padding: '4px 10px', fontSize: 12, flexShrink: 0 }}
        >
          {STATUS_LABELS[booking.status]}
        </Badge>
      </div>

      {/* Контакты */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 10,
          paddingTop: 14,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 16,
          fontSize: 14,
        }}
      >
        <InfoRow icon={<User size={16} weight="bold" />} label={booking.client_name} />
        <InfoRow
          icon={<Phone size={16} weight="bold" />}
          label={
            <a
              href={`tel:${booking.client_phone}`}
              style={{ color: '#4690FF', textDecoration: 'none' }}
            >
              {booking.client_phone}
            </a>
          }
        />
        <InfoRow icon={<Car size={16} weight="bold" />} label={booking.client_car || '—'} />
      </div>

      {/* Кнопки действий — на телефоне растягиваются на всю ширину */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        {booking.status === 'confirmed' && (
          <Button
            size="sm"
            onClick={() => onStatusChange({ id: booking.id, status: 'arrived' })}
            style={{
              background: '#4690FF',
              color: '#fff',
              borderRadius: 10,
              height: 40,
              padding: '0 16px',
              fontWeight: 600,
              flex: '1 1 auto',
              minWidth: 140,
            }}
          >
            <CheckCircle size={16} weight="bold" style={{ marginRight: 6 }} />
            Принять машину
          </Button>
        )}
        {booking.status === 'arrived' && (
          <Button
            size="sm"
            onClick={() => onStatusChange({ id: booking.id, status: 'done' })}
            style={{
              background: '#10b981',
              color: '#fff',
              borderRadius: 10,
              height: 40,
              padding: '0 16px',
              fontWeight: 600,
              flex: '1 1 auto',
              minWidth: 140,
            }}
          >
            <CheckCircle size={16} weight="bold" style={{ marginRight: 6 }} />
            Отметить готовой
          </Button>
        )}
        {booking.status !== 'cancelled' && booking.status !== 'done' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusChange({ id: booking.id, status: 'cancelled' })}
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              height: 40,
              padding: '0 16px',
              fontWeight: 500,
              flex: '1 1 auto',
              minWidth: 140,
            }}
          >
            <XCircle size={16} weight="bold" style={{ marginRight: 6 }} />
            Отменить
          </Button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      <span style={{ opacity: 0.4, display: 'inline-flex', flexShrink: 0 }}>{icon}</span>
      <span
        style={{
          opacity: 0.9,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
}