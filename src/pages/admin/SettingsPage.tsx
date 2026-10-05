import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTenant, useUpdateTenant, type Tenant } from '@/hooks/useTenant';
import { useInfoCards, useSaveInfoCards, type InfoCard } from '@/hooks/useInfoCards';
import { uploadTenantImage } from '@/lib/storage';
import {
  UploadSimple,
  CheckCircle,
  Storefront,
  Clock,
  Image as ImageIcon,
  TextAa,
} from '@phosphor-icons/react';

type Tab = 'main' | 'hours' | 'photos' | 'cards';

const DAYS: { num: string; label: string; short: string }[] = [
  { num: '1', label: 'Понедельник', short: 'Пн' },
  { num: '2', label: 'Вторник', short: 'Вт' },
  { num: '3', label: 'Среда', short: 'Ср' },
  { num: '4', label: 'Четверг', short: 'Чт' },
  { num: '5', label: 'Пятница', short: 'Пт' },
  { num: '6', label: 'Суббота', short: 'Сб' },
  { num: '7', label: 'Воскресенье', short: 'Вс' },
];

const TIMEZONES = [
  { value: 'Europe/Kaliningrad', label: 'Калининград (UTC+2)' },
  { value: 'Europe/Moscow', label: 'Москва (UTC+3)' },
  { value: 'Europe/Samara', label: 'Самара (UTC+4)' },
  { value: 'Asia/Yekaterinburg', label: 'Екатеринбург (UTC+5)' },
  { value: 'Asia/Omsk', label: 'Омск (UTC+6)' },
  { value: 'Asia/Krasnoyarsk', label: 'Красноярск (UTC+7)' },
  { value: 'Asia/Irkutsk', label: 'Иркутск (UTC+8)' },
  { value: 'Asia/Yakutsk', label: 'Якутск (UTC+9)' },
  { value: 'Asia/Vladivostok', label: 'Владивосток (UTC+10)' },
  { value: 'Asia/Magadan', label: 'Магадан (UTC+11)' },
  { value: 'Asia/Kamchatka', label: 'Камчатка (UTC+12)' },
];

export function AdminSettingsPage() {
  const { slug = '' } = useParams();
  const { data: tenant } = useTenant(slug);
  const [tab, setTab] = useState<Tab>('main');

  if (!tenant) return <div style={{ padding: 40, opacity: 0.6 }}>Загрузка…</div>;

  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 900 }}>
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Настройки студии
        </h1>
        <p style={{ opacity: 0.5, margin: '8px 0 0', fontSize: 13 }}>
          {tenant.name}
        </p>
      </div>

      <Tabs value={tab} onChange={setTab} />

      {tab === 'main' && <MainTab tenant={tenant} />}
      {tab === 'hours' && <HoursTab tenant={tenant} />}
      {tab === 'photos' && <PhotosTab tenant={tenant} slug={slug} />}
      {tab === 'cards' && <CardsTab tenant={tenant} />}
    </div>
  );
}

function Tabs({ value, onChange }: { value: Tab; onChange: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'main', label: 'Основное', icon: <Storefront size={16} weight="bold" /> },
    { id: 'hours', label: 'Часы работы', icon: <Clock size={16} weight="bold" /> },
    { id: 'photos', label: 'Фото', icon: <ImageIcon size={16} weight="bold" /> },
    { id: 'cards', label: 'Инфо-карточки', icon: <TextAa size={16} weight="bold" /> },
  ];
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        padding: 6,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {items.map((it) => {
        const active = value === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              background: active ? 'rgba(70,144,255,0.15)' : 'transparent',
              border: `1px solid ${active ? 'rgba(70,144,255,0.35)' : 'transparent'}`,
              borderRadius: 10,
              color: active ? '#7db4ff' : 'rgba(255,255,255,0.7)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {it.icon}
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   Таб 1. Основное
   ============================================================ */
function MainTab({ tenant }: { tenant: Tenant }) {
  const update = useUpdateTenant();
  const [name, setName] = useState(tenant.name);
  const [description, setDescription] = useState(tenant.description ?? '');
  const [address, setAddress] = useState(tenant.address ?? '');
  const [phone, setPhone] = useState(tenant.phone ?? '');
  const [timezone, setTimezone] = useState(tenant.timezone);

  useEffect(() => {
    setName(tenant.name);
    setDescription(tenant.description ?? '');
    setAddress(tenant.address ?? '');
    setPhone(tenant.phone ?? '');
    setTimezone(tenant.timezone);
  }, [tenant.id]);

  function save() {
    update.mutate({
      id: tenant.id,
      name,
      description,
      address,
      phone,
      timezone,
    });
  }

  return (
    <div style={cardStyle}>
      <Field label="НАЗВАНИЕ">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <Field label="КРАТКОЕ ОПИСАНИЕ">
        <textarea
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Например: Детейлинг и полировка в центре города"
          style={{ resize: 'vertical', fontFamily: 'inherit' }}
        />
      </Field>

      <Field label="АДРЕС">
        <input
          className="input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="г. Москва, ул. Примерная, 1"
        />
      </Field>

      <Field label="ТЕЛЕФОН">
        <input
          className="input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+7 (999) 123-45-67"
        />
      </Field>

      <Field label="ЧАСОВОЙ ПОЯС">
        <select
          className="input"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value} style={{ background: '#0a0a0a' }}>
              {tz.label}
            </option>
          ))}
        </select>
      </Field>

      <SaveRow saving={update.isPending} onSave={save} />
    </div>
  );
}

