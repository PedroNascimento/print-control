'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatCurrency, getMonthName, getCurrentPeriod } from '@/lib/format';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

interface SummaryData {
  period: { year: number; month: number };
  totalRevenue: { cents: number; reais: number };
  totalExpense: { cents: number; reais: number };
  netProfit: { cents: number; reais: number };
  profitMargin: number;
  totalInvestment: { cents: number; reais: number };
  expensesByCategory: Record<string, number>;
}

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const CATEGORY_LABELS: Record<string, string> = {
  SUPPLIES: 'Insumos',
  MAINTENANCE: 'Manutenção',
  ENERGY: 'Energia',
  OUTSOURCING: 'Terceirização',
  OTHER: 'Outros',
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(getCurrentPeriod);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<SummaryData>(
        `/api/summary?year=${period.year}&month=${period.month}`
      );
      setSummary(data);
    } catch {
      console.error('Erro ao carregar resumo');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const barData = summary ? [
    { name: 'Receitas', valor: summary.totalRevenue.reais, fill: '#22c55e' },
    { name: 'Despesas', valor: summary.totalExpense.reais, fill: '#ef4444' },
    { name: 'Lucro', valor: summary.netProfit.reais, fill: '#6366f1' },
  ] : [];

  const pieData = summary
    ? Object.entries(summary.expensesByCategory).map(([cat, val]) => ({
        name: CATEGORY_LABELS[cat] || cat,
        value: val,
      }))
    : [];

  function changeMonth(delta: number) {
    setPeriod((prev) => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m > 12) { m = 1; y++; }
      if (m < 1) { m = 12; y--; }
      return { year: y, month: m };
    });
  }

  if (loading && !summary) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '60vh', gap: '12px', color: 'var(--text-muted)',
      }}>
        <span className="spinner" /> Carregando...
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '32px', flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Visão Geral
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Resumo financeiro do período
          </p>
        </div>

        {/* Period selector */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--surface-card)', border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-md)', padding: '4px',
        }}>
          <button onClick={() => changeMonth(-1)} className="btn btn-ghost btn-sm">←</button>
          <span style={{
            minWidth: '140px', textAlign: 'center', fontWeight: 600, fontSize: '14px',
            textTransform: 'capitalize',
          }}>
            {getMonthName(period.month)} {period.year}
          </span>
          <button onClick={() => changeMonth(1)} className="btn btn-ghost btn-sm">→</button>
        </div>
      </div>

      {summary && (
        <>
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}>
            <StatCard
              label="Receita Total"
              value={formatCurrency(summary.totalRevenue.reais)}
              color="var(--success)"
              bg="var(--success-muted)"
            />
            <StatCard
              label="Despesa Total"
              value={formatCurrency(summary.totalExpense.reais)}
              color="var(--danger)"
              bg="var(--danger-muted)"
            />
            <StatCard
              label="Lucro Líquido"
              value={formatCurrency(summary.netProfit.reais)}
              color={summary.netProfit.reais >= 0 ? 'var(--success)' : 'var(--danger)'}
              bg={summary.netProfit.reais >= 0 ? 'var(--success-muted)' : 'var(--danger-muted)'}
            />
            <StatCard
              label="Margem de Lucro"
              value={`${summary.profitMargin}%`}
              color="var(--brand-400)"
              bg="rgba(99,102,241,0.12)"
            />
          </div>

          {/* Charts */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}>
            {/* Bar Chart */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>
                Resumo Financeiro
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface-card)',
                      border: '1px solid var(--surface-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                    formatter={(value: any) => [formatCurrency(value || 0), '']}
                  />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>
                Despesas por Categoria
              </h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      dataKey="value"
                      paddingAngle={3}
                      stroke="none"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value: string) => (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{value}</span>
                      )}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--surface-border)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                      formatter={(value: any) => [formatCurrency(value || 0), '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">
                  <p>Nenhuma despesa neste período</p>
                </div>
              )}
            </div>
          </div>

          {/* Investment banner */}
          <div className="card" style={{
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Investimento Total Acumulado
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--brand-400)' }}>
                {formatCurrency(summary.totalInvestment.reais)}
              </div>
            </div>
            <span className="badge badge-info">Acumulado</span>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color, bg }: {
  label: string; value: string; color: string; bg: string;
}) {
  return (
    <div className="card stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div style={{
        marginTop: '8px',
        height: '4px',
        borderRadius: '2px',
        background: bg,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: '60%',
          background: color,
          borderRadius: '2px',
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}
