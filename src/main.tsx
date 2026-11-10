import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker to ensure Chrome & Android generate a standalone WebAPK instead of a browser shortcut
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('MoveMates app updated');
  },
  onOfflineReady() {
    console.log('MoveMates ready offline');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
