import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTenant } from '@/hooks/useTenant';
import {
  useBookings,
  useUpdateBookingStatus,
  useUpdateBookingPayment,
  type BookingWithService,
} from '@/hooks/useBookings';
import { Phone, Car, Clock, User, CheckCircle, XCircle, CurrencyRub } from '@phosphor-icons/react';

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
  const updatePayment = useUpdateBookingPayment();

  const [paymentFor, setPaymentFor] = useState<BookingWithService | null>(null);

  const now = new Date();
  const upcoming = bookings.filter((b) => new Date(b.end_at) >= now);
  const past = bookings.filter((b) => new Date(b.end_at) < now);

  if (!tenant) return <div style={{ padding: 40, opacity: 0.6 }}>Загрузка…</div>;

  return (
    <div style={{ display: 'grid', gap: 32, maxWidth: 960 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
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
            <BookingCard
              key={b.id}
              booking={b}
              onStatusChange={updateStatus.mutate}
              onPaymentClick={() => setPaymentFor(b)}
            />
          ))}
        </Section>
      )}

      {past.length > 0 && (
        <Section title="История" count={past.length}>
          {past.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onStatusChange={updateStatus.mutate}
              onPaymentClick={() => setPaymentFor(b)}
              past
            />
          ))}
        </Section>
      )}

      {paymentFor && (
        <PaymentModal
          booking={paymentFor}
          onClose={() => setPaymentFor(null)}
          onSave={(amount, type) => {
            updatePayment.mutate(
              { id: paymentFor.id, amount, type },
              { onSuccess: () => setPaymentFor(null) }
            );
          }}
          saving={updatePayment.isPending}
        />
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
  onPaymentClick,
  past = false,
}: {
  booking: BookingWithService;
  onStatusChange: (input: { id: string; status: BookingWithService['status'] }) => void;
  onPaymentClick: () => void;
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

  const hasPayment = Number(booking.payment_amount) > 0;
  const isRefund = booking.payment_type === 'refund';

  return (
    <div
      style={{
        borderRadius: 16,
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 18,
        transition: 'all 0.2s ease',
        opacity: past ? 0.75 : 1,
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
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {hasPayment && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 8,
                background: isRefund ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                color: isRefund ? '#f87171' : '#34d399',
                border: `1px solid ${isRefund ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
                whiteSpace: 'nowrap',
              }}
            >
              {isRefund ? '−' : '+'}
              {Number(booking.payment_amount).toLocaleString('ru-RU')} ₽
            </span>
          )}
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '4px 10px',
              borderRadius: 8,
              background:
                booking.status === 'confirmed'
                  ? 'rgba(70,144,255,0.15)'
                  : booking.status === 'arrived'
                    ? 'rgba(245,158,11,0.15)'
                    : booking.status === 'done'
                      ? 'rgba(16,185,129,0.15)'
                      : 'rgba(239,68,68,0.15)',
              color:
                booking.status === 'confirmed'
                  ? '#7db4ff'
                  : booking.status === 'arrived'
                    ? '#fbbf24'
                    : booking.status === 'done'
                      ? '#34d399'
                      : '#f87171',
              border: `1px solid ${
                booking.status === 'confirmed'
                  ? 'rgba(70,144,255,0.4)'
                  : booking.status === 'arrived'
                    ? 'rgba(245,158,11,0.4)'
                    : booking.status === 'done'
                      ? 'rgba(16,185,129,0.4)'
                      : 'rgba(239,68,68,0.4)'
              }`,
              whiteSpace: 'nowrap',
            }}
          >
            {STATUS_LABELS[booking.status]}
          </span>
        </div>
      </div>

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

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {booking.status === 'confirmed' && (
          <ActionButton
            onClick={() => onStatusChange({ id: booking.id, status: 'arrived' })}
            color="#4690FF"
          >
            <CheckCircle size={16} weight="bold" />
            Принять машину
          </ActionButton>
        )}
        {booking.status === 'arrived' && (
          <ActionButton
            onClick={() => onStatusChange({ id: booking.id, status: 'done' })}
            color="#10b981"
          >
            <CheckCircle size={16} weight="bold" />
            Отметить готовой
          </ActionButton>
        )}

        {(booking.status === 'arrived' || booking.status === 'done') && (
          <ActionButton onClick={onPaymentClick} color="#4690FF" variant="outline">
            <CurrencyRub size={16} weight="bold" />
            {hasPayment ? 'Изменить оплату' : 'Внести оплату'}
          </ActionButton>
        )}

        {booking.status !== 'cancelled' && booking.status !== 'done' && (
          <ActionButton
            onClick={() => onStatusChange({ id: booking.id, status: 'cancelled' })}
            variant="outline"
          >
            <XCircle size={16} weight="bold" />
            Отменить
          </ActionButton>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  color,
  variant = 'filled',
}: {
  children: React.ReactNode;
  onClick: () => void;
  color?: string;
  variant?: 'filled' | 'outline';
}) {
  const isOutline = variant === 'outline';
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        background: isOutline ? 'rgba(255,255,255,0.06)' : color || 'rgba(255,255,255,0.06)',
        color: '#fff',
        border: `1px solid ${isOutline ? 'rgba(255,255,255,0.12)' : color || 'rgba(255,255,255,0.12)'}`,
        borderRadius: 10,
        height: 40,
        padding: '0 16px',
        fontWeight: 600,
        fontSize: 14,
        cursor: 'pointer',
        flex: '1 1 auto',
        minWidth: 140,
        transition: 'opacity 0.15s ease, transform 0.1s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      {children}
    </button>
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

function PaymentModal({
  booking,
  onClose,
  onSave,
  saving,
}: {
  booking: BookingWithService;
  onClose: () => void;
  onSave: (amount: number, type: 'paid' | 'refund') => void;
  saving: boolean;
}) {
  const defaultAmount = booking.services?.price ?? 0;
  const [amount, setAmount] = useState<string>(
    booking.payment_amount ? String(booking.payment_amount) : String(defaultAmount)
  );
  const [type, setType] = useState<'paid' | 'refund'>(
    (booking.payment_type as 'paid' | 'refund') || 'paid'
  );

  function save() {
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      alert('Введите сумму больше нуля');
      return;
    }
    onSave(num, type);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 20,
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: 24,
          display: 'grid',
          gap: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>
            Оплата по записи
          </h2>
          <p style={{ fontSize: 13, opacity: 0.55, margin: 0 }}>
            {booking.client_name} · {booking.services?.name ?? 'Услуга'}
          </p>
        </div>

        {/* Тип операции */}
        <div style={{ display: 'flex', gap: 8 }}>
          <TypeButton
            active={type === 'paid'}
            color="rgba(16,185,129,0.15)"
            border="rgba(16,185,129,0.5)"
            textColor="#34d399"
            onClick={() => setType('paid')}
          >
            Оплата
          </TypeButton>
          <TypeButton
            active={type === 'refund'}
            color="rgba(239,68,68,0.15)"
            border="rgba(239,68,68,0.5)"
            textColor="#f87171"
            onClick={() => setType('refund')}
          >
            Возврат
          </TypeButton>
        </div>

        {/* Сумма */}
        <div>
          <label
            style={{
              fontSize: 12,
              opacity: 0.55,
              display: 'block',
              marginBottom: 8,
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            СУММА, ₽
          </label>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ fontSize: 20, fontWeight: 700, padding: '14px 16px' }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {defaultAmount > 0 && (
              <QuickAmount
                onClick={() => setAmount(String(defaultAmount))}
                label={`По прайсу: ${defaultAmount.toLocaleString('ru-RU')} ₽`}
              />
            )}
            <QuickAmount
              onClick={() => setAmount(String(Number(amount) + 1000))}
              label="+1 000"
            />
            <QuickAmount
              onClick={() => setAmount(String(Number(amount) + 5000))}
              label="+5 000"
            />
            <QuickAmount onClick={() => setAmount('0')} label="Очистить" />
          </div>
        </div>

        {/* Кнопки */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              flex: 1,
              padding: '14px 16px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Отмена
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{
              flex: 2,
              padding: '14px 16px',
              borderRadius: 12,
              background: '#4690FF',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TypeButton({
  active,
  children,
  onClick,
  color,
  border,
  textColor,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  color: string;
  border: string;
  textColor: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '12px 16px',
        borderRadius: 12,
        background: active ? color : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? border : 'rgba(255,255,255,0.1)'}`,
        color: active ? textColor : '#fff',
        fontWeight: 600,
        fontSize: 14,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {children}
    </button>
  );
}

function QuickAmount({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        fontSize: 12,
        borderRadius: 8,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff',
        cursor: 'pointer',
        opacity: 0.85,
      }}
    >
      {label}
    </button>
  );
}