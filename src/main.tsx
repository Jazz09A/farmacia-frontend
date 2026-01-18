import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import QueryClientProvider from './providers/QueryClientProvider';

// 🔒 CRÍTICO: Importar SecurityManager para prevenir filtración de datos
import './utils/securityUtils';

// Asegurar que el navegador no restaure automáticamente la posición de scroll
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
