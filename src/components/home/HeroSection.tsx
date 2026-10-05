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
          {/* Внутренний контейнер с двойной рамкой */}
          <div
            style={{
              borderRadius: 22,
              overflow: 'hidden',
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Фото с наложенным текстом снизу */}
            <div
              style={{
                position: 'relative',
                aspectRatio: '16 / 11',
                backgroundColor: '#0a0a0a',
                backgroundImage: heroImage ? `url(${heroImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Градиент снизу — чтобы текст читался */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.92) 100%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Текст поверх фото, прижат к низу */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '20px 22px 22px',
                  display: 'grid',
                  gap: 8,
                }}
              >
                <h1
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.15,
                    textShadow: '0 2px 12px rgba(0,0,0,0.7)',
                  }}
                >
                  {tenant.name}
                </h1>

                {tenant.description && (
                  <p
                    style={{
                      fontSize: 14,
                      opacity: 0.9,
                      margin: 0,
                      lineHeight: 1.55,
                      maxWidth: 560,
                      textShadow: '0 1px 8px rgba(0,0,0,0.7)',
                    }}
                  >
                    {tenant.description}
                  </p>
                )}
              </div>
            </div>

            {/* Кнопка под фото — внутри стеклянного блока */}
            <div style={{ padding: '18px 22px 22px' }}>
              <GlassButton onClick={() => navigate(`/s/${tenant.slug}/services`)}>
                Записаться
              </GlassButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}