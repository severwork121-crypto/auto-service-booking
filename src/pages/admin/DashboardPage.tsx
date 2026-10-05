import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTenant } from '@/hooks/useTenant';
import { useBookings } from '@/hooks/useBookings';
import { FadeIn } from '@/components/ui/FadeIn';
import {
  CalendarCheck,
  Wrench,
  CurrencyRub,
  TrendUp,
  Clock,
  ArrowRight,
} from '@phosphor-icons/react';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}

function MetricCard({ icon, label, value, hint, accent = false }: MetricCardProps) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 16,
        background: accent ? 'rgba(70,144,255,0.08)' : 'rgba(255,255,255,0.035)',
        border: `1px solid ${accent ? 'rgba(70,144,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          opacity: 0.55,
          fontSize: 13,
        }}
      >
        {icon}
        <span>{label}</span>
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          color: accent ? '#7db4ff' : '#fff',
        }}
      >
        {value}
      </div>
      {hint && <div style={{ fontSize: 12, opacity: 0.45 }}>{hint}</div>}
    </div>
  );
}

export function DashboardPage() {
  const { slug = '' } = useParams();
  const { data: tenant } = useTenant(slug);
  const { data: bookings = [], isLoading } = useBookings(tenant?.id);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // Начало недели (понедельник)
    const weekStart = new Date(todayStart);
    const day = weekStart.getDay() === 0 ? 7 : weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (day - 1));

    // Метрики за сегодня
    const todayBookings = bookings.filter((b) => {
      const d = new Date(b.start_at);
      return d >= todayStart && d < todayEnd;
    });

    const todayDone = todayBookings.filter((b) => b.status === 'done');
    const todayRevenue = todayDone.reduce(
      (sum, b) => sum + (Number(b.payment_amount) || 0),
      0
    );
    const todayInWork = todayBookings.filter((b) => b.status === 'arrived').length;

    // Метрики за неделю
    const weekBookings = bookings.filter((b) => {
      const d = new Date(b.start_at);
      return d >= weekStart && d < todayEnd;
    });
    const weekDone = weekBookings.filter((b) => b.status === 'done');
    const weekRevenue = weekDone.reduce(
      (sum, b) => sum + (Number(b.payment_amount) || 0),
      0
    );

    // Ближайшие предстоящие сегодня
    const upcomingToday = todayBookings
      .filter((b) => new Date(b.end_at) >= now && b.status !== 'cancelled')
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
      .slice(0, 5);

    // Загрузка по дням недели
    const weekDays: { label: string; count: number }[] = [];
    const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = bookings.filter((b) => {
        const bd = new Date(b.start_at);
        return bd >= d && bd < next && b.status !== 'cancelled';
      }).length;
      weekDays.push({ label: dayLabels[i], count });
    }
    const maxCount = Math.max(1, ...weekDays.map((d) => d.count));

    return {
      todayBookings,
      todayDone,
      todayRevenue,
      todayInWork,
      weekBookings,
      weekDone,
      weekRevenue,
      upcomingToday,
      weekDays,
      maxCount,
    };
  }, [bookings]);

  if (!tenant) return <div style={{ padding: 40, opacity: 0.6 }}>Загрузка…</div>;

  return (
    <div style={{ display: 'grid', gap: 32, maxWidth: 960 }}>
      {/* Заголовок */}
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Дашборд
        </h1>
        <p style={{ opacity: 0.5, margin: '8px 0 0', fontSize: 13 }}>
          {tenant.name}
        </p>
      </div>

      {isLoading && <div style={{ opacity: 0.5 }}>Загрузка…</div>}

      {/* Метрики за сегодня */}
      <FadeIn>
        <section>
          <h2 style={{ fontSize: 13, opacity: 0.5, margin: '0 0 12px', fontWeight: 600 }}>
            СЕГОДНЯ
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
            }}
          >
            <MetricCard
              icon={<CalendarCheck size={16} weight="bold" />}
              label="Записей"
              value={String(stats.todayBookings.length)}
              hint={
                stats.todayBookings.length > 0
                  ? `${stats.todayBookings.filter((b) => b.status === 'confirmed').length} в ожидании`
                  : 'нет записей'
              }
            />
            <MetricCard
              icon={<Wrench size={16} weight="bold" />}
              label="В работе"
              value={String(stats.todayInWork)}
              hint="машин сейчас на подъёмнике"
            />
            <MetricCard
              icon={<CurrencyRub size={16} weight="bold" />}
              label="Выручка"
              value={stats.todayRevenue.toLocaleString('ru-RU') + ' ₽'}
              hint={
                stats.todayDone.length > 0
                  ? `${stats.todayDone.length} работ завершено`
                  : 'пока нет оплат'
              }
              accent
            />
          </div>
        </section>
      </FadeIn>

      {/* Метрики за неделю */}
      <FadeIn delay={80}>
        <section>
          <h2 style={{ fontSize: 13, opacity: 0.5, margin: '0 0 12px', fontWeight: 600 }}>
            ЗА НЕДЕЛЮ
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
            }}
          >
            <MetricCard
              icon={<CalendarCheck size={16} weight="bold" />}
              label="Всего записей"
              value={String(stats.weekBookings.length)}
            />
            <MetricCard
              icon={<TrendUp size={16} weight="bold" />}
              label="Завершено"
              value={String(stats.weekDone.length)}
              hint={
                stats.weekBookings.length > 0
                  ? `${Math.round((stats.weekDone.length / stats.weekBookings.length) * 100)}% от всех`
                  : ''
              }
            />
            <MetricCard
              icon={<CurrencyRub size={16} weight="bold" />}
              label="Выручка"
              value={stats.weekRevenue.toLocaleString('ru-RU') + ' ₽'}
              accent
            />
          </div>
        </section>
      </FadeIn>

      {/* Мини-график загрузки по дням */}
      <FadeIn delay={160}>
        <section>
          <h2 style={{ fontSize: 13, opacity: 0.5, margin: '0 0 12px', fontWeight: 600 }}>
            ЗАГРУЗКА ПО ДНЯМ
          </h2>
          <div
            style={{
              padding: 20,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 8,
              height: 160,
            }}
          >
            {stats.weekDays.map((d, i) => {
              const heightPct = stats.maxCount > 0 ? (d.count / stats.maxCount) * 100 : 0;
              const isToday =
                i ===
                ((new Date().getDay() === 0 ? 7 : new Date().getDay()) - 1);
              return (
                <div
                  key={d.label}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      opacity: d.count > 0 ? 0.9 : 0.3,
                    }}
                  >
                    {d.count}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 40,
                      height: `${Math.max(heightPct, 4)}%`,
                      minHeight: 4,
                      borderRadius: 6,
                      background: isToday
                        ? 'linear-gradient(180deg, #4690FF, #3a7fe0)'
                        : 'rgba(70,144,255,0.35)',
                      transition: 'height 0.3s ease',
                      boxShadow: isToday ? '0 0 20px rgba(70,144,255,0.4)' : 'none',
                    }}
                  />
                  <div
                    style={{
                      fontSize: 11,
                      opacity: isToday ? 0.9 : 0.4,
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? '#4690FF' : '#fff',
                    }}
                  >
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </FadeIn>

      {/* Ближайшие записи сегодня */}
      <FadeIn delay={240}>
        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <h2
              style={{
                fontSize: 13,
                opacity: 0.5,
                margin: 0,
                fontWeight: 600,
              }}
            >
              БЛИЖАЙШИЕ СЕГОДНЯ
            </h2>
            <Link
              to={`/s/${slug}/admin/bookings`}
              style={{
                fontSize: 13,
                color: '#4690FF',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'none',
              }}
            >
              Все записи <ArrowRight size={14} weight="bold" />
            </Link>
          </div>

          {stats.upcomingToday.length === 0 ? (
            <div
              style={{
                padding: 28,
                textAlign: 'center',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px dashed rgba(255,255,255,0.1)',
                opacity: 0.6,
                fontSize: 14,
              }}
            >
              На сегодня больше нет записей
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {stats.upcomingToday.map((b) => {
                const start = new Date(b.start_at);
                const time = start.toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={b.id}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.035)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: 52,
                        padding: '4px 8px',
                        borderRadius: 10,
                        background: 'rgba(70,144,255,0.1)',
                        border: '1px solid rgba(70,144,255,0.25)',
                      }}
                    >
                      <Clock size={14} weight="bold" color="#7db4ff" />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#7db4ff',
                          marginTop: 2,
                        }}
                      >
                        {time}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {b.services?.name ?? 'Услуга'}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          opacity: 0.55,
                          marginTop: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {b.client_name} · {b.client_car || '—'}
                      </div>
                    </div>
                    <a
                      href={`tel:${b.client_phone}`}
                      style={{
                        fontSize: 12,
                        color: '#4690FF',
                        textDecoration: 'none',
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: 'rgba(70,144,255,0.1)',
                        border: '1px solid rgba(70,144,255,0.2)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {b.client_phone}
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </FadeIn>
    </div>
  );
}