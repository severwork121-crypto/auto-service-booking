import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTenant } from '@/hooks/useTenant';
import {
  useAllServices,
  useCreateService,
  useUpdateService,
  useToggleServiceActive,
  type Service,
} from '@/hooks/useServices';
import { Plus, Pencil, Archive, ArrowCounterClockwise, Clock, Wrench } from '@phosphor-icons/react';

interface FormState {
  name: string;
  price: string;
  duration_minutes: string;
  prep_time_minutes: string;
  bay_count: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  price: '',
  duration_minutes: '120',
  prep_time_minutes: '15',
  bay_count: '1',
};

function toForm(s: Service): FormState {
  return {
    name: s.name,
    price: String(s.price),
    duration_minutes: String(s.duration_minutes),
    prep_time_minutes: String(s.prep_time_minutes),
    bay_count: String(s.bay_count),
  };
}

export function AdminServicesPage() {
  const { slug = '' } = useParams();
  const { data: tenant } = useTenant(slug);
  const { data: services = [], isLoading } = useAllServices(tenant?.id);
  const createService = useCreateService();
  const updateService = useUpdateService();
  const toggleActive = useToggleServiceActive();

  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);

  const activeServices = services.filter((s) => s.is_active);
  const archivedServices = services.filter((s) => !s.is_active);

  if (!tenant) return <div style={{ padding: 40, opacity: 0.6 }}>Загрузка…</div>;

  return (
    <div style={{ display: 'grid', gap: 32, maxWidth: 960 }}>
      {/* Заголовок */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Услуги и цены
          </h1>
          <p style={{ opacity: 0.5, margin: '8px 0 0', fontSize: 13 }}>
            Активных: {activeServices.length} · в архиве: {archivedServices.length}
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            background: '#4690FF',
            border: 'none',
            borderRadius: 12,
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(70,144,255,0.3)',
          }}
        >
          <Plus size={16} weight="bold" />
          Добавить услугу
        </button>
      </div>

      {isLoading && <div style={{ opacity: 0.5 }}>Загрузка…</div>}

      {!isLoading && services.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.1)',
            opacity: 0.6,
            fontSize: 14,
          }}
        >
          Пока нет ни одной услуги. Нажмите «Добавить услугу».
        </div>
      )}

      {activeServices.length > 0 && (
        <section>
          <h2 style={{ fontSize: 13, opacity: 0.5, margin: '0 0 12px', fontWeight: 600 }}>
            АКТИВНЫЕ
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {activeServices.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                onEdit={() => setEditing(s)}
                onArchive={() => toggleActive.mutate({ id: s.id, is_active: false })}
              />
            ))}
          </div>
        </section>
      )}

      {archivedServices.length > 0 && (
        <section>
          <h2 style={{ fontSize: 13, opacity: 0.5, margin: '0 0 12px', fontWeight: 600 }}>
            АРХИВ
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {archivedServices.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                archived
                onEdit={() => setEditing(s)}
                onRestore={() => toggleActive.mutate({ id: s.id, is_active: true })}
              />
            ))}
          </div>
        </section>
      )}

      {editing && (
        <ServiceModal
          title="Редактировать услугу"
          initial={toForm(editing)}
          saving={updateService.isPending}
          onClose={() => setEditing(null)}
          onSave={(values) => {
            updateService.mutate(
              {
                id: editing.id,
                name: values.name,
                price: values.price,
                duration_minutes: values.duration_minutes,
                prep_time_minutes: values.prep_time_minutes,
                bay_count: values.bay_count,
              },
              { onSuccess: () => setEditing(null) }
            );
          }}
        />
      )}

      {creating && (
        <ServiceModal
          title="Новая услуга"
          initial={EMPTY_FORM}
          saving={createService.isPending}
          onClose={() => setCreating(false)}
          onSave={(values) => {
            createService.mutate(
              {
                tenant_id: tenant.id,
                ...values,
              },
              { onSuccess: () => setCreating(false) }
            );
          }}
        />
      )}
    </div>
  );
}

