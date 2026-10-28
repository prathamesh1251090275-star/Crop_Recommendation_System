import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import RadialGauge from '../components/RadialGauge';
import {
  ChevronLeft,
  Search,
  X,
  Volume2,
  VolumeX,
  FileText,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Sprout,
  CloudRain,
  Thermometer,
  Droplets,
  Store,
  FlaskConical
} from 'lucide-react';

export default function CheckCrop() {
  const navigate = useNavigate();
  const {
    lang,
    t,
    crops,
    districtName,
    tehsilName,
    speakText,
    stopAudio,
    isPlayingAudio,
    addToHistory
  } = useFarm();

  const [selectedCropId, setSelectedCropId] = useState('cotton');
  const [searchTerm, setSearchTerm] = useState('');

  const crop = crops.find(c => c.id === selectedCropId) || crops[1];
  const cropName = lang === 'mr' ? crop.name_mr : crop.name_en;

  const handleAudio = () => {
    if (isPlayingAudio) {
      stopAudio();
    } else {
      const speech = lang === 'mr' ? crop.audioText_mr : crop.advice_en;
      speakText(speech);
    }
  };

  const handleSelectCrop = (cId) => {
    setSelectedCropId(cId);
    addToHistory(cId);
  };

  const filteredCrops = crops.filter(c => {
    const term = searchTerm.toLowerCase();
    return c.name_mr.includes(term) || c.name_en.toLowerCase().includes(term);
  });

  return (
    <div className="mobile-screen check-screen">
      {/* Top Navbar */}
      <div className="screen-header-bar">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="screen-header-title">{t('checkCropHeader')}</h2>
      </div>

      <main className="screen-content pad-body">
        {/* Search / Select Bar */}
        <div className="search-input-box">
          <Search size={18} color="#666" />
          <input
            type="text"
            placeholder={t('searchCropPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field"
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick horizontal crop selector chips */}
        <div className="quick-crop-chips-bar">
          {(searchTerm ? filteredCrops : crops).map(c => (
            <button
              key={c.id}
              type="button"
              className={`crop-chip-pill ${c.id === selectedCropId ? 'active' : ''}`}
              onClick={() => handleSelectCrop(c.id)}
            >
              <span>{c.icon}</span>
              <span>{lang === 'mr' ? c.name_mr : c.name_en}</span>
            </button>
          ))}
        </div>

        {/* Selected Crop Card with Gauge */}
        <div className="selected-crop-card">
          <div className="selected-crop-top">
            <div className="crop-avatar-thumb">
              <img
                src={crop.image}
                alt={cropName}
                className="crop-avatar-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="selected-crop-titles">
              <h3 className="crop-title-large">{cropName}</h3>
              <p className="crop-location-sub">
                {districtName} • {tehsilName}
              </p>
            </div>
          </div>

          <div className="gauge-status-center">
            <RadialGauge score={crop.score} label={t('suitabilityScore')} />
            <div className="gauge-status-badge">
              <span
                className="crop-status-pill-large"
                style={{ color: crop.badgeColor, backgroundColor: crop.badgeBg }}
              >
                {t(crop.badgeKey)}
              </span>
            </div>
          </div>

          {/* Regional Analysis Breakdown */}
          <div className="regional-analysis-box">
            <h4 className="analysis-box-title">{t('regionalAnalysis')}</h4>

            <div className="factor-checks-list">
              {/* Soil */}
              <div className="factor-check-row">
                <div className="factor-name-side">
                  <Sprout size={16} color="#2E7D32" />
                  <span>{t('factorSoil')} ({crop.factors.soil}%)</span>
                </div>
                <div className={`factor-status-side ${crop.factors.soil < 65 ? 'status-warn' : 'status-good'}`}>
                  {crop.factors.soil < 65 ? (
                    <AlertTriangle size={16} color="#E65100" />
                  ) : (
                    <CheckCircle2 size={16} color="#2E7D32" />
                  )}
                  <span>{lang === 'mr' ? crop.factors.soilStatus_mr : crop.factors.soilStatus_en}</span>
                </div>
              </div>

              {/* Rain */}
              <div className="factor-check-row">
                <div className="factor-name-side">
                  <CloudRain size={16} color="#1565C0" />
                  <span>{t('factorRain')} ({crop.factors.rain}%)</span>
                </div>
                <div className={`factor-status-side ${crop.factors.rain < 65 ? 'status-warn' : 'status-good'}`}>
                  {crop.factors.rain < 65 ? (
                    <AlertTriangle size={16} color="#E65100" />
                  ) : (
                    <CheckCircle2 size={16} color="#2E7D32" />
                  )}
                  <span>{lang === 'mr' ? crop.factors.rainStatus_mr : crop.factors.rainStatus_en}</span>
                </div>
              </div>

              {/* Temp */}
              <div className="factor-check-row">
                <div className="factor-name-side">
                  <Thermometer size={16} color="#D84315" />
                  <span>{t('factorTemp')} ({crop.factors.temp}%)</span>
                </div>
                <div className={`factor-status-side ${crop.factors.temp < 65 ? 'status-warn' : 'status-good'}`}>
                  {crop.factors.temp < 65 ? (
                    <AlertTriangle size={16} color="#E65100" />
                  ) : (
                    <CheckCircle2 size={16} color="#2E7D32" />
                  )}
                  <span>{lang === 'mr' ? crop.factors.tempStatus_mr : crop.factors.tempStatus_en}</span>
                </div>
              </div>

              {/* Irrigation */}
              <div className="factor-check-row">
                <div className="factor-name-side">
                  <Droplets size={16} color="#0288D1" />
                  <span>{t('factorIrrigation')} ({crop.factors.irrigation}%)</span>
                </div>
                <div className={`factor-status-side ${crop.factors.irrigation < 65 ? 'status-warn' : 'status-good'}`}>
                  {crop.factors.irrigation < 65 ? (
                    <AlertTriangle size={16} color="#E65100" />
                  ) : (
                    <CheckCircle2 size={16} color="#2E7D32" />
                  )}
                  <span>{lang === 'mr' ? crop.factors.irrigationStatus_mr : crop.factors.irrigationStatus_en}</span>
                </div>
              </div>

              {/* Market */}
              <div className="factor-check-row">
                <div className="factor-name-side">
                  <Store size={16} color="#7B1FA2" />
                  <span>{t('factorMarket')} ({crop.factors.market}%)</span>
                </div>
                <div className={`factor-status-side ${crop.factors.market < 65 ? 'status-warn' : 'status-good'}`}>
                  {crop.factors.market < 65 ? (
                    <AlertTriangle size={16} color="#E65100" />
                  ) : (
                    <CheckCircle2 size={16} color="#2E7D32" />
                  )}
                  <span>{lang === 'mr' ? crop.factors.marketStatus_mr : crop.factors.marketStatus_en}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Soil Lab Match Badge */}
          {crop.soilLabMatch && (
            <div style={{ marginTop: '0.8rem', padding: '0.5rem 0.7rem', background: '#E0F2F1', borderRadius: '8px', fontSize: '0.75rem', color: '#004D40', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #80CBC4' }}>
              <FlaskConical size={16} color="#00695C" />
              <span><strong>{lang === 'mr' ? 'लॅब माती चाचणी जुळणी:' : 'Lab Soil Test Match:'}</strong> {crop.soilLabMatch.soilLabScore}% ({lang === 'mr' ? crop.soilLabMatch.matchDegree_mr : crop.soilLabMatch.matchDegree_en})</span>
            </div>
          )}

          {/* Advice Bulb Banner */}
          <div className="guidance-banner" style={{ marginTop: '1rem' }}>
            <Lightbulb size={22} color={crop.notSuitable ? '#B3261E' : '#E65100'} />
            <p className="guidance-text">
              {crop.isGISpecialty
                ? (lang === 'mr'
                  ? `🌟 ${cropName} हे ${districtName} भागातील विशेष प्रसिद्ध व भौगोलिकदृष्ट्या सर्वोत्तम पीक मानले जाते.`
                  : `🌟 ${cropName} is a celebrated GI specialty crop of ${districtName} with high regional fit.`)
                : crop.notSuitable
                ? (lang === 'mr'
                  ? `⚠️ ${cropName} आपल्या जमिनीसाठी किंवा पाण्याच्या स्थितीसाठी कमी योग्य आहे. कृपया वरील घटकांवर लक्ष द्या.`
                  : `⚠️ ${cropName} has low suitability under your current soil/water conditions.`)
                : (lang === 'mr' ? crop.advice_mr : crop.advice_en)
              }
            </p>
          </div>

          {/* Two Action Buttons: Listen Audio & Detailed Info */}
          <div className="check-action-buttons-row">
            <button
              type="button"
              className={`btn-audio-listen ${isPlayingAudio ? 'playing' : ''}`}
              onClick={handleAudio}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX size={18} color="#1B5E20" />
                  <span>{t('stopAudio')}</span>
                </>
              ) : (
                <>
                  <Volume2 size={18} color="#1B5E20" />
                  <span>{t('listenAudio')}</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-details-primary"
              onClick={() => navigate(`/crop/${crop.id}`)}
            >
              <FileText size={18} color="#FFF" />
              <span>{t('detailedInfo')}</span>
            </button>
          </div>
        </div>
      </main>

      </div>
  );
}
