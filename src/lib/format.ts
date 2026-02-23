export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function getMonthName(month: number): string {
  const date = new Date(2025, month - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
}

export function getCurrentPeriod(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

// --- Date range utilities ---

/** Format a Date to YYYY-MM-DD string */
export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Get date range for "last N days" ending today */
export function getLastNDays(n: number): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - n + 1);
  return { startDate: toDateStr(start), endDate: toDateStr(end) };
}

/** Get date range for the current month */
export function getCurrentMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { startDate: toDateStr(start), endDate: toDateStr(end) };
}

/** Get date range for the current week (Mon-Sun) */
export function getCurrentWeekRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diffToMon = day === 0 ? 6 : day - 1;
  const start = new Date(now);
  start.setDate(now.getDate() - diffToMon);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { startDate: toDateStr(start), endDate: toDateStr(end) };
}

/** Get a very wide range for "all time" */
export function getAllTimeRange(): { startDate: string; endDate: string } {
  return { startDate: '2020-01-01', endDate: toDateStr(new Date()) };
}

/** Format a date range for display */
export function formatPeriodLabel(startDate: string, endDate: string): string {
  const s = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(startDate + 'T12:00:00'));
  const e = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(endDate + 'T12:00:00'));
  return `${s} — ${e}`;
}
