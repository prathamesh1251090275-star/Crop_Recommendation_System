import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../context/useFarm';
import { analyzeSoilHealthGap, soilLabCompleteness, validateSoilLabInputs } from '../data/soilLabEngine';
import SoilHealthGapCard from '../components/SoilHealthGapCard';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  FlaskConical,
  RotateCcw,
  Save,
  Sparkles,
  Sprout
} from 'lucide-react';
import '../styles/soilScreen.css';

const EMPTY_FORM = {
  ph: '',
  ec: '',
  organicCarbon: '',
  nitrogen: '',
  phosphorus: '',
  potassium: ''
};

const LAB_FIELDS = [
  { key: 'ph', labelKey: 'phLabel', unit: '', placeholder: '7.2', step: '0.1', min: '3', max: '11' },
  { key: 'ec', labelKey: 'ecLabel', unit: 'dS/m', placeholder: '0.45', step: '0.05', min: '0', max: '25' },
  { key: 'organicCarbon', labelKey: 'ocLabel', unit: '%', placeholder: '0.55', step: '0.05', min: '0', max: '5' },
  { key: 'nitrogen', labelKey: 'nitrogenLabel', unit: 'kg/ha', placeholder: '240', step: '1', min: '0', max: '1200' },
  { key: 'phosphorus', labelKey: 'phosphorusLabel', unit: 'kg/ha', placeholder: '18', step: '1', min: '0', max: '300' },
  { key: 'potassium', labelKey: 'potassiumLabel', unit: 'kg/ha', placeholder: '320', step: '1', min: '0', max: '1200' }
];

const SOIL_OPTIONS = [
  { id: 'black', labelKey: 'soilBlack' },
  { id: 'red', labelKey: 'soilRed' },
  { id: 'rocky', labelKey: 'soilRocky' },
  { id: 'mixed', labelKey: 'soilMixed' }
];

