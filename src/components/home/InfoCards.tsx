import { FadeIn } from '@/components/ui/FadeIn';

export interface InfoCard {
  id: string;
  title: string;
  text: string;
  sort_order: number;
}

export function InfoCards({ cards }: { cards: InfoCard[] }) {
  if (!cards.length) return null;
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {cards.map((c, i) => (
            <FadeIn key={c.id} delay={i * 80}>
              <div style={{
                padding: 20,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 17 }}>{c.title}</h3>
                <p style={{ margin: 0, opacity: 0.75, fontSize: 14, lineHeight: 1.5 }}>{c.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
