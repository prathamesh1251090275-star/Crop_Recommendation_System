import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import Header from '../components/Header';
import {
  ChevronLeft,
  Sprout,
  HelpCircle,
  FlaskConical,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { validateSoilLabInputs } from '../data/soilLabEngine';

export default function FindCropForm() {
  const navigate = useNavigate();
  const {
    lang,
    t,
    landArea,
    setLandArea,
    landUnit,
    setLandUnit,
    soilType,
    setSoilType,
    waterSource,
    setWaterSource,
    season,
    setSeason,
    recommendationMode,
    setRecommendationMode,
    soilLabData,
    setSoilLabData,
    saveSoilLabProfile,
    clearSoilLabData
  } = useFarm();

  // Local form state for lab values
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

  const waterOptions = [
    { id: 'rainfed', labelKey: 'waterRainfed' },
    { id: 'limited', labelKey: 'waterLimited' },
    { id: 'canal', labelKey: 'waterCanal' },
    { id: 'drip', labelKey: 'waterDrip' }
  ];

  const seasonOptions = [
    { id: 'all', labelKey: 'seasonAll' },
    { id: 'kharif', labelKey: 'seasonKharif' },
    { id: 'rabi', labelKey: 'seasonRabi' },
    { id: 'summer', labelKey: 'seasonSummer' },
    { id: 'annual', labelKey: 'seasonAnnual' }
  ];

  const handleLabChange = (field, val) => {
    const updated = { ...labForm, [field]: val };
    setLabForm(updated);

    // If at least pH or EC or NPK is entered, keep soilLabData in sync
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
    setNotification(t('sampleProfileLoaded'));
    setTimeout(() => setNotification(''), 4000);
  };

  const handleClearLab = () => {
    setLabForm({
      ph: '',
      ec: '',
      organicCarbon: '',
      nitrogen: '',
      phosphorus: '',
      potassium: ''
    });
    clearSoilLabData();
    setNotification(lang === 'mr' ? 'लॅब डेटा साफ केला गेला.' : 'Lab data reset.');
    setTimeout(() => setNotification(''), 3000);
  };

  const validation = validateSoilLabInputs(
    recommendationMode === 'soil_lab' ? labForm : null
  );

  const handleProceed = (e) => {
    e.preventDefault();

    if (recommendationMode === 'soil_lab') {
      // Validate inputs
      const hasAnyValue = Object.values(labForm).some(v => v !== '' && v !== null);
      if (hasAnyValue) {
        const valRes = validateSoilLabInputs(labForm);
        if (!valRes.isValid) {
          alert(Object.values(valRes.errors)[0]);
          return;
        }
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
      } else {
        // If left completely blank, fallback safely to standard mode
        setRecommendationMode('standard');
      }
    }

    navigate('/recommendations');
  };

  return (
    <div className="mobile-screen form-screen">
      {/* Top Navbar */}
      <div className="screen-header-bar">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="screen-header-title">{t('farmDetailsTitle')}</h2>
      </div>

      <main className="screen-content pad-body">
        <h3 className="form-heading-sub">{t('farmDetailsSub')}</h3>

        {/* =========================================================
            RECOMMENDATION MODE SELECTOR (Standard vs Smart Soil Lab)
           ========================================================= */}
        <div className="form-card" style={{ marginBottom: '1rem', border: '1.5px solid #C8E6C9', background: '#FAFCFA' }}>
          <label className="form-label" style={{ marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1B5E20' }}>
            <Sliders size={18} color="#1B5E20" />
            <span>{t('recommendationModeLabel')}</span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {/* Mode 1: Standard (Default) */}
            <button
              type="button"
              className={`soil-chip-btn ${recommendationMode === 'standard' ? 'selected' : ''}`}
              style={{
                height: 'auto',
                padding: '0.6rem',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left'
              }}
              onClick={() => setRecommendationMode('standard')}
            >
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
                  <Sprout size={16} color="#1B5E20" />
                  <span>{t('modeStandard')}</span>
                </div>
                <span style={{ fontSize: '0.65rem', background: '#E8F5E9', color: '#1B5E20', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                  {t('modeStandardBadge')}
                </span>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#666', margin: 0, lineHeight: 1.2 }}>
                {t('modeStandardDesc')}
              </p>
            </button>

            {/* Mode 2: Smart Soil Lab (Optional) */}
            <button
              type="button"
              className={`soil-chip-btn ${recommendationMode === 'soil_lab' ? 'selected' : ''}`}
              style={{
                height: 'auto',
                padding: '0.6rem',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left'
              }}
              onClick={() => setRecommendationMode('soil_lab')}
            >
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, color: '#00695C' }}>
                  <FlaskConical size={16} color="#00695C" />
                  <span>{t('modeSoilLab')}</span>
                </div>
                <span style={{ fontSize: '0.65rem', background: '#E0F2F1', color: '#00695C', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                  {t('modeSoilLabBadge')}
                </span>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#666', margin: 0, lineHeight: 1.2 }}>
                {t('modeSoilLabDesc')}
              </p>
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

        <form onSubmit={handleProceed} className="crop-search-form">
          {/* =========================================================
              SMART SOIL LAB INPUT CARD (Visible when Soil Lab Mode is Active)
             ========================================================= */}
          {recommendationMode === 'soil_lab' && (
            <div className="form-card" style={{ marginBottom: '1rem', border: '1.5px solid #80CBC4', background: '#F2FAF9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FlaskConical size={20} color="#00695C" />
                  <strong style={{ fontSize: '0.95rem', color: '#004D40' }}>{t('soilLabTitle')}</strong>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#00695C', fontWeight: 600 }}>{t('optionalBadge')}</span>
              </div>

              <p style={{ fontSize: '0.75rem', color: '#455A64', marginBottom: '0.8rem' }}>
                {t('soilLabSub')}
              </p>

              {/* 2-Column Grid for Lab Parameters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
                {/* 1. Soil pH */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.2rem' }}>
                    {t('phLabel')} <span style={{ color: '#888', fontWeight: 400 }}>(3.5 - 9.5)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="3.0"
                    max="11.0"
                    placeholder="उदा. 7.2"
                    value={labForm.ph}
                    onChange={(e) => handleLabChange('ph', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '8px',
                      border: validation.errors.ph ? '1.5px solid #D32F2F' : '1px solid #B0BEC5',
                      fontSize: '0.85rem'
                    }}
                  />
                  {labForm.ph && (
                    <span style={{ fontSize: '0.68rem', color: Number(labForm.ph) >= 6.5 && Number(labForm.ph) <= 7.5 ? '#1B5E20' : '#E65100' }}>
                      {Number(labForm.ph) < 6.5 ? 'आम्लधर्मी (Acidic)' : Number(labForm.ph) <= 7.5 ? 'उदासीन (Optimal)' : 'विम्लधर्मी (Alkaline)'}
                    </span>
                  )}
                </div>

                {/* 2. Electrical Conductivity (EC) */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.2rem' }}>
                    {t('ecLabel')} <span style={{ color: '#888', fontWeight: 400 }}>(dS/m)</span>
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="20"
                    placeholder="उदा. 0.45"
                    value={labForm.ec}
                    onChange={(e) => handleLabChange('ec', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '8px',
                      border: validation.errors.ec ? '1.5px solid #D32F2F' : '1px solid #B0BEC5',
                      fontSize: '0.85rem'
                    }}
                  />
                  {labForm.ec && (
                    <span style={{ fontSize: '0.68rem', color: Number(labForm.ec) <= 1.0 ? '#1B5E20' : '#E65100' }}>
                      {Number(labForm.ec) <= 1.0 ? 'सुरक्षित (< 1.0)' : 'मध्यम/जादा क्षारता'}
                    </span>
                  )}
                </div>

                {/* 3. Organic Carbon (OC) */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.2rem' }}>
                    {t('ocLabel')} <span style={{ color: '#888', fontWeight: 400 }}>(%)</span>
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="5.0"
                    placeholder="उदा. 0.55"
                    value={labForm.organicCarbon}
                    onChange={(e) => handleLabChange('organicCarbon', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '8px',
                      border: validation.errors.organicCarbon ? '1.5px solid #D32F2F' : '1px solid #B0BEC5',
                      fontSize: '0.85rem'
                    }}
                  />
                  {labForm.organicCarbon && (
                    <span style={{ fontSize: '0.68rem', color: Number(labForm.organicCarbon) >= 0.50 ? '#1B5E20' : '#D32F2F' }}>
                      {Number(labForm.organicCarbon) < 0.50 ? 'कमी (< 0.50%)' : Number(labForm.organicCarbon) <= 0.75 ? 'मध्यम' : 'भरपूर (> 0.75%)'}
                    </span>
                  )}
                </div>

                {/* 4. Available Nitrogen (N) */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.2rem' }}>
                    {t('nitrogenLabel')} <span style={{ color: '#888', fontWeight: 400 }}>(kg/ha)</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="1200"
                    placeholder="उदा. 240"
                    value={labForm.nitrogen}
                    onChange={(e) => handleLabChange('nitrogen', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '8px',
                      border: '1px solid #B0BEC5',
                      fontSize: '0.85rem'
                    }}
                  />
                  {labForm.nitrogen && (
                    <span style={{ fontSize: '0.68rem', color: Number(labForm.nitrogen) >= 280 ? '#1B5E20' : '#D32F2F' }}>
                      {Number(labForm.nitrogen) < 280 ? 'कमी (< 280)' : 'मध्यम/भरपूर'}
                    </span>
                  )}
                </div>

                {/* 5. Available Phosphorus (P) */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.2rem' }}>
                    {t('phosphorusLabel')} <span style={{ color: '#888', fontWeight: 400 }}>(kg/ha)</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="300"
                    placeholder="उदा. 18"
                    value={labForm.phosphorus}
                    onChange={(e) => handleLabChange('phosphorus', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '8px',
                      border: '1px solid #B0BEC5',
                      fontSize: '0.85rem'
                    }}
                  />
                  {labForm.phosphorus && (
                    <span style={{ fontSize: '0.68rem', color: Number(labForm.phosphorus) >= 23 ? '#1B5E20' : '#D32F2F' }}>
                      {Number(labForm.phosphorus) < 23 ? 'कमी (< 23)' : 'मध्यम/भरपूर'}
                    </span>
                  )}
                </div>

                {/* 6. Available Potassium (K) */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333', display: 'block', marginBottom: '0.2rem' }}>
                    {t('potassiumLabel')} <span style={{ color: '#888', fontWeight: 400 }}>(kg/ha)</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="1200"
                    placeholder="उदा. 320"
                    value={labForm.potassium}
                    onChange={(e) => handleLabChange('potassium', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '8px',
                      border: '1px solid #B0BEC5',
                      fontSize: '0.85rem'
                    }}
                  />
                  {labForm.potassium && (
                    <span style={{ fontSize: '0.68rem', color: Number(labForm.potassium) >= 140 ? '#1B5E20' : '#D32F2F' }}>
                      {Number(labForm.potassium) < 140 ? 'कमी (< 140)' : Number(labForm.potassium) <= 280 ? 'मध्यम' : 'भरपूर (> 280)'}
                    </span>
                  )}
                </div>
              </div>

              {/* Lab Quick Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  style={{
                    flex: 1,
                    background: '#00695C',
                    color: '#FFF',
                    border: 'none',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '6px',
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
                  onClick={handleClearLab}
                  style={{
                    background: '#ECEFF1',
                    color: '#455A64',
                    border: '1px solid #CFD8DC',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '6px',
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
          )}

          {/* Land Area Field */}
          <div className="form-card">
            <div className="form-field-header">
              <Sprout size={20} color="#1B5E20" />
              <label className="form-label">{t('landAreaLabel')}</label>
            </div>

            <div className="input-with-unit-group">
              <input
                type="number"
                min="0.25"
                max="500"
                step="0.5"
                value={landArea}
                onChange={(e) => setLandArea(Number(e.target.value) || 1)}
                className="number-input-field"
                required
              />
              <select
                value={landUnit}
                onChange={(e) => setLandUnit(e.target.value)}
                className="unit-select-field"
              >
                <option value="acre">{t('unitAcre')}</option>
                <option value="guntha">{t('unitGuntha')}</option>
                <option value="hectare">{t('unitHectare')}</option>
              </select>
            </div>
            <span className="field-hint-text">{t('approxArea')}</span>
          </div>

          {/* Soil Type Field */}
          <div className="form-card" style={{ marginTop: '1rem' }}>
            <label className="form-label" style={{ marginBottom: '0.8rem', display: 'block' }}>
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

          {/* Water Availability / Irrigation Field */}
          <div className="form-card" style={{ marginTop: '1rem' }}>
            <label className="form-label" style={{ marginBottom: '0.8rem', display: 'block' }}>
              {t('waterSourceLabel')}
            </label>

            <div className="soil-options-grid">
              {waterOptions.map((opt) => {
                const isSelected = waterSource === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`soil-chip-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setWaterSource(opt.id)}
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

          {/* Season Field */}
          <div className="form-card" style={{ marginTop: '1rem' }}>
            <label className="form-label" style={{ marginBottom: '0.8rem', display: 'block' }}>
              {t('seasonLabel')}
            </label>

            <div className="soil-options-grid">
              {seasonOptions.map((opt) => {
                const isSelected = season === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`soil-chip-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSeason(opt.id)}
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

          {/* Info Banner */}
          <div className="guidance-banner" style={{ marginTop: '1rem' }}>
            <div className="guidance-icon">
              <HelpCircle size={22} color="#2E7D32" />
            </div>
            <p className="guidance-text">
              {recommendationMode === 'soil_lab'
                ? (lang === 'mr' ? 'प्रयोगशाळेतील माती चाचणीनुसार अचूक, शास्त्रोक्त पिके व अन्नद्रव्य शिफारसी दर्शविल्या जातील.' : 'Scientific recommendations refined by your laboratory soil test values will be generated.')
                : t('formInfoBanner')}
            </p>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary-large" style={{ marginTop: '1rem' }}>
            {t('proceedButton')}
          </button>
        </form>
      </main>
    </div>
  );
}
