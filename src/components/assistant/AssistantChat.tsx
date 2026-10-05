import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const EXAMPLES = ['Когда ближайшее окно?', 'Сколько стоит полировка?', 'Как найти студию?'];

type Msg = { role: 'user' | 'assistant'; content: string };

export function AssistantChat({ tenantId }: { tenantId: string }) {
  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: 'user', content: text };
    setHistory((h) => [...h, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('assistant', {
        body: { tenantId, message: text, history: [...history, userMsg] }
      });
      if (error) throw error;
      setHistory((h) => [...h, { role: 'assistant', content: data?.reply ?? 'Нет ответа' }]);
    } catch (e: any) {
      setHistory((h) => [...h, { role: 'assistant', content: 'Ошибка: ' + e.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {EXAMPLES.map((q) => (
          <button key={q} onClick={() => send(q)} className="input"
            style={{ width: 'auto', padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>
            {q}
          </button>
        ))}
      </div>
      <div style={{
        minHeight: 120, maxHeight: 320, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 8,
        padding: 12, borderRadius: 12,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {history.length === 0 && <span style={{ opacity: 0.5, fontSize: 14 }}>Задайте вопрос…</span>}
        {history.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            padding: '8px 12px',
            borderRadius: 12,
            background: m.role === 'user' ? '#4690FF' : 'rgba(255,255,255,0.08)',
            fontSize: 14,
            whiteSpace: 'pre-wrap'
          }}>{m.content}</div>
        ))}
        {loading && <span style={{ opacity: 0.5, fontSize: 13 }}>Печатает…</span>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }}
        style={{ display: 'flex', gap: 8 }}>
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ваш вопрос…" />
        <button className="btn-primary" type="submit" disabled={loading}>Отправить</button>
      </form>
    </div>
  );
}
