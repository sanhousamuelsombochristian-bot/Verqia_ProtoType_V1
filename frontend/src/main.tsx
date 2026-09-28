import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import { DataProvider } from './services/DataProvider';
import { ToastProvider } from './components/ui/Toast';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './components/layout/MarketingLayout/MarketingLayout.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <DataProvider>
        <ToastProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToastProvider>
      </DataProvider>
    </ThemeProvider>
  </StrictMode>,
);
