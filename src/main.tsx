import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app/App';

const savedTheme = localStorage.getItem('theme');
const initialTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';

document.documentElement.classList.toggle('dark', initialTheme === 'dark');
document.documentElement.classList.toggle('light', initialTheme === 'light');

if (import.meta.env.DEV) {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[unhandled rejection]', event.reason);
  });

  window.addEventListener('error', (event) => {
    console.error('[uncaught error]', event.error ?? event.message);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