function ServiceCard({
  service,
  archived = false,
  onEdit,
  onArchive,
  onRestore,
}: {
  service: Service;
  archived?: boolean;
  onEdit: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
}) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.08)',
        opacity: archived ? 0.55 : 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: '1 1 260px', minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, letterSpacing: '-0.01em' }}>
          {service.name}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            fontSize: 13,
            opacity: 0.6,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Clock size={14} weight="bold" />
            {service.duration_minutes} мин
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Wrench size={14} weight="bold" />
            {service.bay_count} бокс{service.bay_count > 1 ? 'а' : ''}
          </span>
          {service.prep_time_minutes > 0 && (
            <span>подготовка {service.prep_time_minutes} мин</span>
          )}
        </div>
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: archived ? '#fff' : '#7db4ff',
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        {Number(service.price).toLocaleString('ru-RU')} ₽
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <SmallButton onClick={onEdit}>
          <Pencil size={16} weight="bold" />
          Изменить
        </SmallButton>
        {!archived && onArchive && (
          <SmallButton onClick={onArchive}>
            <Archive size={16} weight="bold" />
            В архив
          </SmallButton>
        )}
        {archived && onRestore && (
          <SmallButton onClick={onRestore} accent>
            <ArrowCounterClockwise size={16} weight="bold" />
            Вернуть
          </SmallButton>
        )}
      </div>
    </div>
  );
}

function SmallButton({
  children,
  onClick,
  accent = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        background: accent ? 'rgba(70,144,255,0.12)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${accent ? 'rgba(70,144,255,0.3)' : 'rgba(255,255,255,0.12)'}`,
        color: accent ? '#7db4ff' : '#fff',
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

function ServiceModal({
  title,
  initial,
  saving,
  onClose,
  onSave,
}: {
  title: string;
  initial: FormState;
  saving: boolean;
  onClose: () => void;
  onSave: (values: {
    name: string;
    price: number;
    duration_minutes: number;
    prep_time_minutes: number;
    bay_count: number;
  }) => void;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function save() {
    setError(null);

    const name = form.name.trim();
    const price = Number(form.price);
    const duration = Number(form.duration_minutes);
    const prep = Number(form.prep_time_minutes);
    const bays = Number(form.bay_count);

    if (name.length < 2) {
      setError('Введите название услуги (минимум 2 символа)');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError('Цена должна быть больше нуля');
      return;
    }
    if (!Number.isFinite(duration) || duration < 15) {
      setError('Длительность должна быть не меньше 15 минут');
      return;
    }
    if (!Number.isFinite(prep) || prep < 0) {
      setError('Время на подготовку не может быть отрицательным');
      return;
    }
    if (!Number.isFinite(bays) || bays < 1) {
      setError('Количество боксов должно быть не меньше 1');
      return;
    }

    onSave({
      name,
      price,
      duration_minutes: duration,
      prep_time_minutes: prep,
      bay_count: bays,
    });
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 20,
          background: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: 24,
          display: 'grid',
          gap: 18,
          margin: 'auto',
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h2>

        {/* Название */}
        <div>
          <label style={labelStyle}>НАЗВАНИЕ</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Например, Полировка кузова"
            autoFocus
          />
        </div>

        {/* Цена */}
        <div>
          <label style={labelStyle}>ЦЕНА, ₽</label>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            placeholder="8000"
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {[1000, 3000, 5000, 8000, 15000, 25000].map((v) => (
              <button
                key={v}
                onClick={() => update('price', String(v))}
                style={chipStyle}
              >
                {v.toLocaleString('ru-RU')}
              </button>
            ))}
          </div>
        </div>

        {/* Длительность */}
        <div>
          <label style={labelStyle}>ДЛИТЕЛЬНОСТЬ, МИНУТ</label>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            value={form.duration_minutes}
            onChange={(e) => update('duration_minutes', e.target.value)}
            placeholder="240"
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {[30, 60, 120, 180, 240, 480].map((v) => (
              <button
                key={v}
                onClick={() => update('duration_minutes', String(v))}
                style={chipStyle}
              >
                {v < 60 ? `${v} мин` : `${v / 60} ч`}
              </button>
            ))}
          </div>
        </div>

        {/* Подготовка и боксы */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          <div>
            <label style={labelStyle}>ПОДГОТОВКА, МИН</label>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              value={form.prep_time_minutes}
              onChange={(e) => update('prep_time_minutes', e.target.value)}
              placeholder="15"
            />
          </div>
          <div>
            <label style={labelStyle}>БОКСОВ</label>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              value={form.bay_count}
              onChange={(e) => update('bay_count', e.target.value)}
              placeholder="1"
            />
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* Кнопки */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              flex: 1,
              padding: '14px 16px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Отмена
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{
              flex: 2,
              padding: '14px 16px',
              borderRadius: 12,
              background: '#4690FF',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.55,
  display: 'block',
  marginBottom: 8,
  fontWeight: 600,
  letterSpacing: '0.02em',
};

const chipStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 12,
  borderRadius: 8,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  cursor: 'pointer',
  opacity: 0.85,
};