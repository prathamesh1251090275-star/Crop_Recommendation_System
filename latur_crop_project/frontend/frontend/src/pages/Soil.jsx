import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import {
  ChevronLeft,
  FlaskConical,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Save,
  ShieldCheck,
  ArrowRight,
  Sliders,
  Sprout
} from 'lucide-react';
import { validateSoilLabInputs } from '../data/soilLabEngine';

export default function Soil() {
  const navigate = useNavigate();
  const {
    lang,
    t,
    districtName,
    tehsilName,
    soilType,
    setSoilType,
    recommendationMode,
    setRecommendationMode,
    soilLabData,
    setSoilLabData,
    saveSoilLabProfile,
    clearSoilLabData,
    soilHealthGap
  } = useFarm();

  const [labForm, setLabForm] = useState(() => ({
    ph: soilLabData?.ph ?? '',
    ec: soilLabData?.ec ?? '',
    organicCarbon: soilLabData?.organicCarbon ?? '',
    nitrogen: soilLabData?.nitrogen ?? '',
    phosphorus: soilLabData?.phosphorus ?? '',
    potassium: soilLabData?.potassium ?? ''
  }));

  const [notification, setNotification] = useState('');

  const soilOptions = [
    { id: 'black', labelKey: 'soilBlack' },
    { id: 'red', labelKey: 'soilRed' },
    { id: 'rocky', labelKey: 'soilRocky' },
    { id: 'mixed', labelKey: 'soilMixed' }
  ];

  const handleLabChange = (field, val) => {
    const updated = { ...labForm, [field]: val };
    setLabForm(updated);

    const hasValues = Object.values(updated).some(v => v !== '' && v !== null);
    if (hasValues) {
      const parsedData = {
        ph: updated.ph !== '' ? Number(updated.ph) : 7.2,
        ec: updated.ec !== '' ? Number(updated.ec) : 0.45,
        organicCarbon: updated.organicCarbon !== '' ? Number(updated.organicCarbon) : 0.55,
        nitrogen: updated.nitrogen !== '' ? Number(updated.nitrogen) : 240,
        phosphorus: updated.phosphorus !== '' ? Number(updated.phosphorus) : 18,
        potassium: updated.potassium !== '' ? Number(updated.potassium) : 310
      };
      setSoilLabData(parsedData);
    }
  };

  const handleLoadSample = () => {
    const sample = {
      ph: 7.6,
      ec: 0.55,
      organicCarbon: 0.52,
      nitrogen: 220,
      phosphorus: 16,
      potassium: 340
    };
    setLabForm(sample);
    setSoilLabData(sample);
    setSoilType('black');
    setRecommendationMode('soil_lab');
    setNotification(t('sampleProfileLoaded'));
    setTimeout(() => setNotification(''), 4000);
  };

  const handleClear = () => {
    setLabForm({
      ph: '',
      ec: '',
      organicCarbon: '',
      nitrogen: '',
      phosphorus: '',
      potassium: ''
    });
    clearSoilLabData();
    setNotification(lang === 'mr' ? 'माती डेटा साफ केला गेला.' : 'Lab data reset.');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSaveProfile = () => {
    const activeLab = {
      ph: labForm.ph !== '' ? Number(labForm.ph) : 7.2,
      ec: labForm.ec !== '' ? Number(labForm.ec) : 0.45,
      organicCarbon: labForm.organicCarbon !== '' ? Number(labForm.organicCarbon) : 0.55,
      nitrogen: labForm.nitrogen !== '' ? Number(labForm.nitrogen) : 240,
      phosphorus: labForm.phosphorus !== '' ? Number(labForm.phosphorus) : 18,
      potassium: labForm.potassium !== '' ? Number(labForm.potassium) : 310
    };
    setSoilLabData(activeLab);
    saveSoilLabProfile(activeLab);
    setRecommendationMode('soil_lab');
    setNotification(t('soilReportSaved'));
    setTimeout(() => setNotification(''), 4000);
  };

  const handleGoToRecommendations = () => {
    const hasAnyValue = Object.values(labForm).some(v => v !== '' && v !== null);
    if (hasAnyValue) {
      setRecommendationMode('soil_lab');
      handleSaveProfile();
    }
    navigate('/recommendations');
  };

  const validation = validateSoilLabInputs(labForm);

  return (
    <div className="mobile-screen soil-screen">
      {/* Header Bar */}
      <div className="screen-header-bar">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="screen-header-text">
          <h2 className="screen-header-title">{t('soilLabTitle')}</h2>
          <p className="screen-header-sub">{districtName} • {tehsilName}</p>
        </div>
      </div>

      <main className="screen-content pad-body">
        {/* Mode Switcher Banner */}
        <div className="form-card" style={{ marginBottom: '1rem', border: '1.5px solid #80CBC4', background: '#F2FAF9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sliders size={18} color="#00695C" />
              <strong style={{ fontSize: '0.88rem', color: '#004D40' }}>{t('recommendationModeLabel')}</strong>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#00695C', fontWeight: 600 }}>{t('optionalBadge')}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className={`soil-chip-btn ${recommendationMode === 'standard' ? 'selected' : ''}`}
              style={{ padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}
              onClick={() => setRecommendationMode('standard')}
            >
              <Sprout size={14} color="#1B5E20" />
              <span>{t('modeStandard')}</span>
            </button>

            <button
              type="button"
              className={`soil-chip-btn ${recommendationMode === 'soil_lab' ? 'selected' : ''}`}
              style={{ padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}
              onClick={() => setRecommendationMode('soil_lab')}
            >
              <FlaskConical size={14} color="#00695C" />
              <span>{t('modeSoilLab')}</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div style={{
            background: '#E8F5E9',
            border: '1px solid #81C784',
            color: '#1B5E20',
            padding: '0.5rem 0.8rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            marginBottom: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <Sparkles size={16} />
            <span>{notification}</span>
          </div>
        )}

        {/* Soil Health Gap Analysis Card (If lab data available) */}
        {soilHealthGap && (
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #80CBC4',
            borderRadius: '12px',
            padding: '0.85rem',
            marginBottom: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #ECEFF1', paddingBottom: '0.5rem', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={18} color="#00695C" />
                <strong style={{ fontSize: '0.9rem', color: '#004D40' }}>{t('soilHealthGapTitle')}</strong>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '12px',
                color: soilHealthGap.badgeColor,
                background: soilHealthGap.badgeBg,
                border: `1px solid ${soilHealthGap.badgeColor}`
              }}>
                {soilHealthGap.healthScore}% • {lang === 'mr' ? soilHealthGap.healthStatus_mr : soilHealthGap.healthStatus_en}
              </span>
            </div>

            <p style={{ fontSize: '0.72rem', color: '#555', margin: '0 0 0.6rem 0' }}>
              {t('soilHealthGapSub')}
            </p>

            {/* Parameters Grid */}
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
                      padding: '0.45rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
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
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.65rem', color: '#555', lineHeight: 1.2 }}>
                      {lang === 'mr' ? item.gap_mr : item.gap_en}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Amelioration Advisory */}
            <div style={{ marginTop: '0.7rem', padding: '0.6rem', background: '#F1F8E9', borderRadius: '8px', border: '1px solid #C5E1A5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                <ShieldCheck size={16} color="#2E7D32" />
                <strong style={{ fontSize: '0.75rem', color: '#1B5E20' }}>
                  {lang === 'mr' ? 'माती सुधारणा सल्ला (Advisory):' : 'Corrective Soil Advisory:'}
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
                  <li>{lang === 'mr' ? 'मातीचे घटक सुस्थितीत आहेत; नियमित सेंद्रिय व्यवस्थापन सुरू ठेवा.' : 'Balanced soil fertility; maintain organic matter.'}</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Laboratory Inputs Form Card */}
        <div className="form-card" style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.92rem', color: '#1B5E20', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FlaskConical size={18} color="#1B5E20" />
            <span>{lang === 'mr' ? 'प्रयोगशाळा माती चाचणी अहवाल नोंदवा' : 'Enter Soil Test Laboratory Values'}</span>
          </h4>
          <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.8rem' }}>
            {lang === 'mr' ? 'तुमच्याकडील माती आरोग्य पत्रिकेतील (Soil Health Card) आकडे टाका:' : 'Enter tested values from your official Soil Health Card:'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.2rem' }}>
                {t('phLabel')}
              </label>
              <input
                type="number"
                step="0.1"
                min="3.0"
                max="11.0"
                placeholder="उदा. 7.2"
                value={labForm.ph}
                onChange={(e) => handleLabChange('ph', e.target.value)}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.2rem' }}>
                {t('ecLabel')} (dS/m)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="20"
                placeholder="उदा. 0.45"
                value={labForm.ec}
                onChange={(e) => handleLabChange('ec', e.target.value)}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.2rem' }}>
                {t('ocLabel')} (%)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="5.0"
                placeholder="उदा. 0.55"
                value={labForm.organicCarbon}
                onChange={(e) => handleLabChange('organicCarbon', e.target.value)}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.2rem' }}>
                {t('nitrogenLabel')} (kg/ha)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="1200"
                placeholder="उदा. 240"
                value={labForm.nitrogen}
                onChange={(e) => handleLabChange('nitrogen', e.target.value)}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.2rem' }}>
                {t('phosphorusLabel')} (kg/ha)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="300"
                placeholder="उदा. 18"
                value={labForm.phosphorus}
                onChange={(e) => handleLabChange('phosphorus', e.target.value)}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.2rem' }}>
                {t('potassiumLabel')} (kg/ha)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="1200"
                placeholder="उदा. 320"
                value={labForm.potassium}
                onChange={(e) => handleLabChange('potassium', e.target.value)}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Soil Type Selection */}
          <div style={{ marginTop: '0.9rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.4rem' }}>
              {t('soilTypeLabel')}
            </label>
            <div className="soil-options-grid">
              {soilOptions.map((opt) => {
                const isSelected = soilType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`soil-chip-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSoilType(opt.id)}
                  >
                    <div className="soil-radio-dot">
                      {isSelected && <div className="soil-radio-inner" />}
                    </div>
                    <span className="soil-chip-label">{t(opt.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={handleLoadSample}
              style={{
                flex: 1,
                background: '#00695C',
                color: '#FFF',
                border: 'none',
                padding: '0.5rem 0.6rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                cursor: 'pointer'
              }}
            >
              <Sparkles size={14} />
              <span>{t('loadSampleLabData')}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveProfile}
              style={{
                background: '#1B5E20',
                color: '#FFF',
                border: 'none',
                padding: '0.5rem 0.7rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                cursor: 'pointer'
              }}
            >
              <Save size={14} />
              <span>{t('saveSoilProfile')}</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              style={{
                background: '#ECEFF1',
                color: '#455A64',
                border: '1px solid #CFD8DC',
                padding: '0.5rem 0.6rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
              <span>{t('clearLabData')}</span>
            </button>
          </div>
        </div>

        {/* CTA Button to Recommendations */}
        <button
          type="button"
          className="btn-primary-large"
          style={{
            marginTop: '0.5rem',
            background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onClick={handleGoToRecommendations}
        >
          <span>{lang === 'mr' ? 'या मातीनुसार पीक शिफारसी पहा' : 'View Soil-Test-Based Crop Recommendations'}</span>
          <ArrowRight size={18} />
        </button>
      </main>
    </div>
  );
}
