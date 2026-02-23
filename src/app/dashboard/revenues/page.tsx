'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getCurrentPeriod, getMonthName } from '@/lib/format';

interface RevenueItem {
  id: string;
  description: string;
  valueCents: number;
  valueReais: number;
  grossProfitReais: number;
  date: string;
  type: string;
  client?: string;
  costReais?: number;
}

const TYPE_LABELS: Record<string, string> = { OWN: 'Própria', OUTSOURCED: 'Terceirizada' };

export default function RevenuesPage() {
  const [revenues, setRevenues] = useState<RevenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(getCurrentPeriod);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [desc, setDesc] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('OWN');
  const [client, setClient] = useState('');
  const [cost, setCost] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<RevenueItem[]>(
        `/api/revenues?year=${period.year}&month=${period.month}`
      );
      setRevenues(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/api/revenues', {
        method: 'POST',
        body: {
          description: desc,
          valueCents: Math.round(parseFloat(value) * 100),
          date,
          type,
          client: client || undefined,
          costCents: cost ? Math.round(parseFloat(cost) * 100) : undefined,
        },
      });
      setShowForm(false);
      resetForm();
      fetchData();
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta receita?')) return;
    await api(`/api/revenues/${id}`, { method: 'DELETE' });
    fetchData();
  }

  function resetForm() {
    setDesc(''); setValue(''); setDate(''); setType('OWN'); setClient(''); setCost('');
  }

  function changeMonth(d: number) {
    setPeriod(p => {
      let m = p.month + d, y = p.year;
      if (m > 12) { m = 1; y++; } if (m < 1) { m = 12; y--; }
      return { year: y, month: m };
    });
  }

  const total = revenues.reduce((s, r) => s + r.valueReais, 0);

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Receitas</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Total: <strong style={{ color: 'var(--success)' }}>{formatCurrency(total)}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
            <button onClick={() => changeMonth(-1)} className="btn btn-ghost btn-sm">←</button>
            <span style={{ minWidth: '120px', textAlign: 'center', fontWeight: 600, fontSize: '13px', textTransform: 'capitalize' }}>{getMonthName(period.month)} {period.year}</span>
            <button onClick={() => changeMonth(1)} className="btn btn-ghost btn-sm">→</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Nova Receita</button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content animate-fadeIn" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Nova Receita</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '14px' }}>
                <label className="input-label">Descrição *</label>
                <input className="input" value={desc} onChange={e => setDesc(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="input-label">Valor (R$) *</label>
                  <input className="input" type="number" step="0.01" min="0.01" value={value} onChange={e => setValue(e.target.value)} required />
                </div>
                <div>
                  <label className="input-label">Data *</label>
                  <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="input-label">Tipo</label>
                  <select className="input" value={type} onChange={e => setType(e.target.value)}>
                    <option value="OWN">Própria</option>
                    <option value="OUTSOURCED">Terceirizada</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Cliente</label>
                  <input className="input" value={client} onChange={e => setClient(e.target.value)} />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label className="input-label">Custo (R$)</label>
                <input className="input" type="number" step="0.01" min="0" value={cost} onChange={e => setCost(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ margin: '0 auto 12px' }} /> Carregando...
          </div>
        ) : revenues.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '14px' }}>Nenhuma receita neste período</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => setShowForm(true)}>
              + Adicionar Receita
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Lucro Bruto</th>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Cliente</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {revenues.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.description}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>{formatCurrency(r.valueReais)}</td>
                    <td>{formatCurrency(r.grossProfitReais)}</td>
                    <td>{formatDate(r.date)}</td>
                    <td><span className={`badge ${r.type === 'OWN' ? 'badge-success' : 'badge-warning'}`}>{TYPE_LABELS[r.type]}</span></td>
                    <td>{r.client || '—'}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
