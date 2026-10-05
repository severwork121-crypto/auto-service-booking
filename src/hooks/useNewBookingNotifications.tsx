import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export function useNewBookingNotifications(tenantId: string | undefined) {
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

          if (lastNotifiedId.current === booking.id) return;
          lastNotifiedId.current = booking.id;

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

          const slug = window.location.pathname.split('/')[2];

          toast.custom(
            (t) => (
              <div
                style={{
                  opacity: t.visible ? 1 : 0,
                  transform: t.visible
                    ? 'translateX(0) scale(1)'
                    : 'translateX(20px) scale(0.96)',
                  transition:
                    'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: t.visible ? 'auto' : 'none',
                  width: 340,
                  maxWidth: 'calc(100vw - 32px)',
                }}
              >
                {/* Внешнее стекло */}
                <div
                  style={{
                    position: 'relative',
                    padding: 1,
                    borderRadius: 20,
                    background:
                      'linear-gradient(135deg, rgba(70,144,255,0.55) 0%, rgba(70,144,255,0.1) 45%, rgba(255,255,255,0.06) 100%)',
                    boxShadow:
                      '0 20px 60px rgba(0,0,0,0.55), 0 8px 24px rgba(70,144,255,0.18)',
                  }}
                >
                  {/* Внутренний слой с blur */}
                  <div
                    style={{
                      position: 'relative',
                      padding: '18px 18px 16px',
                      borderRadius: 19,
                      background:
                        'linear-gradient(180deg, rgba(20,24,34,0.92) 0%, rgba(12,14,22,0.96) 100%)',
                      backdropFilter: 'blur(24px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Мягкое синее свечение сверху справа */}
                    <div
                      aria-hidden
                      style={{
                        position: 'absolute',
                        top: -60,
                        right: -60,
                        width: 160,
                        height: 160,
                        borderRadius: '50%',
                        background:
                          'radial-gradient(circle, rgba(70,144,255,0.35) 0%, transparent 70%)',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Шапка с иконкой и меткой */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 12,
                        position: 'relative',
                      }}
                    >
                      {/* Пульсирующий кружок с иконкой календаря */}
                      <div
                        style={{
                          position: 'relative',
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background:
                            'linear-gradient(135deg, rgba(70,144,255,0.28) 0%, rgba(70,144,255,0.12) 100%)',
                          border: '1px solid rgba(70,144,255,0.45)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#7db4ff"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="5" width="18" height="16" rx="2" />
                          <path d="M3 10h18" />
                          <path d="M8 3v4" />
                          <path d="M16 3v4" />
                        </svg>
                        {/* Точка "live" */}
                        <span
                          style={{
                            position: 'absolute',
                            top: -3,
                            right: -3,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: '#4690FF',
                            border: '2px solid #0d1018',
                            boxShadow: '0 0 12px #4690FF',
                            animation: 'pulseDot 1.6s ease-in-out infinite',
                          }}
                        />
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            color: '#7db4ff',
                            textTransform: 'uppercase',
                            lineHeight: 1,
                            marginBottom: 3,
                          }}
                        >
                          Новая запись
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.5)',
                            lineHeight: 1,
                          }}
                        >
                          {timeStr}
                        </div>
                      </div>
                    </div>

                    {/* Контент */}
                    <div style={{ position: 'relative', marginBottom: 14 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#fff',
                          letterSpacing: '-0.01em',
                          marginBottom: 8,
                          lineHeight: 1.2,
                        }}
                      >
                        {serviceName}
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gap: 5,
                          fontSize: 13,
                          color: 'rgba(255,255,255,0.75)',
                          lineHeight: 1.4,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                          }}
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ flexShrink: 0 }}
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <span>{booking.client_name}</span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                          }}
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ flexShrink: 0 }}
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          <span>{booking.client_phone}</span>
                        </div>
                        {booking.client_car && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 7,
                            }}
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="rgba(255,255,255,0.4)"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ flexShrink: 0 }}
                            >
                              <path d="M5 17h14M5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm14 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
                              <path d="M3 17v-4l2-5h14l2 5v4" />
                            </svg>
                            <span>{booking.client_car}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Кнопки */}
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        position: 'relative',
                      }}
                    >
                      <button
                        onClick={() => {
                          toast.dismiss(t.id);
                          window.location.href = `/s/${slug}/admin/bookings`;
                        }}
                        style={{
                          flex: 1,
                          padding: '11px 14px',
                          background:
                            'linear-gradient(135deg, #4690FF 0%, #3a7fe0 100%)',
                          border: 'none',
                          borderRadius: 10,
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          letterSpacing: '-0.01em',
                          boxShadow:
                            '0 4px 16px rgba(70,144,255,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                          transition: 'transform 0.12s ease, box-shadow 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            '0 6px 20px rgba(70,144,255,0.5), inset 0 1px 0 rgba(255,255,255,0.25)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow =
                            '0 4px 16px rgba(70,144,255,0.35), inset 0 1px 0 rgba(255,255,255,0.2)';
                        }}
                      >
                        Открыть запись
                      </button>
                      <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{
                          padding: '11px 16px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 10,
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            'rgba(255,255,255,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            'rgba(255,255,255,0.06)';
                        }}
                      >
                        Скрыть
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ),
            {
              duration: 10000,
              position: 'bottom-right',
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