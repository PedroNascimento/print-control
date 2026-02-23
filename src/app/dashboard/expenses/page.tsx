'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { formatCurrency, formatDate, getCurrentMonthRange, getLastNDays, getAllTimeRange, formatPeriodLabel } from '@/lib/format';

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

type FilterPreset = '7d' | '30d' | '90d' | 'month' | 'all' | 'custom';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [activeFilter, setActiveFilter] = useState<FilterPreset>('30d');
  const [dateRange, setDateRange] = useState(getLastNDays(30));
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const [desc, setDesc] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('SUPPLIES');
  const [type, setType] = useState('OPERATIONAL');
  const [payment, setPayment] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<ExpenseItem[]>(`/api/expenses?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      setExpenses(data);
    } catch (err) { console.error('Erro ao carregar despesas:', err); } finally { setLoading(false); }
  }, [dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function applyFilter(preset: FilterPreset) {
    setShowCustom(false);
    setActiveFilter(preset);
    switch (preset) {
      case '7d': setDateRange(getLastNDays(7)); break;
      case '30d': setDateRange(getLastNDays(30)); break;
      case '90d': setDateRange(getLastNDays(90)); break;
      case 'month': setDateRange(getCurrentMonthRange()); break;
      case 'all': setDateRange(getAllTimeRange()); break;
      case 'custom': setShowCustom(true); break;
    }
  }

  function applyCustomRange() {
    if (customStart && customEnd) {
      setDateRange({ startDate: customStart, endDate: customEnd });
      setActiveFilter('custom');
      setShowCustom(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api('/api/expenses', {
        method: 'POST',
        body: {
          description: desc,
          valueCents: Math.round(parseFloat(value) * 100),
          date, category, type,
          paymentMethod: payment || undefined,
        },
      });
      const created = new Date(date);
      const s = new Date(created); s.setDate(1);
      const eDate = new Date(s.getFullYear(), s.getMonth() + 1, 0);
      setDateRange({ startDate: `${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,'0')}-01`, endDate: `${eDate.getFullYear()}-${String(eDate.getMonth()+1).padStart(2,'0')}-${String(eDate.getDate()).padStart(2,'0')}` });
      setActiveFilter('custom');
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error('Erro ao salvar despesa:', err);
      if (err instanceof ApiError) { setError(err.message); }
      else { setError('Erro ao salvar despesa. Tente novamente.'); }
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta despesa?')) return;
    await api(`/api/expenses/${id}`, { method: 'DELETE' });
    fetchData();
  }

  function resetForm() { setDesc(''); setValue(''); setDate(''); setCategory('SUPPLIES'); setType('OPERATIONAL'); setPayment(''); }

  const total = expenses.reduce((s, e) => s + e.valueReais, 0);
  const weekTotal = expenses.filter(e => {
    const d = new Date(e.date); const now = new Date();
    const diffDays = (now.getTime() - d.getTime()) / (1000*60*60*24);
    return diffDays >= 0 && diffDays <= 7;
  }).reduce((s, e) => s + e.valueReais, 0);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Despesas</h1>
          <div className="header-stats">
            <div className="header-stat">
              <span className="header-stat-label">Período:</span>
              <span className="header-stat-value danger">{formatCurrency(total)}</span>
            </div>
            <div className="header-stat">
              <span className="header-stat-label">Semana:</span>
              <span className="header-stat-value danger">{formatCurrency(weekTotal)}</span>
            </div>
          </div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Nova Despesa</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-buttons">
          {([['7d','7 dias'],['30d','30 dias'],['90d','90 dias'],['month','Mês atual'],['all','Tudo']] as [FilterPreset, string][]).map(([key, label]) => (
            <button key={key} className={`filter-btn ${activeFilter === key ? 'active' : ''}`} onClick={() => applyFilter(key)}>{label}</button>
          ))}
          <button className={`filter-btn ${activeFilter === 'custom' ? 'active' : ''}`} onClick={() => applyFilter('custom')}>📅 Personalizado</button>
        </div>
        {showCustom && (
          <div className="filter-custom">
            <input type="date" className="input" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ maxWidth: '160px' }} />
            <span style={{ color: 'var(--text-muted)' }}>até</span>
            <input type="date" className="input" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ maxWidth: '160px' }} />
            <button className="btn btn-primary btn-sm" onClick={applyCustomRange}>Aplicar</button>
          </div>
        )}
        <div className="filter-period-label">{formatPeriodLabel(dateRange.startDate, dateRange.endDate)}</div>
      </div>

      {showForm && createPortal(
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            <h2>Nova Despesa</h2>
            <form onSubmit={handleCreate}>
              {error && (
                <div style={{ padding: '10px 14px', background: 'var(--danger-muted)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px', color: 'var(--danger)' }}>
                  {error}
                </div>
              )}
              <div className="form-group">
                <label className="input-label">Descrição *</label>
                <input className="input" value={desc} onChange={e => setDesc(e.target.value)} required autoFocus />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Valor (R$) *</label>
                  <input className="input" type="number" step="0.01" min="0.01" value={value} onChange={e => setValue(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="input-label">Data *</label>
                  <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Categoria</label>
                  <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="SUPPLIES">Insumos</option>
                    <option value="MAINTENANCE">Manutenção</option>
                    <option value="ENERGY">Energia</option>
                    <option value="OUTSOURCING">Terceirização</option>
                    <option value="OTHER">Outros</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="input-label">Tipo</label>
                  <select className="input" value={type} onChange={e => setType(e.target.value)}>
                    <option value="OPERATIONAL">Operacional</option>
                    <option value="OUTSOURCED">Terceirizada</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="input-label">Forma de Pagamento</label>
                <input className="input" value={payment} onChange={e => setPayment(e.target.value)} placeholder="Ex: Pix, Cartão..." />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
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
          <>
            <div className="table-container desktop-only">
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
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-card-list mobile-only">
              {expenses.map(e => (
                <div key={e.id} className="mobile-card">
                  <div className="mobile-card-header">
                    <div>
                      <div className="mobile-card-title">{e.description}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{formatDate(e.date)}</div>
                    </div>
                    <div className="mobile-card-value" style={{ color: 'var(--danger)' }}>
                      {formatCurrency(e.valueReais)}
                    </div>
                  </div>
                  
                  <div className="mobile-card-body">
                    <div className="mobile-card-item">
                      <span className="mobile-card-label">Categoria</span>
                      <span><span className="badge badge-info">{CATEGORY_LABELS[e.category] || e.category}</span></span>
                    </div>
                    <div className="mobile-card-item">
                      <span className="mobile-card-label">Tipo</span>
                      <span style={{ color: 'var(--text-primary)' }}>{TYPE_LABELS[e.type] || e.type}</span>
                    </div>
                    <div className="mobile-card-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="mobile-card-label">Pagamento</span>
                      <span style={{ color: 'var(--text-primary)' }}>{e.paymentMethod || '—'}</span>
                    </div>
                  </div>

                  <div className="mobile-card-actions">
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <Trash2 size={16} /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
