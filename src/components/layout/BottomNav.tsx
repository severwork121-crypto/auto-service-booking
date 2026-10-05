import { NavLink } from 'react-router-dom';
import { House, Wrench, CalendarCheck } from '@phosphor-icons/react';

const items = [
  { to: '', icon: House, label: 'Главная' },
  { to: 'services', icon: Wrench, label: 'Услуги' },
  { to: 'my-booking', icon: CalendarCheck, label: 'Моя запись' }
];

export function BottomNav({ slug }: { slug: string }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 'max(16px, env(safe-area-inset-bottom))',
      left: 16,
      right: 16,
      zIndex: 50,
      display: 'flex',
      justifyContent: 'space-around',
      padding: '10px 8px',
      borderRadius: 20,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)'
    }}>
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink key={label} to={'/s/' + slug + '/' + to} end={to === ''}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            padding: '6px 14px',
            borderRadius: 12,
            color: isActive ? '#4690FF' : 'rgba(255,255,255,0.65)',
            fontSize: 11,
            fontWeight: 500
          })}>
          <Icon size={22} weight="bold" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
