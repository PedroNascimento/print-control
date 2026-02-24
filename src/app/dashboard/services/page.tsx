'use client';

import { useEffect, useState, FormEvent, useMemo } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { Plus, Search, Edit2, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ServiceData {
  id: string;
  code: string;
  name: string;
  description?: string;
  defaultPrice: { cents: number; reais: number };
  estimatedCost?: { cents: number; reais: number };
  isActive: boolean;
  category: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('Impressão');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('Impressão');
    cats.add('Xerox');
    cats.add('Encadernação');
    services.forEach(s => {
      if (s.category) cats.add(s.category);
    });
    return Array.from(cats).sort();
  }, [services]);

  async function fetchServices() {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await api<ServiceData[]>(`/api/services${query}`);
      setServices(data);
    } catch {
      console.error('Erro ao buscar serviços');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      await api('/api/services', {
        method: 'POST',
        body: {
          code: code.toUpperCase(),
          name,
          description: description || undefined,
          defaultPriceCents: Math.round(parseFloat(price) * 100),
          estimatedCostCents: cost ? Math.round(parseFloat(cost) * 100) : undefined,
          category,
          isActive,
        },
      });

      setShowForm(false);
      resetForm();
      fetchServices();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Erro ao salvar serviço');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    try {
      await api(`/api/services/${id}`, {
        method: 'PATCH',
        body: { isActive: !currentStatus },
      });
      fetchServices();
    } catch {
      alert('Erro ao alterar status');
    }
  }

  function resetForm() {
    setCode('');
    setName('');
    setDescription('');
    setPrice('');
    setCost('');
    setCategory('Impressão');
    setIsActive(true);
    setError('');
  }

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Catálogo de Serviços</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Gerencie os produtos e serviços oferecidos pela sua gráfica
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Novo Serviço
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Buscar por código ou nome..." 
          className="input" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', background: 'transparent', flex: 1, padding: 0 }}
        />
      </div>

      {/* Services List */}
      <div className="card table-container" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Mapeando catálogo...</div>
        ) : services.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            {search ? 'Nenhum serviço encontrado.' : 'Seu catálogo está vazio. Adicione um serviço para começar a vender no PDV.'}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Código / Categoria</th>
                <th>Serviço</th>
                <th>Preço Base</th>
                <th>Custo Est.</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} style={{ transition: 'background 0.2s' }}>
                  <td data-label="Código / Categoria">
                    <div style={{ fontWeight: 600, color: 'var(--brand-400)' }}>{s.code}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.category}</div>
                  </td>
                  <td data-label="Serviço" style={{ fontWeight: 500 }}>
                    {s.name}
                    {s.description && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {s.description}
                      </div>
                    )}
                  </td>
                  <td data-label="Preço Base" className="success">
                    {formatCurrency(s.defaultPrice.reais)}
                  </td>
                  <td data-label="Custo Est." className="danger">
                    {s.estimatedCost ? formatCurrency(s.estimatedCost.reais) : '-'}
                  </td>
                  <td data-label="Status">
                    <span 
                      className={`badge ${s.isActive ? 'badge-info' : ''}`}
                      style={{ 
                        background: s.isActive ? 'var(--success-muted)' : 'var(--surface-border)', 
                        color: s.isActive ? 'var(--success)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleToggleStatus(s.id, s.isActive)}
                      title="Clique para ativar/inativar"
                    >
                      {s.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td data-label="Ações" style={{ textAlign: 'right' }}>
                    {/* Placeholder for Edit */}
                    <button className="btn btn-ghost btn-sm" disabled style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Novo Serviço */}
      {showForm && createPortal(
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <button className="modal-close" onClick={() => setShowForm(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '24px' }}>Cadastrar Serviço</h2>
            
            <form onSubmit={handleCreate}>
              {error && (
                <div style={{ padding: '10px 14px', background: 'var(--danger-muted)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px', color: 'var(--danger)' }}>
                  {error}
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="input-label">Código Único *</label>
                  <input type="text" className="input" placeholder="Ex: XER01" required value={code} onChange={e => setCode(e.target.value)} maxLength={10} style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="form-group">
                  <label className="input-label">Nome do Serviço *</label>
                  <input type="text" className="input" placeholder="Ex: Impressão A4 P&B" required value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Categoria *
                  <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>(Selecione ou digite nova)</span>
                </label>
                <input type="text" className="input" placeholder="Ex: Banner, Adesivo..." required value={category} onChange={e => setCategory(e.target.value)} list="categories" />
                <datalist id="categories">
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="input-label">Preço de Venda (R$) *</label>
                  <input type="number" step="0.01" min="0" className="input" placeholder="0,00" required value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="input-label">Custo Estimado (R$)</label>
                  <input type="number" step="0.01" min="0" className="input" placeholder="Opcional" value={cost} onChange={e => setCost(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Observações Internas</label>
                <textarea className="input" rows={2} placeholder="Ex: Gramatura 90g, Papel Couchê..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" id="active" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                <label htmlFor="active" style={{ cursor: 'pointer', fontWeight: 500 }}>Serviço Ativo para Vendas</label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                  {saving ? 'Salvando...' : 'Cadastrar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
