import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export function useNewBookingNotifications(tenantId: string | undefined) {
  // Храним ID последнего уведомления, чтобы не спамить
  const lastNotifiedId = useRef<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel(`new-bookings-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `tenant_id=eq.${tenantId}`,
        },
        async (payload) => {
          const booking = payload.new as {
            id: string;
            client_name: string;
            client_phone: string;
            client_car: string;
            start_at: string;
            service_id: string;
          };

          // Защита от дубликатов
          if (lastNotifiedId.current === booking.id) return;
          lastNotifiedId.current = booking.id;

          // Подтягиваем название услуги — в payload.new её нет
          const { data: service } = await supabase
            .from('services')
            .select('name')
            .eq('id', booking.service_id)
            .maybeSingle();

          const serviceName = service?.name ?? 'Услуга';
          const start = new Date(booking.start_at);
          const timeStr = start.toLocaleString('ru-RU', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });

          // Показываем уведомление
          toast.custom(
            (t) => (
              <div
                style={{
                  background: 'rgba(20, 22, 30, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(70,144,255,0.4)',
                  borderRadius: 14,
                  padding: '14px 18px',
                  maxWidth: 360,
                  color: '#fff',
                  boxShadow:
                    '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
                  opacity: t.visible ? 1 : 0,
                  transform: t.visible ? 'translateY(0)' : 'translateY(-8px)',
                  transition: 'all 0.25s ease',
                  pointerEvents: 'auto',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.03em',
                    color: '#7db4ff',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#4690FF',
                      boxShadow: '0 0 12px #4690FF',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                  НОВАЯ ЗАПИСЬ
                </div>

                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                  {serviceName}
                </div>

                <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>
                  {timeStr}
                  <br />
                  {booking.client_name} · {booking.client_phone}
                  <br />
                  {booking.client_car}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      window.location.href = `/s/${window.location.pathname.split('/')[2]}/admin/bookings`;
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: '#4690FF',
                      border: 'none',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Открыть
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Скрыть
                  </button>
                </div>
              </div>
            ),
            {
              duration: 10000,
              position: 'top-center',
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);
}