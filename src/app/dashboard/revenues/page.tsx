'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { formatCurrency, formatDate, getCurrentMonthRange, getLastNDays, getAllTimeRange, formatPeriodLabel } from '@/lib/format';

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

type FilterPreset = '7d' | '30d' | '90d' | 'month' | 'all' | 'custom';

export default function RevenuesPage() {
  const [revenues, setRevenues] = useState<RevenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Filter state
  const [activeFilter, setActiveFilter] = useState<FilterPreset>('30d');
  const [dateRange, setDateRange] = useState(getLastNDays(30));
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustom, setShowCustom] = useState(false);

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
      const data = await api<RevenueItem[]>(`/api/revenues?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      setRevenues(data);
    } catch (err) { console.error('Erro ao carregar receitas:', err); } finally { setLoading(false); }
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
      await api('/api/revenues', {
        method: 'POST',
        body: {
          description: desc,
          valueCents: Math.round(parseFloat(value) * 100),
          date, type,
          client: client || undefined,
          costCents: cost ? Math.round(parseFloat(cost) * 100) : undefined,
        },
      });
      // Navigate to the period containing the new item
      const created = new Date(date);
      const s = new Date(created); s.setDate(1);
      const eDate = new Date(s.getFullYear(), s.getMonth() + 1, 0);
      setDateRange({ startDate: `${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,'0')}-01`, endDate: `${eDate.getFullYear()}-${String(eDate.getMonth()+1).padStart(2,'0')}-${String(eDate.getDate()).padStart(2,'0')}` });
      setActiveFilter('custom');
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error('Erro ao salvar receita:', err);
      if (err instanceof ApiError) { setError(err.message); }
      else { setError('Erro ao salvar receita. Tente novamente.'); }
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta receita?')) return;
    await api(`/api/revenues/${id}`, { method: 'DELETE' });
    fetchData();
  }

  function resetForm() { setDesc(''); setValue(''); setDate(''); setType('OWN'); setClient(''); setCost(''); }

  const total = revenues.reduce((s, r) => s + r.valueReais, 0);
  const weekTotal = revenues.filter(r => {
    const d = new Date(r.date); const now = new Date();
    const diffDays = (now.getTime() - d.getTime()) / (1000*60*60*24);
    return diffDays >= 0 && diffDays <= 7;
  }).reduce((s, r) => s + r.valueReais, 0);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>Receitas</h1>
          <div className="header-stats">
            <div className="header-stat">
              <span className="header-stat-label">Período:</span>
              <span className="header-stat-value success">{formatCurrency(total)}</span>
            </div>
            <div className="header-stat">
              <span className="header-stat-label">Semana:</span>
              <span className="header-stat-value success">{formatCurrency(weekTotal)}</span>
            </div>
          </div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Nova Receita</button>
        </div>
      </div>

      {/* Filter Bar */}
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

      {/* Modal */}
      {showForm && createPortal(
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            <h2>Nova Receita</h2>
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
                  <label className="input-label">Tipo</label>
                  <select className="input" value={type} onChange={e => setType(e.target.value)}>
                    <option value="OWN">Própria</option>
                    <option value="OUTSOURCED">Terceirizada</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="input-label">Cliente</label>
                  <input className="input" value={client} onChange={e => setClient(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="input-label">Custo (R$)</label>
                <input className="input" type="number" step="0.01" min="0" value={cost} onChange={e => setCost(e.target.value)} />
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
          <>
            {/* Desktop Table */}
            <div className="table-container desktop-only">
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
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-card-list mobile-only">
              {revenues.map(r => (
                <div key={r.id} className="mobile-card">
                  <div className="mobile-card-header">
                    <div>
                      <div className="mobile-card-title">{r.description}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{formatDate(r.date)}</div>
                    </div>
                    <div className="mobile-card-value" style={{ color: 'var(--success)' }}>
                      {formatCurrency(r.valueReais)}
                    </div>
                  </div>
                  
                  <div className="mobile-card-body">
                    <div className="mobile-card-item">
                      <span className="mobile-card-label">Lucro Bruto</span>
                      <span>{formatCurrency(r.grossProfitReais)}</span>
                    </div>
                    <div className="mobile-card-item">
                      <span className="mobile-card-label">Tipo</span>
                      <span><span className={`badge ${r.type === 'OWN' ? 'badge-success' : 'badge-warning'}`}>{TYPE_LABELS[r.type]}</span></span>
                    </div>
                    <div className="mobile-card-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="mobile-card-label">Cliente</span>
                      <span style={{ color: 'var(--text-primary)' }}>{r.client || '—'}</span>
                    </div>
                  </div>

                  <div className="mobile-card-actions">
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
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
