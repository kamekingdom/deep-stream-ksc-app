import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import ThemeSync from './components/theme-sync';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <ThemeSync />
    <App />
  </>
);
