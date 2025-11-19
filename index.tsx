
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// --- POLYFILL PROCESS.ENV ---
// This ensures that if the environment doesn't provide a global process object,
// one exists so that process.env.API_KEY access doesn't crash the app.
if (typeof process === 'undefined') {
  (window as any).process = { env: { API_KEY: '' } };
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