const toForm = (data) => ({
  ph: data?.ph ?? '',
  ec: data?.ec ?? '',
  organicCarbon: data?.organicCarbon ?? '',
  nitrogen: data?.nitrogen ?? '',
  phosphorus: data?.phosphorus ?? '',
  potassium: data?.potassium ?? ''
});

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
    saveSoilLabProfile,
    clearSoilLabData
  } = useFarm();

  // The form stays collapsed until the farmer says they have a card, or until a
  // saved report is already on file.
  const [form, setForm] = useState(() => toForm(soilLabData));
  const [formOpen, setFormOpen] = useState(() => soilLabCompleteness(soilLabData).count > 0);
  const [notice, setNotice] = useState('');

  const validation = validateSoilLabInputs(form);
  const completeness = soilLabCompleteness(form);
  const errors = validation.errors || {};
  const hasErrors = Object.keys(errors).length > 0;
  const ready = completeness.complete && !hasErrors;
  const gap = analyzeSoilHealthGap(form);

  const flash = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 4000);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLoadSample = () => {
    setForm({
      ph: 7.6,
      ec: 0.55,
      organicCarbon: 0.52,
      nitrogen: 220,
      phosphorus: 16,
      potassium: 340
    });
    setFormOpen(true);
    flash(t('sampleProfileLoaded'));
  };

  const handleSave = () => {
    if (!ready) return;
    saveSoilLabProfile({
      ph: Number(form.ph),
      ec: Number(form.ec),
      organicCarbon: Number(form.organicCarbon),
      nitrogen: Number(form.nitrogen),
      phosphorus: Number(form.phosphorus),
      potassium: Number(form.potassium)
    });
    setRecommendationMode('soil_lab');
    flash(t('soilReportSaved'));
  };

  const handleClear = () => {
    setForm(EMPTY_FORM);
    clearSoilLabData();
    flash(lang === 'mr' ? 'माती अहवाल काढून टाकला गेला.' : 'Soil report removed.');
  };

  const handleContinue = () => {
    if (ready) handleSave();
    navigate('/recommendations');
  };

  return (
    <div className="mobile-screen soil-screen">
      <div className="screen-header-bar">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="screen-header-text">
          <h2 className="screen-header-title">{t('shcTitle')}</h2>
          <p className="screen-header-sub">{districtName} • {tehsilName}</p>
        </div>
      </div>

      <main className="screen-content pad-body">
        <div className="shc-stack">
          {notice && (
            <div className="shc-toast">
              <Sparkles size={16} />
              <span>{notice}</span>
            </div>
          )}

          {/* 1. Report status — what the app actually knows about your soil */}
          <section className="shc-card">
            <div className="shc-head">
              <h3 className="shc-title">
                <Activity size={18} color="#00695C" />
                {t('shcStatusTitle')}
              </h3>
              <span className={`shc-status ${ready ? 'shc-status--ok' : 'shc-status--absent'}`}>
                {ready ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                {ready ? t('shcSaved') : t('optionalBadge')}
              </span>
            </div>
            <p className="shc-note">{ready ? t('shcReady') : t('shcNoReportNote')}</p>

            {ready && recommendationMode === 'soil_lab' && (
              <div className="shc-actions">
                <button
                  type="button"
                  className="shc-btn shc-btn--ghost"
                  onClick={() => setRecommendationMode('standard')}
                >
                  <Sprout size={14} />
                  {t('shcUseStandard')}
                </button>
              </div>
            )}
          </section>

          {/* 2. Optional laboratory entry — hidden until the card exists */}
          <section className="shc-card">
            {!formOpen ? (
              <button type="button" className="shc-reveal" onClick={() => setFormOpen(true)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FlaskConical size={16} />
                  {t('shcEnterReport')}
                </span>
                <ChevronDown size={16} />
              </button>
            ) : (
              <>
                <div className="shc-head">
                  <h3 className="shc-title">
                    <FlaskConical size={18} color="#00695C" />
                    {t('soilLabTitle')}
                  </h3>
                  <span className="shc-status shc-status--absent">{t('optionalBadge')}</span>
                </div>
                <p className="shc-note">{t('shcFormIntro')}</p>

                <div className="shc-form">
                  <div className="shc-grid">
                    {LAB_FIELDS.map((field) => {
                      const error = errors[field.key];
                      return (
                        <div className="shc-field" key={field.key}>
                          <label htmlFor={`lab-${field.key}`}>
                            {t(field.labelKey)}
                            {field.unit ? <span className="shc-unit"> ({field.unit})</span> : null}
                          </label>
                          <input
                            id={`lab-${field.key}`}
                            className={`shc-input${error ? ' shc-input--bad' : ''}`}
                            type="number"
                            inputMode="decimal"
                            step={field.step}
                            min={field.min}
                            max={field.max}
                            placeholder={field.placeholder}
                            value={form[field.key]}
                            onChange={(event) => handleChange(field.key, event.target.value)}
                          />
                          {error && (
                            <p className="shc-err">
                              {lang === 'mr' ? 'मूल्य वैध श्रेणीबाहेर आहे.' : 'Value is outside the valid range.'}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className={`shc-meter ${ready ? 'shc-meter--ready' : 'shc-meter--pending'}`}>
                    {ready ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    <span>
                      {t('shcValuesEntered')}: {completeness.count}/{completeness.total}
                      {ready ? ` — ${t('shcReady')}` : ` — ${t('shcNotReadyHint')}`}
                    </span>
                  </div>

                  <div className="shc-actions">
                    <button type="button" className="shc-btn shc-btn--sample" onClick={handleLoadSample}>
                      <Sparkles size={14} />
                      {t('loadSampleLabData')}
                    </button>
                    <button
                      type="button"
                      className="shc-btn shc-btn--save"
                      onClick={handleSave}
                      disabled={!ready}
                      style={ready ? undefined : { opacity: 0.45, cursor: 'not-allowed' }}
                    >
                      <Save size={14} />
                      {t('saveSoilProfile')}
                    </button>
                    <button type="button" className="shc-btn shc-btn--ghost" onClick={handleClear}>
                      <RotateCcw size={14} />
                      {t('clearLabData')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* 3. Gap analysis — only rendered from a complete report */}
          {gap && <SoilHealthGapCard gap={gap} lang={lang} t={t} />}

          {/* 4. Soil type — part of the farm profile, not the lab report */}
          <section className="shc-card">
            <h3 className="shc-title" style={{ marginBottom: '0.6rem' }}>
              <Sprout size={18} color="#1B5E20" />
              {t('soilTypeLabel')}
            </h3>
            <div className="soil-options-grid">
              {SOIL_OPTIONS.map((option) => {
                const isSelected = soilType === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`soil-chip-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSoilType(option.id)}
                  >
                    <div className="soil-radio-dot">
                      {isSelected && <div className="soil-radio-inner" />}
                    </div>
                    <span className="soil-chip-label">{t(option.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <button type="button" className="btn-primary-large" onClick={handleContinue}>
            <span>{t('shcViewRecommendations')}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}
