'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, clearAuth, isAuthenticated, StoredUser } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Visão Geral', icon: '📊' },
  { href: '/dashboard/revenues', label: 'Receitas', icon: '💰' },
  { href: '/dashboard/expenses', label: 'Despesas', icon: '📉' },
  { href: '/dashboard/investments', label: 'Investimentos', icon: '🏗️' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }
    setUser(getUser());
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.push('/');
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 30, display: 'none',
          }}
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '260px',
        minHeight: '100vh',
        background: 'var(--surface-card)',
        borderRight: '1px solid var(--surface-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: sidebarOpen ? 0 : undefined,
        zIndex: 40,
        transition: 'transform 0.3s ease',
      }}>
        {/* Brand */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--surface-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}>
            🖨️
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.3px' }}>
              PrintControl
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Gestão Financeira
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--surface-border)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              title="Sair"
              style={{ fontSize: '16px', padding: '6px' }}
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: '260px',
        padding: '32px',
        minHeight: '100vh',
      }}>
        {/* Mobile header */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }} className="mobile-header">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-ghost"
            style={{ fontSize: '20px', padding: '8px' }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>PrintControl</span>
          <div style={{ width: '40px' }} />
        </div>

        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .mobile-overlay { display: block !important; }
          .mobile-header { display: flex !important; }
          aside {
            transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'};
          }
          main {
            margin-left: 0 !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
