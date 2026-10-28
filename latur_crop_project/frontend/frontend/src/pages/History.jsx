import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import { ChevronLeft, ChevronRight, Clock, FlaskConical, Sprout } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const { lang, t, crops, history } = useFarm();

  return (
    <div className="mobile-screen history-screen">
      <div className="screen-header-bar">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="screen-header-title">{t('myHistory')}</h2>
      </div>

      <main className="screen-content pad-body">
        {history.length === 0 ? (
          <div className="empty-history-box">
            <Clock size={40} color="#9E9E9E" />
            <p style={{ marginTop: '1rem', color: '#666' }}>
              {lang === 'mr' ? 'अद्याप कोणताही शोध इतिहास नाही.' : 'No search history yet.'}
            </p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((h, i) => {
              const crop = crops.find(c => c.id === h.cropId) || crops[0];
              const cropName = lang === 'mr' ? crop.name_mr : crop.name_en;
              const isLab = h.mode === 'soil_lab';

              return (
                <div
                  key={i}
                  className="history-item-card"
                  onClick={() => navigate(`/crop/${crop.id}`)}
                  style={{
                    border: isLab ? '1.5px solid #80CBC4' : '1px solid #EBEBEB',
                    background: isLab ? '#F4FAF9' : '#FFFFFF'
                  }}
                >
                  <div className="history-thumb-icon">{crop.icon}</div>
                  <div className="history-info" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                      <h4 className="history-crop-name" style={{ margin: 0 }}>{cropName}</h4>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          color: isLab ? '#00695C' : '#2E7D32',
                          background: isLab ? '#E0F2F1' : '#E8F5E9'
                        }}
                      >
                        {isLab ? <FlaskConical size={10} /> : <Sprout size={10} />}
                        <span>{isLab ? (lang === 'mr' ? 'सॉईल लॅब' : 'Soil Lab') : (lang === 'mr' ? 'हवामान' : 'Standard')}</span>
                      </span>
                    </div>

                    <span className="history-meta" style={{ display: 'block', marginTop: '0.2rem' }}>
                      {h.date} • {h.area} {t('unitAcre')} • {h.tehsil}
                      {isLab && h.soilLabSummary && ` • pH ${h.soilLabSummary.ph}`}
                    </span>
                  </div>
                  <ChevronRight size={18} className="history-arrow" />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
