import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { z } from 'zod';
import type { Tenant } from '@/lib/tenant';
import type { Service } from '@/hooks/useServices';
import { useAvailability } from '@/hooks/useAvailability';
import { useCreateBooking } from '@/hooks/useBooking';
import { FadeIn } from '@/components/ui/FadeIn';

const uid = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] % 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const contactSchema = z.object({
  clientName: z.string().min(2, 'Введите имя').max(100),
  clientPhone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{10,20}$/, 'Введите корректный номер телефона'),
  clientCar: z.string().min(2, 'Укажите автомобиль').max(200),
});

type ContactForm = z.infer<typeof contactSchema>;

export function BookingWizard({ tenant, services }: { tenant: Tenant; services: Service[] }) {
  const [serviceId, setServiceId] = useState<string | undefined>(services[0]?.id);
  const [date, setDate] = useState<Date>(new Date());
  const [startAt, setStartAt] = useState<string | undefined>();
  const idempotencyKey = useMemo(uid, []);

  const { data: slots = [], isLoading: loadingSlots } = useAvailability(
    tenant.id,
    serviceId,
    date,
    tenant.timezone
  );

  const createBooking = useCreateBooking();

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { clientName: '', clientPhone: '', clientCar: '' },
  });

  function submitContact(values: ContactForm) {
    if (!serviceId) {
      alert('Выберите услугу');
      return;
    }
    if (!startAt) {
      alert('Выберите время');
      return;
    }

    createBooking.mutate(
      {
        serviceId,
        startAt,
        clientName: values.clientName,
        clientPhone: values.clientPhone,
        clientCar: values.clientCar,
        tenantId: tenant.id,
        idempotencyKey,
      },
      {
        onSuccess: (res) => {
          // Сохраняем ID, чтобы при следующем заходе "Моя запись" открылась автоматически
          localStorage.setItem('lastBookingId', res.bookingId);
          window.location.href = `/s/${tenant.slug}/my-booking?id=${res.bookingId}`;
        },
        onError: (err) => {
          alert('Не удалось записаться: ' + (err as Error).message);
        },
      }
    );
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <FadeIn>
        <div>
          <h2 style={{ fontSize: 15, opacity: 0.7, marginBottom: 10 }}>1. Услуга</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setServiceId(s.id);
                  setStartAt(undefined);
                }}
                style={{
                  textAlign: 'left',
                  padding: 14,
                  borderRadius: 12,
                  background:
                    serviceId === s.id ? 'rgba(70,144,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${serviceId === s.id ? '#4690FF' : 'rgba(255,255,255,0.1)'}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                  <span style={{ color: '#4690FF', fontWeight: 700 }}>{s.price} ₽</span>
                </div>
                <div style={{ fontSize: 13, opacity: 0.6 }}>{s.duration_minutes} мин</div>
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={80}>
        <div>
          <h2 style={{ fontSize: 15, opacity: 0.7, marginBottom: 10 }}>2. Дата и время</h2>
          <input
            type="date"
            className="input"
            value={format(date, 'yyyy-MM-dd')}
            min={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => {
              const d = new Date(e.target.value + 'T12:00:00');
              if (!isNaN(d.getTime())) {
                setDate(d);
                setStartAt(undefined);
              }
            }}
            style={{ marginBottom: 12 }}
          />
          {loadingSlots && <span style={{ opacity: 0.6 }}>Проверяем доступность…</span>}
          {!loadingSlots && slots.length === 0 && (
            <span style={{ opacity: 0.6 }}>На эту дату нет свободного времени</span>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {slots.map((slot) => {
              const iso = slot.slot_start;
              const label = new Date(iso).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const selected = startAt === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setStartAt(iso)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: selected ? '#4690FF' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${selected ? '#4690FF' : 'rgba(255,255,255,0.12)'}`,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={160}>
        <form
          onSubmit={form.handleSubmit(submitContact, (errors) => {
            const firstError = Object.values(errors)[0];
            alert(firstError?.message ?? 'Проверьте поля формы');
          })}
          style={{ display: 'grid', gap: 12 }}
        >
          <h2 style={{ fontSize: 15, opacity: 0.7, margin: 0 }}>3. Ваши данные</h2>

          <div>
            <input className="input" placeholder="Имя" {...form.register('clientName')} />
            {form.formState.errors.clientName && (
              <div className="error-text">{form.formState.errors.clientName.message}</div>
            )}
          </div>

          <div>
            <input
              className="input"
              placeholder="+7 999 123-45-67"
              {...form.register('clientPhone')}
            />
            {form.formState.errors.clientPhone && (
              <div className="error-text">{form.formState.errors.clientPhone.message}</div>
            )}
          </div>

          <div>
            <input className="input" placeholder="Автомобиль" {...form.register('clientCar')} />
            {form.formState.errors.clientCar && (
              <div className="error-text">{form.formState.errors.clientCar.message}</div>
            )}
          </div>

          <button
            className="btn-primary"
            type="submit"
            disabled={!startAt || !serviceId || createBooking.isPending}
          >
            {createBooking.isPending ? 'Отправляем…' : 'Подтвердить запись'}
          </button>

          {!startAt && (
            <div style={{ fontSize: 13, opacity: 0.5, textAlign: 'center' }}>
              Выберите время выше
            </div>
          )}

          {createBooking.error && (
            <div className="error-text">{(createBooking.error as Error).message}</div>
          )}
        </form>
      </FadeIn>
    </div>
  );
}