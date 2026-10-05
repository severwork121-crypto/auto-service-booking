import { useNavigate } from 'react-router-dom';
import { GlassButton } from '@/components/ui/GlassButton';
import type { Tenant } from '@/lib/tenant';

export function HeroSection({ tenant, heroImage }: { tenant: Tenant; heroImage?: string | null }) {
  const navigate = useNavigate();
  return (
    <section style={{ position: 'relative', minHeight: '70vh', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: heroImage ? 'url(' + heroImage + ')' : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#111'
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)'
      }} />
      <div style={{
        position: 'relative',
        padding: '80px 20px 32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        minHeight: '70vh'
      }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, margin: '0 0 8px' }}>{tenant.name}</h1>
        {tenant.description && (
          <p style={{ fontSize: 16, opacity: 0.85, margin: '0 0 24px', maxWidth: 520 }}>
            {tenant.description}
          </p>
        )}
        <GlassButton onClick={() => navigate('/s/' + tenant.slug + '/services')}>
          Записаться
        </GlassButton>
      </div>
    </section>
  );
}
