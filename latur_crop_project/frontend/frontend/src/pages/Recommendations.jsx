import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import { ChevronLeft, ChevronRight, BarChart2, Sparkles, CheckCircle2, IndianRupee } from 'lucide-react';

export default function Recommendations() {
  const navigate = useNavigate();
  const {
    lang,
    t,
    crops,
    landArea,
    landUnit,
    districtName,
    tehsilName,
    addToHistory
  } = useFarm();

  const [activeCategory, setActiveCategory] = useState('all');

  const getUnitName = () => {
    if (landUnit === 'guntha') return t('unitGuntha');
    if (landUnit === 'hectare') return t('unitHectare');
    return t('unitAcre');
  };

  const categories = [
    { id: 'all', labelKey: 'tabAllPicks' },
    { id: 'fruits', labelKey: 'tabFruits' },
    { id: 'kharif', labelKey: 'tabKharif' },
    { id: 'rabi', labelKey: 'tabRabi' },
    { id: 'vegetables', labelKey: 'tabVegetables' }
  ];

  // Filter suitable crops and apply category tab
  const suitableCrops = crops.filter(c => !c.notSuitable);

  const displayedCrops = suitableCrops.filter(c => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'fruits') return c.category === 'fruits';
    if (activeCategory === 'kharif') return c.seasonType === 'kharif';
    if (activeCategory === 'rabi') return c.seasonType === 'rabi';
    if (activeCategory === 'vegetables') return c.category === 'vegetables';
    return true;
  }).slice(0, 8);

  const handleSelectCrop = (crop) => {
    addToHistory(crop.id);
    navigate(`/crop/${crop.id}`);
  };

  return (
    <div className="mobile-screen recs-screen">
      {/* Top Navbar */}
      <div className="screen-header-bar">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="screen-header-text">
          <h2 className="screen-header-title">{t('bestOptionsTitle')}</h2>
          <p className="screen-header-sub">
            {t('bestOptionsSubtitle', {
              area: landArea,
              unit: getUnitName(),
              district: districtName,
              tehsil: tehsilName
            })}
          </p>
        </div>
      </div>

      {/* Category Filter Chips Bar */}
      <div className="tabs-bar" style={{ padding: '0.4rem 0.8rem', background: '#F5F5F5', overflowX: 'auto', display: 'flex', gap: '0.4rem' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`tab-item ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.82rem',
              whiteSpace: 'nowrap',
              borderRadius: '20px',
              border: activeCategory === cat.id ? '1.5px solid #1B5E20' : '1px solid #DDD',
              background: activeCategory === cat.id ? '#E8F5E9' : '#FFF',
              color: activeCategory === cat.id ? '#1B5E20' : '#444',
              fontWeight: activeCategory === cat.id ? 700 : 500
            }}
          >
            {t(cat.labelKey)}
          </button>
        ))}
      </div>

      <main className="screen-content pad-body">
        {displayedCrops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#666' }}>
            <p>{t('noCropsInTab')}</p>
            <button
              type="button"
              className="btn-primary-large"
              style={{ marginTop: '1rem', width: 'auto', padding: '0.6rem 1.2rem' }}
              onClick={() => setActiveCategory('all')}
            >
              {t('tabAllPicks')}
            </button>
          </div>
        ) : (
          <div className="ranked-crops-list">
            {displayedCrops.map((crop, index) => {
              const cropName = lang === 'mr' ? crop.name_mr : crop.name_en;
              const reason = lang === 'mr' ? crop.matchReason_mr : crop.matchReason_en;
              return (
                <div
                  key={crop.id}
                  className="ranked-crop-card"
                  onClick={() => handleSelectCrop(crop)}
                  style={{
                    border: crop.isGISpecialty ? '1.5px solid #00897B' : '1px solid #EBEBEB',
                    background: crop.isGISpecialty ? '#F2FAF9' : '#FFFFFF'
                  }}
                >
                  {/* Rank Number Circle */}
                  <div
                    className="rank-badge-circle"
                    style={{
                      backgroundColor: crop.isGISpecialty ? '#E0F2F1' : '#FFF3E0',
                      color: crop.isGISpecialty ? '#00695C' : '#E65100',
                      borderColor: crop.isGISpecialty ? '#80CBC4' : '#FFE082'
                    }}
                  >
                    <span>{index + 1}</span>
                  </div>

                  {/* Crop Image Thumbnail */}
                  <div className="crop-img-thumb-box">
                    <img
                      src={crop.image}
                      alt={cropName}
                      className="crop-thumb-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="crop-icon-fallback" style={{ display: 'none' }}>
                      {crop.icon}
                    </div>
                  </div>

                  {/* Name, Score, Reason and Profit */}
                  <div className="crop-info-meta" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.3rem' }}>
                      <h4 className="crop-card-name" style={{ margin: 0, fontSize: '0.95rem' }}>{cropName}</h4>
                      <div className="crop-score-row" style={{ margin: 0 }}>
                        <span className="crop-pct-score" style={{ fontSize: '0.9rem', fontWeight: 800 }}>{crop.score}%</span>
                        <span
                          className="crop-status-pill"
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.4rem',
                            color: crop.badgeColor,
                            backgroundColor: crop.badgeBg
                          }}
                        >
                          {t(crop.badgeKey)}
                        </span>
                      </div>
                    </div>

                    {/* Match reason snippet */}
                    {reason && (
                      <p style={{
                        fontSize: '0.72rem',
                        color: crop.isGISpecialty ? '#00695C' : '#2E7D32',
                        margin: '0.2rem 0 0 0',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        {crop.isGISpecialty ? <Sparkles size={12} /> : <CheckCircle2 size={12} />}
                        <span>{reason}</span>
                      </p>
                    )}

                    {/* Estimated Profit snippet */}
                    {crop.areaProfitMin > 0 && (
                      <p style={{
                        fontSize: '0.72rem',
                        color: '#555',
                        margin: '0.2rem 0 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}>
                        <IndianRupee size={11} color="#1B5E20" />
                        <span>{t('estProfitForArea')}: <strong>₹{crop.areaProfitMin?.toLocaleString()} - ₹{crop.areaProfitMax?.toLocaleString()}</strong></span>
                      </p>
                    )}
                  </div>

                  <ChevronRight size={18} className="crop-card-arrow" />
                </div>
              );
            })}
          </div>
        )}

        {/* View Comparison Button */}
        <div className="comparison-cta-box" style={{ marginTop: '1.2rem' }}>
          <button
            type="button"
            className="btn-outline-compare"
            onClick={() => navigate('/compare')}
          >
            <BarChart2 size={20} color="#1B5E20" />
            <span>{t('viewAllComparison')}</span>
          </button>
        </div>
      </main>
    </div>
  );
}

