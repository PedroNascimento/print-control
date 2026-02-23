'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getCurrentPeriod, getMonthName } from '@/lib/format';

interface ExpenseItem {
  id: string;
  description: string;
  valueCents: number;
  valueReais: number;
  date: string;
  category: string;
  type: string;
  paymentMethod?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  SUPPLIES: 'Insumos', MAINTENANCE: 'Manutenção', ENERGY: 'Energia',
  OUTSOURCING: 'Terceirização', OTHER: 'Outros',
};
const TYPE_LABELS: Record<string, string> = { OPERATIONAL: 'Operacional', OUTSOURCED: 'Terceirizada' };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(getCurrentPeriod);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [desc, setDesc] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('SUPPLIES');
  const [type, setType] = useState('OPERATIONAL');
  const [payment, setPayment] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<ExpenseItem[]>(
        `/api/expenses?year=${period.year}&month=${period.month}`
      );
      setExpenses(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/api/expenses', {
        method: 'POST',
        body: {
          description: desc,
          valueCents: Math.round(parseFloat(value) * 100),
          date,
          category,
          type,
          paymentMethod: payment || undefined,
        },
      });
      setShowForm(false);
      resetForm();
      fetchData();
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta despesa?')) return;
    await api(`/api/expenses/${id}`, { method: 'DELETE' });
    fetchData();
  }

  function resetForm() { setDesc(''); setValue(''); setDate(''); setCategory('SUPPLIES'); setType('OPERATIONAL'); setPayment(''); }

  function changeMonth(d: number) {
    setPeriod(p => {
      let m = p.month + d, y = p.year;
      if (m > 12) { m = 1; y++; } if (m < 1) { m = 12; y--; }
      return { year: y, month: m };
    });
  }

  const total = expenses.reduce((s, e) => s + e.valueReais, 0);

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Despesas</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Total: <strong style={{ color: 'var(--danger)' }}>{formatCurrency(total)}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
            <button onClick={() => changeMonth(-1)} className="btn btn-ghost btn-sm">←</button>
            <span style={{ minWidth: '120px', textAlign: 'center', fontWeight: 600, fontSize: '13px', textTransform: 'capitalize' }}>{getMonthName(period.month)} {period.year}</span>
            <button onClick={() => changeMonth(1)} className="btn btn-ghost btn-sm">→</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Nova Despesa</button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content animate-fadeIn" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Nova Despesa</h2>
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
                  <label className="input-label">Categoria</label>
                  <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="SUPPLIES">Insumos</option>
                    <option value="MAINTENANCE">Manutenção</option>
                    <option value="ENERGY">Energia</option>
                    <option value="OUTSOURCING">Terceirização</option>
                    <option value="OTHER">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Tipo</label>
                  <select className="input" value={type} onChange={e => setType(e.target.value)}>
                    <option value="OPERATIONAL">Operacional</option>
                    <option value="OUTSOURCED">Terceirizada</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label className="input-label">Forma de Pagamento</label>
                <input className="input" value={payment} onChange={e => setPayment(e.target.value)} placeholder="Ex: Pix, Cartão..." />
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

      <div className="card">
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ margin: '0 auto 12px' }} /> Carregando...
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '14px' }}>Nenhuma despesa neste período</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => setShowForm(true)}>
              + Adicionar Despesa
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Pagamento</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{e.description}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{formatCurrency(e.valueReais)}</td>
                    <td>{formatDate(e.date)}</td>
                    <td><span className="badge badge-info">{CATEGORY_LABELS[e.category] || e.category}</span></td>
                    <td>{TYPE_LABELS[e.type] || e.type}</td>
                    <td>{e.paymentMethod || '—'}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>✕</button>
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
