import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useTenant } from '@/hooks/useTenant';
import { useServices } from '@/hooks/useServices';
import { useGallery } from '@/hooks/useGallery';
import { HeroSection } from '@/components/home/HeroSection';
import { InfoCards } from '@/components/home/InfoCards';
import { GallerySection } from '@/components/home/GallerySection';
import { FadeIn } from '@/components/ui/FadeIn';
import { BottomNav } from '@/components/layout/BottomNav';
import { AssistantChat } from '@/components/assistant/AssistantChat';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export function HomePage() {
  const { slug = '' } = useParams();
  const { data: tenant, isLoading } = useTenant(slug);
  const { data: services } = useServices(tenant?.id);
  const { data: gallery = [] } = useGallery(tenant?.id);
  const { data: cards = [] } = useQuery({
    queryKey: ['info-cards', tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('info_cards')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tenant?.id,
  });

  if (isLoading) return <LoadingScreen fullHeight label="Загрузка студии" />;
  if (!tenant) return <LoadingScreen fullHeight label="Студия не найдена" />;

  return (
    <div className="page">
      <HeroSection tenant={tenant} heroImage={tenant.hero_image_url} />
      <InfoCards cards={cards} />

      <section className="section">
        <div className="container">
          <FadeIn>
            <h2 className="section__title">Услуги</h2>
          </FadeIn>
          <div style={{ display: 'grid', gap: 12 }}>
            {services?.map((s, i) => (
              <FadeIn key={s.id} delay={i * 60}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 16,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 13, opacity: 0.6 }}>
                      {s.duration_minutes} мин
                    </div>
                  </div>
                  <div style={{ color: '#4690FF', fontWeight: 700 }}>{s.price} ₽</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <GallerySection items={gallery} />

      <section className="section">
        <div className="container">
          <FadeIn>
            <h2 className="section__title">Помощник</h2>
          </FadeIn>
          <AssistantChat tenant={tenant} services={services ?? []} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <FadeIn>
            <h2 className="section__title">Контакты</h2>
            <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
              {tenant.address}
              <br />
              {tenant.phone}
            </p>
          </FadeIn>
        </div>
      </section>

      <BottomNav slug={slug} />
    </div>
  );
}