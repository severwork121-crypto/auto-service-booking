import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function GlassButton({ children, onClick, className = '' }: Props) {
  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        padding: '16px 32px',
        borderRadius: 16,
        color: '#fff',
        fontWeight: 600,
        fontSize: 16,
        letterSpacing: '-0.01em',
        background:
          'linear-gradient(135deg, rgba(70,144,255,0.28) 0%, rgba(70,144,255,0.16) 100%)',
        border: '1px solid rgba(70,144,255,0.45)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 24px rgba(70,144,255,0.25)',
        cursor: 'pointer',
        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
        isolation: 'isolate',
        transition: 'transform 0.12s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          'inset 0 1px 0 rgba(255,255,255,0.25), 0 6px 32px rgba(70,144,255,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          'inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 24px rgba(70,144,255,0.25)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {children}
    </button>
  );
}