/* ============================================================
   Таб 2. Часы работы
   ============================================================ */
function HoursTab({ tenant }: { tenant: Tenant }) {
  const update = useUpdateTenant();
  const [hours, setHours] = useState(tenant.working_hours ?? {});

  useEffect(() => {
    setHours(tenant.working_hours ?? {});
  }, [tenant.id]);

  function setDay(num: string, value: { start: string; end: string } | null) {
    setHours((h) => ({ ...h, [num]: value }));
  }

  function save() {
    update.mutate({ id: tenant.id, working_hours: hours });
  }

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 13, opacity: 0.55, marginBottom: 4 }}>
        Отметьте рабочие дни и укажите часы. Выходные отмечены отдельно.
      </div>

      {DAYS.map((d) => {
        const value = hours[d.num];
        const isWorking = !!value;
        return (
          <div
            key={d.num}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 12,
              background: isWorking ? 'rgba(70,144,255,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isWorking ? 'rgba(70,144,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                minWidth: 120,
                fontSize: 14,
                fontWeight: 600,
                color: isWorking ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            >
              {d.label}
            </div>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={isWorking}
                onChange={(e) =>
                  setDay(d.num, e.target.checked ? { start: '09:00', end: '20:00' } : null)
                }
                style={{ accentColor: '#4690FF', width: 16, height: 16 }}
              />
              {isWorking ? 'работаем' : 'выходной'}
            </label>

            {isWorking && value && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                <input
                  className="input"
                  type="time"
                  value={value.start}
                  onChange={(e) => setDay(d.num, { ...value, start: e.target.value })}
                  style={{ width: 110, padding: '8px 12px' }}
                />
                <span style={{ opacity: 0.5 }}>—</span>
                <input
                  className="input"
                  type="time"
                  value={value.end}
                  onChange={(e) => setDay(d.num, { ...value, end: e.target.value })}
                  style={{ width: 110, padding: '8px 12px' }}
                />
              </div>
            )}
          </div>
        );
      })}

      <SaveRow saving={update.isPending} onSave={save} />
    </div>
  );
}

/* ============================================================
   Таб 3. Фото
   ============================================================ */
function PhotosTab({ tenant, slug }: { tenant: Tenant; slug: string }) {
  const update = useUpdateTenant();
  const [heroUrl, setHeroUrl] = useState(tenant.hero_image_url ?? '');
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url ?? '');
  const [uploading, setUploading] = useState<'hero' | 'logo' | null>(null);

  useEffect(() => {
    setHeroUrl(tenant.hero_image_url ?? '');
    setLogoUrl(tenant.logo_url ?? '');
  }, [tenant.id, tenant.hero_image_url, tenant.logo_url]);

  async function handleUpload(kind: 'hero' | 'logo', file: File) {
    try {
      setUploading(kind);
      const url = await uploadTenantImage(slug, file, kind);
      console.log('[photos] URL получен, пишем в БД:', url);

      const patch =
        kind === 'hero'
          ? { id: tenant.id, hero_image_url: url }
          : { id: tenant.id, logo_url: url };

      await update.mutateAsync(patch);
      console.log('[photos] успешно сохранено');

      if (kind === 'hero') setHeroUrl(url);
      else setLogoUrl(url);
    } catch (err) {
      console.error('[photos] ошибка:', err);
      alert('Ошибка загрузки: ' + (err as Error).message);
    } finally {
      setUploading(null);
    }
  }

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 13, opacity: 0.55, marginBottom: 4 }}>
        Логотип и главное фото. Нажмите на область — выберите файл. Максимум 5 МБ.
      </div>

      <Field label="ГЛАВНОЕ ФОТО (1920 × 1080)">
        <UploadBox
          url={heroUrl}
          uploading={uploading === 'hero'}
          aspect="16/9"
          onSelect={(file) => handleUpload('hero', file)}
          hint="Фон на главной странице"
        />
      </Field>

      <Field label="ЛОГОТИП (512 × 512)">
        <UploadBox
          url={logoUrl}
          uploading={uploading === 'logo'}
          aspect="1/1"
          maxWidth={200}
          onSelect={(file) => handleUpload('logo', file)}
          hint="Показывается рядом с названием"
        />
      </Field>
    </div>
  );
}

