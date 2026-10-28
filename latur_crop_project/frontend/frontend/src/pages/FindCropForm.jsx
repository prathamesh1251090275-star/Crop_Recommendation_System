import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import Header from '../components/Header';
import { ChevronLeft, Sprout, HelpCircle, Check } from 'lucide-react';

export default function FindCropForm() {
  const navigate = useNavigate();
  const {
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
    setSeason
  } = useFarm();

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

  const handleProceed = (e) => {
    e.preventDefault();
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

        <form onSubmit={handleProceed} className="crop-search-form">
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
            <p className="guidance-text">{t('formInfoBanner')}</p>
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
