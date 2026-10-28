import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import {
  ChevronLeft,
  Bookmark,
  Calendar,
  Clock,
  TrendingUp,
  Boxes,
  IndianRupee,
  Volume2,
  VolumeX,
  FileText,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Activity
} from 'lucide-react';

export default function CropDetails() {
  const { name } = useParams();
  const navigate = useNavigate();
  const {
    lang,
    t,
    crops,
    landArea,
    landUnit,
    normalizedAcres,
    districtName,
    districtMandi,
    bookmarks,
    toggleBookmark,
    speakText,
    stopAudio,
    isPlayingAudio,
    soilLabData
  } = useFarm();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'technical' | 'market'

  const crop = crops.find(c => c.id === name) || crops[0];
  const mandi = districtMandi[crop.id];
  const cropName = lang === 'mr' ? crop.name_mr : crop.name_en;
  const isBookmarked = bookmarks.includes(crop.id);

  const getUnitName = () => {
    if (landUnit === 'guntha') return t('unitGuntha');
    if (landUnit === 'hectare') return t('unitHectare');
    return t('unitAcre');
  };

  const handleAudio = () => {
    if (isPlayingAudio) {
      stopAudio();
    } else {
      const speech = lang === 'mr' ? crop.audioText_mr : crop.advice_en;
      speakText(speech);
    }
  };

  return (
    <div className="mobile-screen crop-details-screen">
      {/* Top Navbar */}
      <div className="screen-header-bar">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="screen-header-title">{cropName}</h2>
        <button
          type="button"
          className="bookmark-btn"
          onClick={() => toggleBookmark(crop.id)}
        >
          <Bookmark
            size={22}
            color={isBookmarked ? '#1B5E20' : '#666'}
            fill={isBookmarked ? '#1B5E20' : 'none'}
          />
        </button>
      </div>

      <main className="screen-content pad-body">
        {/* Hero Crop Banner */}
        <div className="crop-hero-card">
          <img
            src={crop.image}
            alt={cropName}
            className="crop-hero-img"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="crop-hero-overlay">
            <div className="hero-badge-pill" style={{
              background: crop.isGISpecialty ? '#00695C' : undefined
            }}>
              <span className="hero-badge-pct">{crop.score}%</span>
              <span className="hero-badge-text">{crop.isGISpecialty ? t('badgeGISpecialty') : t('suitabilityScore')}</span>
            </div>
          </div>
        </div>

        {/* Regional Specialty Banner */}
        {crop.isGISpecialty && (
          <div className="guidance-banner" style={{ marginTop: '0.8rem', background: '#E0F2F1', borderColor: '#80CBC4' }}>
            <CheckCircle2 size={20} color="#00695C" />
            <p className="guidance-text" style={{ color: '#004D40' }}>
              <strong>{cropName}</strong> {lang === 'mr' ? `हे ${districtName} परिसरातील प्रसिद्ध व सर्वोत्तम उत्पन्न देणारे पीक आहे.` : `is a premier regional specialty of ${districtName}.`}
            </p>
          </div>
        )}

        {/* Not-suitable warning for low-fit regions */}
        {crop.notSuitable && (
          <div className="warning-banner" style={{ marginTop: '1rem' }}>
            <AlertCircle size={22} color="#B3261E" />
            <div>
              <strong className="warning-title">{t('notSuitableTitle')}</strong>
              <p className="warning-text">
                {t('notSuitableText', { crop: cropName, district: districtName, rank: crop.rank })}
              </p>
            </div>
          </div>
        )}

        {/* 3 Navigation Tabs */}
        <div className="tabs-bar">
          <button
            type="button"
            className={`tab-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            {t('tabGeneral')}
          </button>
          <button
            type="button"
            className={`tab-item ${activeTab === 'technical' ? 'active' : ''}`}
            onClick={() => setActiveTab('technical')}
          >
            {t('tabTechnical')}
          </button>
          <button
            type="button"
            className={`tab-item ${activeTab === 'market' ? 'active' : ''}`}
            onClick={() => setActiveTab('market')}
          >
            {t('tabMarket')}
          </button>
        </div>

        {/* TAB 1: General & Economics (Screen 4 View) */}
        {activeTab === 'general' && (
          <div className="tab-content-area">
            {/* Acre Estimates Section */}
            <div className="info-box-card">
              <h4 className="info-box-title">
                {lang === 'mr' ? `${landArea} ${getUnitName()} जमिनीसाठी अंदाजे उत्पादन` : `Estimated Yield for ${landArea} ${getUnitName()}`}
              </h4>

              <div className="key-value-list">
                <div className="kv-row">
                  <div className="kv-label-group">
                    <Calendar size={18} color="#1B5E20" />
                    <span>{t('sowingTime')}</span>
                  </div>
                  <strong className="kv-value">
                    {lang === 'mr' ? crop.sowingPeriod_mr : crop.sowingPeriod_en}
                  </strong>
                </div>

                <div className="kv-row">
                  <div className="kv-label-group">
                    <Clock size={18} color="#1B5E20" />
                    <span>{t('harvestTime')}</span>
                  </div>
                  <strong className="kv-value">
                    {lang === 'mr' ? crop.harvestPeriod_mr : crop.harvestPeriod_en}
                  </strong>
                </div>

                <div className="kv-row">
                  <div className="kv-label-group">
                    <TrendingUp size={18} color="#1B5E20" />
                    <span>{t('approxYield')} ({t('perAcre')})</span>
                  </div>
                  <strong className="kv-value">
                    {crop.yieldPerAcreMin} - {crop.yieldPerAcreMax}{' '}
                    {lang === 'mr' ? crop.yieldUnit_mr : crop.yieldUnit_en}
                  </strong>
                </div>

                <div className="kv-row">
                  <div className="kv-label-group">
                    <Boxes size={18} color="#1B5E20" />
                    <span>{lang === 'mr' ? `एकूण उत्पादन (${landArea} ${getUnitName()})` : `Total Yield (${landArea} ${getUnitName()})`}</span>
                  </div>
                  <strong className="kv-value">
                    {crop.areaYieldMin} - {crop.areaYieldMax} {t('quintals')}
                  </strong>
                </div>
              </div>
            </div>

            {/* Economics & Profit Section */}
            <div className="info-box-card" style={{ marginTop: '1rem' }}>
              <h4 className="info-box-title">
                {lang === 'mr' ? `${landArea} ${getUnitName()} जमिनीसाठी अंदाजे खर्च व उत्पन्न` : `Estimated Economics for ${landArea} ${getUnitName()}`}
              </h4>

              <div className="key-value-list">
                <div className="kv-row">
                  <span>{t('sowingCost')}</span>
                  <span className="kv-cost">
                    ₹ {Math.round(crop.areaCostMin * 0.45).toLocaleString()} - {Math.round(crop.areaCostMax * 0.45).toLocaleString()}
                  </span>
                </div>

                <div className="kv-row">
                  <span>{t('maintenanceCost')}</span>
                  <span className="kv-cost">
                    ₹ {Math.round(crop.areaCostMin * 0.55).toLocaleString()} - {Math.round(crop.areaCostMax * 0.55).toLocaleString()}
                  </span>
                </div>

                <div className="kv-row divider-row">
                  <strong>{t('totalCost')}</strong>
                  <strong className="kv-cost-total">
                    ₹ {crop.areaCostMin?.toLocaleString()} - {crop.areaCostMax?.toLocaleString()}
                  </strong>
                </div>

                <div className="kv-row">
                  <span>{t('approxRevenue')}</span>
                  <span className="kv-revenue">
                    ₹ {crop.areaRevenueMin?.toLocaleString()} - {crop.areaRevenueMax?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Profit Highlight Box */}
              <div className="profit-highlight-card" style={{ marginTop: '0.8rem' }}>
                <span className="profit-label">{lang === 'mr' ? `अंदाजे निव्वळ नफा (${landArea} ${getUnitName()})` : `Estimated Net Profit (${landArea} ${getUnitName()})`}</span>
                <span className="profit-amount">
                  ₹ {crop.areaProfitMin?.toLocaleString()} - {crop.areaProfitMax?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Technical Agronomy & Tips (Screen 7 View) */}
        {activeTab === 'technical' && (
          <div className="tab-content-area">
            <div className="info-box-card">
              <h4 className="info-box-title">
                {cropName} - {t('tabTechnical')}
              </h4>

              <div className="key-value-list">
                <div className="kv-row">
                  <span className="tech-prop">{t('soilTypeReq')}</span>
                  <strong className="tech-val">
                    {lang === 'mr' ? crop.agronomy.soilType_mr : crop.agronomy.soilType_en}
                  </strong>
                </div>

                <div className="kv-row">
                  <span className="tech-prop">{t('rainfallReq')}</span>
                  <strong className="tech-val">
                    {lang === 'mr' ? crop.agronomy.rainfall_mr : crop.agronomy.rainfall_en}
                  </strong>
                </div>

                <div className="kv-row">
                  <span className="tech-prop">{t('tempReq')}</span>
                  <strong className="tech-val">
                    {lang === 'mr' ? crop.agronomy.temp_mr : crop.agronomy.temp_en}
                  </strong>
                </div>

                <div className="kv-row">
                  <span className="tech-prop">{t('durationReq')}</span>
                  <strong className="tech-val">
                    {lang === 'mr' ? crop.agronomy.duration_mr : crop.agronomy.duration_en}
                  </strong>
                </div>

                <div className="kv-row">
                  <span className="tech-prop">{t('waterReq')}</span>
                  <strong className="tech-val">
                    {lang === 'mr' ? crop.agronomy.waterNeed_mr : crop.agronomy.waterNeed_en}
                  </strong>
                </div>

                <div className="kv-row">
                  <span className="tech-prop">{t('seedRateReq')}</span>
                  <strong className="tech-val">
                    {lang === 'mr' ? crop.agronomy.seedRate_mr : crop.agronomy.seedRate_en}
                  </strong>
                </div>

                <div className="kv-row">
                  <span className="tech-prop">{t('fertilizerReq')}</span>
                  <strong className="tech-val">
                    {lang === 'mr' ? crop.agronomy.fertilizer_mr : crop.agronomy.fertilizer_en}
                  </strong>
                </div>
              </div>
            </div>

                        {/* Smart Soil Lab Diagnostic Card (if lab data available) */}
            {crop.soilLabMatch && (
              <div className="info-box-card" style={{ marginTop: '1rem', border: '1.5px solid #80CBC4', background: '#F2FAF9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FlaskConical size={18} color="#00695C" />
                    <h4 className="info-box-title" style={{ margin: 0, color: '#004D40' }}>
                      {lang === 'mr' ? 'शास्त्रोक्त माती जुळणी अहवाल' : 'Scientific Soil Lab Diagnostic'}
                    </h4>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                    color: crop.soilLabMatch.matchColor,
                    background: crop.soilLabMatch.matchBg,
                    border: `1px solid ${crop.soilLabMatch.matchColor}`
                  }}>
                    {crop.soilLabMatch.soilLabScore}% जुळणी
                  </span>
                </div>

                <div className="key-value-list">
                  <div className="kv-row">
                    <span>{lang === 'mr' ? 'आदर्श सामू (Ideal pH)' : 'Ideal pH Range'}</span>
                    <strong>{crop.soilLabMatch.cropProfile.phOpt[0]} - {crop.soilLabMatch.cropProfile.phOpt[1]} (तुमचा: {soilLabData?.ph})</strong>
                  </div>
                  <div className="kv-row">
                    <span>{lang === 'mr' ? 'कमाल क्षारता मर्यादा' : 'Max Salinity Limit'}</span>
                    <strong>{crop.soilLabMatch.cropProfile.ecMax} dS/m (तुमची: {soilLabData?.ec} dS/m)</strong>
                  </div>
                  <div className="kv-row">
                    <span>{lang === 'mr' ? 'अन्नद्रव्य भूक' : 'Nutrient Demand'}</span>
                    <strong>
                      {crop.soilLabMatch.cropProfile.isNFixer
                        ? (lang === 'mr' ? 'नत्र फिक्सर (कमी नत्र लागते)' : 'N-Fixer (Low N need)')
                        : `N: ${crop.soilLabMatch.cropProfile.nDemand}, P: ${crop.soilLabMatch.cropProfile.pDemand}, K: ${crop.soilLabMatch.cropProfile.kDemand}`}
                    </strong>
                  </div>
                </div>

                <p style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#004D40', lineHeight: 1.35, background: '#E0F2F1', padding: '0.5rem', borderRadius: '6px' }}>
                  💡 {lang === 'mr' ? crop.soilLabMatch.cropProfile.note_mr : crop.soilLabMatch.cropProfile.note_en}
                </p>
              </div>
            )}

            {/* Important Tips */}
            <div className="info-box-card" style={{ marginTop: '1rem' }}>
              <h4 className="info-box-title">{t('keyTips')}</h4>
              <ul className="tips-list">
                {(lang === 'mr' ? crop.agronomy.tips_mr : crop.agronomy.tips_en).map((tip, i) => (
                  <li key={i} className="tip-item">
                    <span className="tip-bullet">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 3: Mandi Market Rates */}
        {activeTab === 'market' && (
          <div className="tab-content-area">
            <div className="info-box-card">
              <h4 className="info-box-title">
                {cropName} - {t('tabMarket')}
              </h4>

              <div className="key-value-list">
                {mandi ? (
                  <>
                    <div className="kv-row">
                      <span>{t('liveMarketPrice', { district: districtName })}</span>
                      <strong className="kv-val-green">
                        ₹ {mandi.avgModal.toLocaleString()} / {t('quintals')}
                      </strong>
                    </div>

                    <div className="kv-row">
                      <span>{t('priceRange')}</span>
                      <strong>
                        ₹ {mandi.minModal.toLocaleString()} - {mandi.maxModal.toLocaleString()}
                      </strong>
                    </div>

                    <div className="kv-row">
                      <span>{t('lastUpdated')}</span>
                      <strong>{mandi.latestDate}</strong>
                    </div>
                  </>
                ) : (
                  <div className="kv-row">
                    <span>{t('estMarketPrice', { district: districtName })}</span>
                    <strong className="kv-val-green">
                      ₹ {crop.mandiPriceAvg.toLocaleString()} / {t('quintals')}
                    </strong>
                  </div>
                )}

                {crop.mspPrice && (
                  <div className="kv-row">
                    <span>{t('mspGovt')}</span>
                    <strong>₹ {crop.mspPrice.toLocaleString()} / {t('quintals')}</strong>
                  </div>
                )}

                <div className="kv-row">
                  <span>{t('peakArrivals')}</span>
                  <strong>
                    {lang === 'mr' ? crop.peakArrival_mr : crop.peakArrival_en}
                  </strong>
                </div>
              </div>

              {mandi && mandi.markets.length > 0 && (
                <div className="mandi-market-list" style={{ marginTop: '0.75rem' }}>
                  <strong className="mandi-list-title">{t('topMandis')}</strong>
                  {mandi.markets.map((m) => (
                    <div key={m.market} className="mandi-market-row">
                      <span>{m.market}</span>
                      <strong>₹ {m.modal.toLocaleString()} / {t('quintals')}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="guidance-banner" style={{ marginTop: '1rem' }}>
              <AlertCircle size={22} color="#1565C0" />
              <p className="guidance-text">
                {t('marketNote')}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Floating Action Buttons */}
        <div className="crop-detail-action-buttons">
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
            onClick={() => setActiveTab(activeTab === 'technical' ? 'general' : 'technical')}
          >
            <FileText size={18} color="#FFF" />
            <span>{activeTab === 'technical' ? t('tabGeneral') : t('detailedInfo')}</span>
          </button>
        </div>
      </main>

      </div>
  );
}
