
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// --- NUCLEAR RESET ---
// Uncomment this line if you are stuck in a crash loop
try {
    // console.log("Clearing Local Storage to fix crash...");
    // localStorage.removeItem('fba_user');
} catch (e) {
    console.error("Failed to clear storage", e);
}
// ---------------------

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