function UploadBox({
  url,
  uploading,
  aspect,
  maxWidth,
  onSelect,
  hint,
}: {
  url: string;
  uploading: boolean;
  aspect: string;
  maxWidth?: number;
  onSelect: (file: File) => void;
  hint: string;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) onSelect(file);
      }}
      style={{
        position: 'relative',
        aspectRatio: aspect,
        maxWidth: maxWidth,
        width: '100%',
        borderRadius: 16,
        backgroundImage: url ? `url(${url})` : 'none',
        backgroundColor: 'rgba(255,255,255,0.04)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: `1px dashed ${dragOver ? '#4690FF' : 'rgba(255,255,255,0.15)'}`,
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'border-color 0.15s ease',
      }}
      onClick={() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) onSelect(file);
        };
        input.click();
      }}
    >
      {!url && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: 'rgba(255,255,255,0.5)',
            fontSize: 13,
          }}
        >
          <UploadSimple size={28} weight="bold" />
          <span>Нажмите или перетащите</span>
          <span style={{ fontSize: 11, opacity: 0.7 }}>{hint}</span>
        </div>
      )}

      {url && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.75) 100%)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: 12,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: '#fff',
              fontWeight: 500,
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            Нажмите, чтобы заменить
          </span>
        </div>
      )}

      {uploading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            color: '#7db4ff',
            fontWeight: 600,
          }}
        >
          Загружаем…
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Таб 4. Инфо-карточки
   ============================================================ */
function CardsTab({ tenant }: { tenant: Tenant }) {
  const { data: cards = [], isLoading } = useInfoCards(tenant.id);
  const save = useSaveInfoCards();
  const [local, setLocal] = useState<InfoCard[]>([]);

  useEffect(() => {
    setLocal(cards);
  }, [cards]);

  function update(idx: number, key: 'title' | 'text', value: string) {
    setLocal((c) => c.map((x, i) => (i === idx ? { ...x, [key]: value } : x)));
  }

  if (isLoading) return <div style={cardStyle}>Загрузка карточек…</div>;

  if (local.length === 0) {
    return (
      <div style={cardStyle}>
        <div style={{ opacity: 0.6, fontSize: 14 }}>
          Информационные карточки ещё не созданы. Добавьте их через SQL или отредактируйте
          студию заново.
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 13, opacity: 0.55, marginBottom: 4 }}>
        Три карточки, которые показываются на главной странице. Максимум 3.
      </div>

      {local.map((c, i) => (
        <div
          key={c.id}
          style={{
            padding: 16,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'grid',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.4, fontWeight: 600, letterSpacing: '0.05em' }}>
            КАРТОЧКА {i + 1}
          </div>
          <Field label="ЗАГОЛОВОК">
            <input
              className="input"
              value={c.title}
              onChange={(e) => update(i, 'title', e.target.value)}
              placeholder="Опыт 10 лет"
            />
          </Field>
          <Field label="ТЕКСТ">
            <input
              className="input"
              value={c.text}
              onChange={(e) => update(i, 'text', e.target.value)}
              placeholder="Более 5000 довольных клиентов"
            />
          </Field>
        </div>
      ))}

      <SaveRow saving={save.isPending} onSave={() => save.mutate({ cards: local })} />
    </div>
  );
}

/* ============================================================
   Вспомогательные компоненты
   ============================================================ */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          fontSize: 12,
          opacity: 0.55,
          display: 'block',
          marginBottom: 8,
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SaveRow({ saving, onSave }: { saving: boolean; onSave: () => void }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saving) return;
    setSaved(false);
    const t = setTimeout(() => setSaved(true), 500);
    return () => clearTimeout(t);
  }, [saving]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
        paddingTop: 8,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        marginTop: 8,
      }}
    >
      {saved && !saving && (
        <span
          style={{
            fontSize: 13,
            color: '#34d399',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <CheckCircle size={16} weight="bold" />
          Сохранено
        </span>
      )}
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          padding: '12px 24px',
          background: '#4690FF',
          border: 'none',
          borderRadius: 12,
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.6 : 1,
          boxShadow: '0 4px 16px rgba(70,144,255,0.25)',
        }}
      >
        {saving ? 'Сохраняем…' : 'Сохранить'}
      </button>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 24,
  borderRadius: 18,
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.08)',
  display: 'grid',
  gap: 16,
};