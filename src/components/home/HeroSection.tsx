import { useNavigate } from 'react-router-dom';
import { GlassButton } from '@/components/ui/GlassButton';
import type { Tenant } from '@/lib/tenant';

export function HeroSection({
  tenant,
  heroImage,
}: {
  tenant: Tenant;
  heroImage?: string | null;
}) {
  const navigate = useNavigate();

  return (
    <section style={{ padding: '32px 0 0' }}>
      <div className="container">
        <div
          className="glass"
          style={{
            borderRadius: 28,
            overflow: 'hidden',
            padding: 10,
          }}
        >
          {/* Внутренний контейнер с двойной рамкой — усиливает "стекло" */}
          <div
            style={{
              borderRadius: 22,
              overflow: 'hidden',
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Фото машины */}
            <div
              style={{
                position: 'relative',
                aspectRatio: '16 / 10',
                backgroundColor: '#0a0a0a',
                backgroundImage: heroImage ? `url(${heroImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Лёгкий градиент снизу, чтобы фото мягко переходило в контент */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Текстовый блок + кнопка */}
            <div
              style={{
                padding: '22px 22px 24px',
                display: 'grid',
                gap: 14,
              }}
            >
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                }}
              >
                {tenant.name}
              </h1>

              {tenant.description && (
                <p
                  style={{
                    fontSize: 14,
                    opacity: 0.7,
                    margin: 0,
                    lineHeight: 1.55,
                    maxWidth: 560,
                  }}
                >
                  {tenant.description}
                </p>
              )}

              {/* Кнопка "Записаться" — растянута на всю ширину */}
              <div style={{ marginTop: 4 }}>
                <GlassButton
                  onClick={() => navigate(`/s/${tenant.slug}/services`)}
                  className="w-full"
                >
                  Записаться
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}