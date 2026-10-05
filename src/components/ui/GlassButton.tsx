import { type ReactNode } from 'react';

export function GlassButton({ children, onClick, className = '' }: {
  children: ReactNode; onClick?: () => void; className?: string;
}) {
  return (
    <button onClick={onClick} className={className} style={{
      position: 'relative',
      padding: '16px 32px',
      borderRadius: 18,
      color: '#fff',
      fontWeight: 600,
      fontSize: 17,
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.18)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      cursor: 'pointer',
      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
      isolation: 'isolate'
    }}>
      {children}
    </button>
  );
}
