import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import {
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Sparkles,
  CheckCircle2,
  IndianRupee,
  FlaskConical,
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck
} from 'lucide-react';

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
    addToHistory,
    recommendationMode,
    soilLabData,
    soilHealthGap
  } = useFarm();

  const [activeCategory, setActiveCategory] = useState('all');
  const [showGapAnalysis, setShowGapAnalysis] = useState(true);

  const isSoilLabMode = recommendationMode === 'soil_lab' && !!soilLabData;

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
        {/* =========================================================
            SMART SOIL LAB MODE BANNER & SOIL HEALTH GAP ANALYSIS CARD
           ========================================================= */}
        {isSoilLabMode && soilHealthGap && (
          <div style={{ marginBottom: '1.2rem' }}>
            {/* Mode Indicator Pill Bar */}
            <div
              style={{
                background: 'linear-gradient(135deg, #004D40 0%, #00796B 100%)',
                color: '#FFFFFF',
                borderRadius: '12px',
                padding: '0.7rem 0.9rem',
                boxShadow: '0 4px 12px rgba(0, 77, 64, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => setShowGapAnalysis(!showGapAnalysis)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.3rem', borderRadius: '50%' }}>
                  <FlaskConical size={18} color="#FFF" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <strong style={{ fontSize: '0.88rem' }}>{t('activeModeSoilLab')}</strong>
                    <span style={{ fontSize: '0.65rem', background: '#E0F2F1', color: '#004D40', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                      ICAR / SHC
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.72rem', opacity: 0.9 }}>
                    {lang === 'mr' ? 'माती परीक्षणानुसार पिकांची अचूक जुळणी व सुधारणा सल्ला' : 'Precision crop match & nutrient gap analysis'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}>
                <span>{showGapAnalysis ? t('hideSoilGapAnalysis') : t('viewSoilGapAnalysis')}</span>
                {showGapAnalysis ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {/* Collapsible Soil Health Gap Analysis Card */}
            {showGapAnalysis && (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1.5px solid #80CBC4',
                  marginTop: '0.5rem',
                  padding: '0.85rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                {/* Header with Health Score */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #ECEFF1', paddingBottom: '0.6rem', marginBottom: '0.7rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Activity size={18} color="#00695C" />
                    <strong style={{ fontSize: '0.9rem', color: '#004D40' }}>{t('soilHealthGapTitle')}</strong>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '20px',
                    color: soilHealthGap.badgeColor,
                    background: soilHealthGap.badgeBg,
                    border: `1px solid ${soilHealthGap.badgeColor}`
                  }}>
                    {soilHealthGap.healthScore}% • {lang === 'mr' ? soilHealthGap.healthStatus_mr : soilHealthGap.healthStatus_en}
                  </div>
                </div>

                {/* 6-Parameters Diagnostic Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {Object.entries(soilHealthGap.params).map(([key, item]) => {
                    const statusColor = item.status === 'good' ? '#1B5E20' : item.status === 'warning' ? '#E65100' : '#C62828';
                    const statusBg = item.status === 'good' ? '#E8F5E9' : item.status === 'warning' ? '#FFF3E0' : '#FFEBEE';
                    return (
                      <div
                        key={key}
                        style={{
                          background: '#F9FAF9',
                          border: `1px solid ${item.status === 'danger' ? '#EF9A9A' : '#E0E0E0'}`,
                          borderRadius: '8px',
                          padding: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#333' }}>
                            {key.toUpperCase()}
                          </span>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                            color: statusColor,
                            background: statusBg
                          }}>
                            {item.value} {key === 'ph' ? '' : key === 'ec' ? 'dS/m' : key === 'organicCarbon' ? '%' : 'kg/ha'}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.68rem', color: statusColor, fontWeight: 600 }}>
                          {lang === 'mr' ? item.label_mr : item.label_en}
                        </p>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.65rem', color: '#555', lineHeight: 1.2 }}>
                          {lang === 'mr' ? item.gap_mr : item.gap_en}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Corrective Action Summary Box */}
                <div style={{ marginTop: '0.7rem', padding: '0.6rem', background: '#F1F8E9', borderRadius: '8px', border: '1px solid #C5E1A5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                    <ShieldCheck size={16} color="#2E7D32" />
                    <strong style={{ fontSize: '0.75rem', color: '#1B5E20' }}>
                      {lang === 'mr' ? 'शास्त्रोक्त माती सुधारणा सल्ला (Corrective Advisory):' : 'Soil Amendment Guidance:'}
                    </strong>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.68rem', color: '#33691E', lineHeight: 1.35 }}>
                    {soilHealthGap.params.ph.status !== 'good' && (
                      <li>{lang === 'mr' ? soilHealthGap.params.ph.advisory_mr : soilHealthGap.params.ph.advisory_en}</li>
                    )}
                    {soilHealthGap.params.organicCarbon.status !== 'good' && (
                      <li>{lang === 'mr' ? soilHealthGap.params.organicCarbon.advisory_mr : soilHealthGap.params.organicCarbon.advisory_en}</li>
                    )}
                    {soilHealthGap.params.phosphorus.status !== 'good' && (
                      <li>{lang === 'mr' ? soilHealthGap.params.phosphorus.advisory_mr : soilHealthGap.params.phosphorus.advisory_en}</li>
                    )}
                    {soilHealthGap.params.ec.status !== 'good' && (
                      <li>{lang === 'mr' ? soilHealthGap.params.ec.advisory_mr : soilHealthGap.params.ec.advisory_en}</li>
                    )}
                    {soilHealthGap.params.potassium.status !== 'good' && (
                      <li>{lang === 'mr' ? soilHealthGap.params.potassium.advisory_mr : soilHealthGap.params.potassium.advisory_en}</li>
                    )}
                    {soilHealthGap.healthScore >= 80 && (
                      <li>{lang === 'mr' ? 'मातीतील मूलद्रव्ये समाधानकारक आहेत; सेंद्रिय खतांचा नियमित वापर कायम ठेवा.' : 'Soil elements are well balanced; maintain organic recycling.'}</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            RANKED CROPS LIST
           ========================================================= */}
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
              const hasLabMatch = isSoilLabMode && crop.soilLabMatch;

              return (
                <div
                  key={crop.id}
                  className="ranked-crop-card"
                  onClick={() => handleSelectCrop(crop)}
                  style={{
                    border: crop.isGISpecialty
                      ? '1.5px solid #00897B'
                      : hasLabMatch && crop.soilLabMatch.soilLabScore >= 85
                        ? '1.5px solid #2E7D32'
                        : '1px solid #EBEBEB',
                    background: crop.isGISpecialty
                      ? '#F2FAF9'
                      : hasLabMatch && crop.soilLabMatch.soilLabScore >= 85
                        ? '#F9FBF9'
                        : '#FFFFFF'
                  }}
                >
                  {/* Rank Number Circle */}
                  <div
                    className="rank-badge-circle"
                    style={{
                      backgroundColor: crop.isGISpecialty ? '#E0F2F1' : hasLabMatch ? '#E8F5E9' : '#FFF3E0',
                      color: crop.isGISpecialty ? '#00695C' : hasLabMatch ? '#1B5E20' : '#E65100',
                      borderColor: crop.isGISpecialty ? '#80CBC4' : hasLabMatch ? '#A5D6A7' : '#FFE082'
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

                    {/* Smart Soil Lab Match Pill (If in Soil Lab Mode) */}
                    {hasLabMatch && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.4rem',
                            borderRadius: '12px',
                            color: crop.soilLabMatch.matchColor,
                            background: crop.soilLabMatch.matchBg,
                            border: `1px solid ${crop.soilLabMatch.matchColor}`
                          }}
                        >
                          🧪 {t('soilScorePill')}: {crop.soilLabMatch.soilLabScore}%
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#666' }}>
                          ({lang === 'mr' ? crop.soilLabMatch.matchDegree_mr : crop.soilLabMatch.matchDegree_en})
                        </span>
                      </div>
                    )}

                    {/* Match reason snippet */}
                    {reason && (
                      <p style={{
                        fontSize: '0.72rem',
                        color: crop.isGISpecialty ? '#00695C' : hasLabMatch ? '#1B5E20' : '#2E7D32',
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

                    {/* Specific limitation warning if present */}
                    {hasLabMatch && crop.soilLabMatch.limitations_mr?.length > 0 && (
                      <p style={{
                        fontSize: '0.68rem',
                        color: '#D84315',
                        margin: '0.15rem 0 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontWeight: 600
                      }}>
                        <AlertTriangle size={11} color="#D84315" />
                        <span>{lang === 'mr' ? crop.soilLabMatch.limitations_mr[0] : crop.soilLabMatch.limitations_en[0]}</span>
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
