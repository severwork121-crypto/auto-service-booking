import { useParams } from 'react-router-dom';
import { useTenant } from '@/hooks/useTenant';
import { useServices } from '@/hooks/useServices';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { BottomNav } from '@/components/layout/BottomNav';

export function ServicesPage() {
  const { slug = '' } = useParams();
  const { data: tenant } = useTenant(slug);
  const { data: services = [] } = useServices(tenant?.id);

  if (!tenant) return <div className="container" style={{ padding: 40 }}>Загрузка…</div>;

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32 }}>
        <h1 className="section__title">Запись в студию</h1>
        <BookingWizard tenant={tenant} services={services} />
      </div>
      <BottomNav slug={slug} />
    </div>
  );
}
