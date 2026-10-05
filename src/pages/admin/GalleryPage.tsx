import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTenant } from '@/hooks/useTenant';
import {
  useGallery,
  useAddGalleryItem,
  useUpdateGalleryImage,
  useUpdateGalleryCaption,
  useDeleteGalleryItem,
  type GalleryItem,
} from '@/hooks/useGallery';
import { uploadTenantImage } from '@/lib/storage';
import { Plus, Pencil, Trash, UploadSimple, Check, X } from '@phosphor-icons/react';

export function AdminGalleryPage() {
  const { slug = '' } = useParams();
  const { data: tenant } = useTenant(slug);
  const { data: items = [], isLoading } = useGallery(tenant?.id);
  const addItem = useAddGalleryItem();
  const updateImage = useUpdateGalleryImage();
  const updateCaption = useUpdateGalleryCaption();
  const deleteItem = useDeleteGalleryItem();

  const [editingCaptionFor, setEditingCaptionFor] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState('');
  const [uploadingFor, setUploadingFor] = useState<string | 'new' | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  if (!tenant) return <div style={{ padding: 40, opacity: 0.6 }}>Загрузка…</div>;

  async function handleAddFile(file: File) {
    try {
      setUploadingFor('new');
      const url = await uploadTenantImage(slug, file, 'gallery');
      const nextOrder =
        items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) + 1 : 0;
      await addItem.mutateAsync({
        tenant_id: tenant!.id,
        image_url: url,
        caption: null,
        sort_order: nextOrder,
      });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploadingFor(null);
      if (addInputRef.current) addInputRef.current.value = '';
    }
  }

  async function handleReplaceFile(item: GalleryItem, file: File) {
    try {
      setUploadingFor(item.id);
      const url = await uploadTenantImage(slug, file, 'gallery');
      await updateImage.mutateAsync({ id: item.id, image_url: url });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploadingFor(null);
    }
  }

  function startEditCaption(item: GalleryItem) {
    setEditingCaptionFor(item.id);
    setCaptionDraft(item.caption ?? '');
  }

  function cancelEditCaption() {
    setEditingCaptionFor(null);
    setCaptionDraft('');
  }

  async function saveCaption(item: GalleryItem) {
    const value = captionDraft.trim();
    await updateCaption.mutateAsync({ id: item.id, caption: value || null });
    cancelEditCaption();
  }

  return (
    <div style={{ display: 'grid', gap: 28, maxWidth: 960 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Галерея работ
          </h1>
          <p style={{ opacity: 0.5, margin: '8px 0 0', fontSize: 13 }}>
            Всего: {items.length} · показываются на главной странице
          </p>
        </div>

        <input
          ref={addInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleAddFile(file);
          }}
        />
        <button
          onClick={() => addInputRef.current?.click()}
          disabled={uploadingFor === 'new'}
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
            cursor: uploadingFor === 'new' ? 'not-allowed' : 'pointer',
            opacity: uploadingFor === 'new' ? 0.6 : 1,
            boxShadow: '0 4px 20px rgba(70,144,255,0.3)',
          }}
        >
          <Plus size={16} weight="bold" />
          {uploadingFor === 'new' ? 'Загружаем…' : 'Добавить работу'}
        </button>
      </div>

      {isLoading && <div style={{ opacity: 0.5 }}>Загрузка…</div>}

      {!isLoading && items.length === 0 && (
        <div
          style={{
            padding: 48,
            textAlign: 'center',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.1)',
            opacity: 0.7,
          }}
        >
          <UploadSimple size={40} weight="duotone" color="#4690FF" />
          <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600 }}>
            Работ пока нет
          </div>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.6 }}>
            Нажмите «Добавить работу», чтобы загрузить первое фото
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {items.map((item) => (
            <GalleryCard
              key={item.id}
              item={item}
              uploading={uploadingFor === item.id}
              editingCaption={editingCaptionFor === item.id}
              captionDraft={captionDraft}
              onCaptionDraftChange={setCaptionDraft}
              onStartEditCaption={() => startEditCaption(item)}
              onCancelEditCaption={cancelEditCaption}
              onSaveCaption={() => saveCaption(item)}
              onReplaceFile={(file) => handleReplaceFile(item, file)}
              onDelete={() => {
                if (confirm('Удалить эту работу из галереи?')) {
                  deleteItem.mutate({ id: item.id });
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryCard({
  item,
  uploading,
  editingCaption,
  captionDraft,
  onCaptionDraftChange,
  onStartEditCaption,
  onCancelEditCaption,
  onSaveCaption,
  onReplaceFile,
  onDelete,
}: {
  item: GalleryItem;
  uploading: boolean;
  editingCaption: boolean;
  captionDraft: string;
  onCaptionDraftChange: (v: string) => void;
  onStartEditCaption: () => void;
  onCancelEditCaption: () => void;
  onSaveCaption: () => void;
  onReplaceFile: (file: File) => void;
  onDelete: () => void;
}) {
  const replaceInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      style={{
        borderRadius: 16,
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '4/3',
          backgroundImage: `url(${item.image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#111',
        }}
      >
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

      <div style={{ padding: 14, display: 'grid', gap: 10, flex: 1 }}>
        {editingCaption ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              className="input"
              value={captionDraft}
              onChange={(e) => onCaptionDraftChange(e.target.value)}
              placeholder="Подпись к фото"
              autoFocus
              style={{ padding: '8px 12px', fontSize: 13 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveCaption();
                if (e.key === 'Escape') onCancelEditCaption();
              }}
            />
            <button
              onClick={onSaveCaption}
              style={iconBtn('rgba(16,185,129,0.9)')}
              title="Сохранить"
            >
              <Check size={16} weight="bold" />
            </button>
            <button
              onClick={onCancelEditCaption}
              style={iconBtn('rgba(255,255,255,0.15)')}
              title="Отмена"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        ) : (
          <div
            onClick={onStartEditCaption}
            style={{
              fontSize: 13,
              lineHeight: 1.4,
              minHeight: 20,
              cursor: 'pointer',
              padding: '4px 0',
              color: item.caption
                ? 'rgba(255,255,255,0.9)'
                : 'rgba(255,255,255,0.4)',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#7db4ff')}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = item.caption
                ? 'rgba(255,255,255,0.9)'
                : 'rgba(255,255,255,0.4)')
            }
          >
            {item.caption || 'Нажмите, чтобы добавить подпись'}
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
          <input
            ref={replaceInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onReplaceFile(file);
              if (replaceInputRef.current) replaceInputRef.current.value = '';
            }}
          />
          <button
            onClick={() => replaceInputRef.current?.click()}
            disabled={uploading}
            style={smallBtn}
          >
            <UploadSimple size={14} weight="bold" />
            Заменить
          </button>
          <button onClick={onStartEditCaption} style={smallBtn}>
            <Pencil size={14} weight="bold" />
            Подпись
          </button>
          <button
            onClick={onDelete}
            style={{ ...smallBtn, color: '#f87171', marginLeft: 'auto' }}
            title="Удалить"
          >
            <Trash size={14} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

const smallBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '6px 10px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
};

function iconBtn(bg: string): React.CSSProperties {
  return {
    width: 36,
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: bg,
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    cursor: 'pointer',
    flexShrink: 0,
  };
}