import { FadeIn } from '@/components/ui/FadeIn';
import type { GalleryItem } from '@/hooks/useGallery';

export function GallerySection({ items }: { items: GalleryItem[] }) {
  if (!items.length) return null;

  return (
    <section className="section">
      <div className="container">
        <FadeIn>
          <h2 className="section__title">Наши работы</h2>
        </FadeIn>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 14,
          }}
        >
          {items.map((item, i) => (
            <FadeIn key={item.id} delay={i * 60}>
              <div
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'transform 0.25s ease, border-color 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(70,144,255,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                <div
                  style={{
                    aspectRatio: '4/3',
                    backgroundImage: `url(${item.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#111',
                  }}
                />
                {item.caption && (
                  <div style={{ padding: '12px 14px', fontSize: 14, lineHeight: 1.4 }}>
                    {item.caption}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}