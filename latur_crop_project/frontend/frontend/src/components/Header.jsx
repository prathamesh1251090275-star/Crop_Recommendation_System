import React from 'react';
import { useFarm } from '../context/FarmContext';
import { Sprout } from 'lucide-react';

export default function Header() {
  const { lang, setLang, t } = useFarm();

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon-box">
          <Sprout size={24} color="#1B5E20" strokeWidth={2.5} />
        </div>
        <div className="brand-text">
          <h1 className="brand-title">{t('appName')}</h1>
          <p className="brand-subtitle">{t('tagline')}</p>
        </div>
      </div>

      <div className="lang-toggle">
        <button
          type="button"
          className={`lang-btn ${lang === 'mr' ? 'active' : ''}`}
          onClick={() => setLang('mr')}
        >
          मराठी
        </button>
        <button
          type="button"
          className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
          onClick={() => setLang('en')}
        >
          EN
        </button>
      </div>
    </header>
  );
}
