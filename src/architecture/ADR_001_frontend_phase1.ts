/**
 * ADR 001 — Frontend Fase 1 (aprobada)
 *
 * Contexto
 * --------
 * El backend no monta crédito ni varias APIs legacy de pedidos/descuentos/direcciones.
 * El FE se alineó a ese contrato para dejar de llamar endpoints inexistentes.
 *
 * Decisión
 * --------
 * - Flujo comercial activo = cotizaciones (no pedidos directos ni crédito).
 * - `/checkout` redirige a `/checkout/quote`.
 * - Crédito retirado del FE (rutas, provider, servicios, páginas, estilos).
 * - Cliente HTTP unificado en `src/services/api/apiClient.ts`.
 *
 * Consecuencias (estado real post-Fase 1)
 * ----------------------------------------
 * - Auth storage keys: `auth_token` / `auth_user` (+ refresh/expiry en apiClient).
 * - DEV: `getApiOrigin()` → '' (proxy Vite `/api`); PROD: `VITE_API_URL`.
 * - APIs no montadas → stubs / throw (sin fetch):
 *   - orders legacy (user/admin)
 *   - quantity-discounts públicos
 *   - addresses legacy (`/user/addresses`); usar `customer-addresses`
 * - God pages partidas:
 *   - AdminFlashOffersPage + `pages/Admin/flash-offers/*`
 *   - CheckoutQuotePage + `pages/checkout-quote/*`
 *   - ProfilePage + AccountSection / SupportTicketsSection
 * - ErrorBoundary en checkout, profile y admin.
 * - `npm run typecheck` (`tsc --noEmit`); lockfile = `package-lock.json` (npm).
 *
 * Fuera de alcance / no inventar
 * ------------------------------
 * - Remontar crédito en el FE (Fase 1 no lo montará).
 * - Pedidos directos como flujo de checkout.
 * - Documentación Markdown versionada: `*.md` está en `.gitignore` del frontend;
 *   esta ADR + comentarios en `src/config` son la fuente versionada.
 *
 * Status: accepted (aprobada)
 */

/** Modo comercial del storefront tras Fase 1. */
export const FRONTEND_COMMERCE_MODE = 'quotes' as const;

export const FRONTEND_PHASE1 = {
  id: 'ADR-001',
  status: 'accepted',
  commerceMode: FRONTEND_COMMERCE_MODE,
  creditMountedInFrontend: false,
  directOrdersMounted: false,
  apiClientPath: 'src/services/api/apiClient.ts',
  checkoutPath: '/checkout/quote',
} as const;
