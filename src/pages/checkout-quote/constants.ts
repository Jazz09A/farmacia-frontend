export const PAYMENT_TERMS_OPTIONS = [
  { code: 'CON', label: 'CON · Contado' },
  { code: '3D', label: '3D · 3 días de crédito' },
  { code: '5D', label: '5D · 5 días de crédito' },
  { code: '7D', label: '7D · 7 días de crédito' },
  { code: '10D', label: '10D · 10 días de crédito' },
  { code: '12D', label: '12D · 12 días de crédito' },
  { code: '14D', label: '14D · 14 días de crédito' },
  { code: '15D', label: '15D · 15 días de crédito' },
  { code: '16D', label: '16D · 16 días de crédito' },
  { code: '20D', label: '20D · 20 días de crédito' },
  { code: '21D', label: '21D · 21 días de crédito' },
  { code: '30D', label: '30D · 30 días de crédito' },
  { code: '360D', label: '360D · 360 días de crédito' },
];

export const TRANSPORT_OPTIONS = [
  { code: '001', label: '001 · Entrega directa (Oficina)' },
  { code: '002', label: '002 · Tealca Paraiso (Sra. Carmen 0414 3224289)' },
  { code: '003', label: '003 · Zeus Express CA (Sr. Dennys 0414 8239491)' },
  { code: '004', label: '004 · Transporte Alianza (Sr. Edgar 0412 5354934)' },
  { code: '005', label: '005 · Zoom Montalban (Sr. Leandro 0412 2076171)' },
  { code: '006', label: '006 · Zoom La Urbina (Sra. Gleimar 0414 2649087)' },
  { code: '007', label: '007 · Marcha Express (Anmary Seijas 0412 8052157)' },
];

export const DEFAULT_QUOTE_VALIDITY_DAYS = 30;
export const DEFAULT_PAYMENT_TERM = 'CON';
export const DEFAULT_TRANSPORT_CODE = '001';

export const computeValidUntil = (validityDays: number): string => {
  const now = new Date();
  const expiration = new Date(now);
  expiration.setDate(expiration.getDate() + validityDays);
  expiration.setHours(23, 59, 59, 0);
  return expiration.toISOString();
};
