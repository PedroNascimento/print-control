'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle2, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ServiceData {
  id: string;
  code: string;
  name: string;
  defaultPrice: { cents: number; reais: number };
  category: string;
}

interface CartItem extends ServiceData {
  quantity: number;
}

export default function PDVPage() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Checkout states
  const [client, setClient] = useState('');
  const [observation, setObservation] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch all active services on load for quick offline-like filtering
  useEffect(() => {
    async function loadCatalog() {
      try {
        const data = await api<ServiceData[]>('/api/services?activeOnly=true');
        setServices(data);
      } catch (e) {
        console.error('Failed to load catalog', e);
      }
    }
    loadCatalog();
  }, []);

  // Filter services locally for max speed
  const filteredServices = useMemo(() => {
    if (!searchTerm) return [];
    const lower = searchTerm.toLowerCase();
    return services.filter(
      s => s.name.toLowerCase().includes(lower) || s.code.toLowerCase().includes(lower)
    ).slice(0, 8); // show max 8 results to avoid huge lists covering the mobile screen
  }, [searchTerm, services]);

  const totalCents = cart.reduce((acc, item) => acc + (item.defaultPrice.cents * item.quantity), 0);

  function addToCart(service: ServiceData) {
    setCart(prev => {
      const existing = prev.find(item => item.id === service.id);
      if (existing) {
        return prev.map(item => item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...service, quantity: 1 }];
    });
    setSearchTerm(''); // auto-close search on select
  }

  function updateQuantity(id: string, delta: number) {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return { ...item, quantity: newQ > 0 ? newQ : 1 };
      }
      return item;
    }));
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(item => item.id !== id));
  }

  async function handleCheckout() {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    try {
      await api('/api/pdv', {
        method: 'POST',
        body: {
          client: client || undefined,
          observation: observation || undefined,
          items: cart.map(item => ({ serviceId: item.id, quantity: item.quantity }))
        }
      });

      // Show success screen and reset
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setCart([]);
        setClient('');
        setObservation('');
        setSearchTerm('');
      }, 2000);

    } catch (e: unknown) {
      const error = e as Error;
      alert(error.message || 'Erro ao finalizar venda.');
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="pdv-container animate-fadeIn">
      {/* 1. Header & Search (Sticky) */}
      <div className="pdv-header">
        <h1 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={22} color="var(--brand-500)" /> Frente de Caixa
        </h1>
        
        <div className="search-box">
          <Search size={20} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Buscar serviço por código ou nome..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
            autoFocus
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Autocomplete Results */}
        {searchTerm && (
          <div className="autocomplete-results">
            {filteredServices.length === 0 ? (
              <div className="autocomplete-empty">Nenhum serviço encontrado.</div>
            ) : (
              filteredServices.map(service => (
                <div key={service.id} className="autocomplete-item" onClick={() => addToCart(service)}>
                  <div>
                    <div className="item-name">{service.name}</div>
                    <div className="item-code">{service.code} • {service.category}</div>
                  </div>
                  <div className="item-price">{formatCurrency(service.defaultPrice.reais)}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 2. Cart Body */}
      <div className="pdv-cart">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCart size={48} strokeWidth={1.5} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p>Seu carrinho está vazio.</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Busque um serviço acima para começar a venda!</p>
          </div>
        ) : (
          <div className="cart-list">
            {cart.map(item => (
              <div key={item.id} className="cart-card">
                <div className="cart-card-header">
                  <div className="cart-card-title">{item.name}</div>
                  <button className="btn-remove" onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="cart-card-body">
                  <div className="cart-price-info">
                    <span className="unit-price">{formatCurrency(item.defaultPrice.reais)} / un</span>
                    <span className="total-price">{formatCurrency((item.defaultPrice.cents * item.quantity) / 100)}</span>
                  </div>

                  <div className="cart-stepper">
                    <button className="stepper-btn" onClick={() => updateQuantity(item.id, -1)}>
                      <Minus size={18} />
                    </button>
                    <span className="stepper-value">{item.quantity}</span>
                    <button className="stepper-btn" onClick={() => updateQuantity(item.id, 1)}>
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Optional Fields (Client & Obs) */}
            <div className="checkout-extras card" style={{ padding: '16px', marginTop: '16px' }}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="input-label" style={{ fontSize: '12px' }}>Nome do Cliente (Opcional)</label>
                <input type="text" className="input" placeholder="Ex: Maria" value={client} onChange={e => setClient(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="input-label" style={{ fontSize: '12px' }}>Observação (Opcional)</label>
                <input type="text" className="input" placeholder="Ex: Pagamento no PIX" value={observation} onChange={e => setObservation(e.target.value)} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Sticky Bottom Footer (Total + Button) */}
      <div className="pdv-footer">
        <div className="footer-total-row">
          <span>Total:</span>
          <span className="footer-total-val">{formatCurrency(totalCents / 100)}</span>
        </div>
        <button 
          className="btn btn-primary btn-checkout" 
          disabled={cart.length === 0 || isCheckingOut}
          onClick={handleCheckout}
        >
          {isCheckingOut ? 'PROCESSANDO...' : 'FINALIZAR VENDA'}
        </button>
      </div>

      {/* Success Portal Overlay */}
      {showSuccess && createPortal(
        <div className="success-overlay animate-fadeIn">
          <div className="success-card">
            <CheckCircle2 size={64} className="success-icon animate-bounce" />
            <h2>Venda Concluída!</h2>
            <p>Registrada no caixa com sucesso.</p>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .pdv-container {
          display: flex;
          flex-direction: column;
          min-height: calc(100dvh - 120px);
          max-width: 600px;
          margin: 0 auto;
          position: relative;
          padding-bottom: 160px; /* Safe space for the fixed footer */
        }

        .pdv-header {
          position: sticky;
          top: -1px;
          background: rgba(15, 17, 23, 0.85); /* Matches surface-bg */
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 30;
          padding: 16px 0 20px 0;
          margin-top: -16px; /* Offset parent layout padding to stick to the exact top */
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--surface-card);
          border: 1px solid var(--surface-border);
          padding: 14px 18px;
          border-radius: var(--radius-xl);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          position: relative;
          transition: all 0.2s;
        }
        
        .search-box:focus-within {
          border-color: var(--brand-500);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 16px;
          color: var(--text-primary);
          outline: none;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .clear-search {
          background: var(--surface-border);
          border-radius: 50%;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: background 0.15s;
        }

        .autocomplete-results {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: var(--surface-card);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-lg);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          max-height: 50vh;
          overflow-y: auto;
          z-index: 40;
        }

        .autocomplete-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          cursor: pointer;
          border-bottom: 1px solid var(--surface-border);
          transition: background 0.15s;
        }
        .autocomplete-item:last-child { border-bottom: none; }
        .autocomplete-item:hover { background: var(--surface-card-hover); }

        .item-name { font-weight: 600; font-size: 15px; color: var(--text-primary); }
        .item-code { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
        .item-price { font-weight: 700; color: var(--brand-400); font-size: 15px; }

        .autocomplete-empty {
          padding: 20px;
          text-align: center;
          color: var(--text-muted);
          font-size: 14px;
        }

        .pdv-cart {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .empty-cart {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          text-align: center;
          padding: 60px 20px;
          background: rgba(255,255,255,0.01);
          border-radius: var(--radius-2xl);
          border: 1px dashed var(--surface-border);
          margin-top: 12px;
        }

        .cart-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cart-card {
          background: var(--surface-card);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-xl);
          padding: 18px;
          box-shadow: var(--shadow-card);
        }

        .cart-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
        }

        .cart-card-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 16px;
          line-height: 1.3;
        }

        .btn-remove {
          background: var(--danger-muted);
          border-radius: var(--radius-sm);
          border: none;
          color: var(--danger);
          cursor: pointer;
          padding: 6px;
          transition: all 0.2s;
        }
        .btn-remove:hover { transform: scale(1.05); }

        .cart-card-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cart-price-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .unit-price { font-size: 13px; color: var(--text-muted); }
        .total-price { font-weight: 700; font-size: 18px; color: var(--success); }

        .cart-stepper {
          display: flex;
          align-items: center;
          background: var(--surface-bg);
          border: 1px solid var(--surface-border);
          border-radius: 100px;
          padding: 4px;
        }

        .stepper-btn {
          background: var(--surface-card-hover);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-primary);
          transition: background 0.15s;
        }
        .stepper-btn:active { background: var(--surface-border); }

        .stepper-value {
          width: 44px;
          text-align: center;
          font-weight: 700;
          font-size: 16px;
        }

        .pdv-footer {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 48px);
          max-width: 552px; /* 600 - 48 */
          background: rgba(26, 29, 46, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--brand-500);
          border-radius: var(--radius-2xl);
          padding: 20px 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.2);
          display: flex;
          flex-direction: column;
          gap: 16px;
          z-index: 40;
        }

        .footer-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .footer-total-val {
          font-size: 32px;
          font-weight: 800;
          color: var(--brand-400);
          letter-spacing: -0.5px;
        }

        .btn-checkout {
          width: 100%;
          height: 60px;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          border-radius: var(--radius-xl);
          background: linear-gradient(135deg, var(--brand-600) 0%, var(--brand-500) 100%);
          color: #fff;
          border: none;
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.25);
        }

        .btn-checkout:disabled {
          background: var(--surface-border);
          color: var(--text-muted);
          box-shadow: none;
        }

        .success-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .success-card {
          background: var(--surface-card);
          padding: 48px 32px;
          border-radius: var(--radius-2xl);
          text-align: center;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
          border: 1px solid var(--success-muted);
          width: 100%;
          max-width: 400px;
          animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .success-icon {
          color: var(--success);
          margin-bottom: 24px;
        }

        .success-card h2 {
          color: var(--text-primary);
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .success-card p {
          color: var(--text-muted);
          font-size: 15px;
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .pdv-container {
            padding-bottom: 180px;
          }
          
          .pdv-footer {
            bottom: 16px;
            width: calc(100% - 32px);
            padding: 16px;
            border-radius: var(--radius-xl);
          }
          
          .btn-checkout {
            height: 56px;
          }
        }
      `}</style>
    </div>
  );
}
