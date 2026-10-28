import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

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
              return (
                <div
                  key={i}
                  className="history-item-card"
                  onClick={() => navigate(`/crop/${crop.id}`)}
                >
                  <div className="history-thumb-icon">{crop.icon}</div>
                  <div className="history-info">
                    <h4 className="history-crop-name">{cropName}</h4>
                    <span className="history-meta">
                      {h.date} • {h.area} {t('unitAcre')} • {h.tehsil}
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
