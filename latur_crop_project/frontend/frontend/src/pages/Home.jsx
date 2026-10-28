import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import Header from '../components/Header';
import { MapPin, Building2, ChevronRight, Sprout, Search, BookOpen, FlaskConical } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { lang, t, districtName, tehsilName, setLocationModalOpen, recommendationMode, soilLabData } = useFarm();

  const isLabActive = recommendationMode === 'soil_lab' && !!soilLabData;

  return (
    <div className="mobile-screen home-screen">
      <Header />

      <main className="screen-content">
        {/* Hero Farmer Illustration */}
        <section className="hero-banner">
          <img
            src="/pik_mitra-bg.png"
            alt="पीक मित्र शेतकरी"
            className="hero-illustration"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="hero-overlay">
            <span className="hero-kicker">पीक मित्र</span>
            <span className="hero-tagline">तुमच्या शेतीसाठी योग्य माहिती, योग्य निर्णय</span>
          </div>
        </section>

        {/* Location Selector Card */}
        <section className="location-card-container">
          <div className="location-selector-card" onClick={() => setLocationModalOpen(true)}>
            <div className="loc-item">
              <div className="loc-icon-bubble">
                <MapPin size={18} color="#1B5E20" />
              </div>
              <div className="loc-text">
                <span className="loc-label">{t('district')}</span>
                <strong className="loc-value">{districtName}</strong>
              </div>
              <ChevronRight size={18} className="loc-arrow" />
            </div>

            <div className="loc-divider" />

            <div className="loc-item">
              <div className="loc-icon-bubble">
                <Building2 size={18} color="#1B5E20" />
              </div>
              <div className="loc-text">
                <span className="loc-label">{t('tehsil')}</span>
                <strong className="loc-value">{tehsilName}</strong>
              </div>
              <ChevronRight size={18} className="loc-arrow" />
            </div>
          </div>
        </section>

        {/* Action Cards Grid */}
        <section className="main-actions-section">
          {/* 1. Green Button: Find Crop For Me */}
          <button
            type="button"
            className="action-big-card card-green"
            onClick={() => navigate('/find-crop')}
          >
            <div className="action-icon-circle bg-green-light">
              <Sprout size={28} color="#1B5E20" />
            </div>
            <div className="action-card-text">
              <h3 className="action-card-title">{t('findCropTitle')}</h3>
              <p className="action-card-desc">{t('findCropSub')}</p>
            </div>
          </button>

          {/* 2. Teal Button: Smart Soil Lab (Optional Feature) */}
          <button
            type="button"
            className="action-big-card"
            style={{
              background: '#FFFFFF',
              border: isLabActive ? '2px solid #00695C' : '1px solid #80CBC4',
              boxShadow: '0 3px 10px rgba(0, 105, 92, 0.08)'
            }}
            onClick={() => navigate('/soil-lab')}
          >
            <div className="action-icon-circle" style={{ background: '#E0F2F1' }}>
              <FlaskConical size={28} color="#00695C" />
            </div>
            <div className="action-card-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h3 className="action-card-title" style={{ color: '#004D40' }}>{t('soilLabTitle')}</h3>
                <span style={{ fontSize: '0.65rem', background: '#E0F2F1', color: '#00695C', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                  {isLabActive ? 'सक्रिय' : t('optionalBadge')}
                </span>
              </div>
              <p className="action-card-desc" style={{ color: '#00695C' }}>
                {lang === 'mr' ? 'प्रयोगशाळा माती अहवाल (pH, NPK, EC) व अचूक पिके' : 'Lab soil report (pH, NPK, EC) precision match'}
              </p>
            </div>
          </button>

          {/* 3. Blue Button: Check My Crop */}
          <button
            type="button"
            className="action-big-card card-blue"
            onClick={() => navigate('/check-crop')}
          >
            <div className="action-icon-circle bg-blue-light">
              <Search size={28} color="#1565C0" />
            </div>
            <div className="action-card-text">
              <h3 className="action-card-title">{t('checkCropTitle')}</h3>
              <p className="action-card-desc">{t('checkCropSub')}</p>
            </div>
          </button>

          {/* 4. Purple Button: View Crop Facts */}
          <button
            type="button"
            className="action-big-card card-purple"
            onClick={() => navigate('/crop-facts')}
          >
            <div className="action-icon-circle bg-purple-light">
              <BookOpen size={28} color="#6A1B9A" />
            </div>
            <div className="action-card-text">
              <h3 className="action-card-title">{t('cropFactsTitle')}</h3>
              <p className="action-card-desc">{t('cropFactsSub')}</p>
            </div>
          </button>
        </section>
      </main>
    </div>
  );
}
