import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import NotificationCenter from './components/notification-center';
import ReservationResetSync from './components/reservation-reset-sync';
import ThemeSync from './components/theme-sync';
import UpdateBanner from './components/update-banner';

if (typeof window !== 'undefined' && window.screen?.orientation?.lock) {
  window.screen.orientation.lock('portrait-primary').catch(() => {});
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <UpdateBanner />
    <ReservationResetSync />
    <NotificationCenter />
    <ThemeSync />
    <App />
  </>
);
