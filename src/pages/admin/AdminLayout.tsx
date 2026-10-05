import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useTenant } from '@/hooks/useTenant';
import { useNewBookingNotifications } from '@/hooks/useNewBookingNotifications';
import { SignOut } from '@phosphor-icons/react';

const items = [
  { to: '', label: 'Дашборд' },
  { to: 'bookings', label: 'Записи' },
  { to: 'services', label: 'Услуги' },
  { to: 'gallery', label: 'Галерея' },
  { to: 'settings', label: 'Настройки' },
];

export function AdminLayout() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { data: tenant } = useTenant(slug);
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Подписка на новые записи
  useNewBookingNotifications(tenant?.id);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        navigate(`/s/${slug}/admin/login`, { replace: true });
      } else {
        setAuthed(true);
      }
      setChecking(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate(`/s/${slug}/admin/login`, { replace: true });
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [navigate, slug]);

  async function logout() {
    await supabase.auth.signOut();
    navigate(`/s/${slug}/admin/login`, { replace: true });
  }

  if (checking) return <div style={{ padding: 40, opacity: 0.6 }}>Проверяем вход…</div>;
  if (!authed) return null;

  return (
    <>
      {/* Тостер — рендерит все уведомления */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 10000,
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
          },
        }}
      />

      <div
        style={{
          display: isMobile ? 'block' : 'grid',
          gridTemplateColumns: isMobile ? undefined : '240px 1fr',
          minHeight: '100vh',
        }}
      >
        <aside
          style={
            isMobile
              ? {
                  position: 'sticky',
                  top: 0,
                  zIndex: 40,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 12px',
                  background: 'rgba(0,0,0,0.85)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                }
              : {
                  padding: 20,
                  borderRight: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  position: 'sticky',
                  top: 0,
                  height: '100vh',
                }
          }
        >
          {!isMobile && (
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>Кабинет</div>
          )}

          {items.map((i) => (
            <NavLink
              key={i.label}
              to={`/s/${slug}/admin/${i.to}`}
              end={i.to === ''}
              style={({ isActive }) => ({
                padding: isMobile ? '8px 14px' : '10px 12px',
                borderRadius: 10,
                color: isActive ? '#4690FF' : 'rgba(255,255,255,0.75)',
                background: isActive ? 'rgba(70,144,255,0.12)' : 'transparent',
                fontSize: 14,
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                transition: 'background 0.15s ease, color 0.15s ease',
              })}
            >
              {i.label}
            </NavLink>
          ))}

          {!isMobile && <div style={{ flex: 1 }} />}

          <button
            onClick={logout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginLeft: isMobile ? 'auto' : 0,
              marginTop: isMobile ? 0 : 16,
              padding: isMobile ? '8px 12px' : '10px 12px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {isMobile ? <SignOut size={18} weight="bold" /> : 'Выйти'}
          </button>
        </aside>

        <main style={{ padding: isMobile ? 16 : 32 }}>
          <Outlet />
        </main>
      </div>
    </>
  );
}