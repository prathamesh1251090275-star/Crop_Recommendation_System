import { Activity, ShieldCheck } from 'lucide-react';
import '../styles/soilScreen.css';

// Fixed reading order: pH and salinity first, then the nutrients.
const PARAM_ORDER = ['ph', 'ec', 'organicCarbon', 'nitrogen', 'phosphorus', 'potassium'];

// Labels are written out properly instead of being upper-cased from the key,
// which is what produced run-together text like "ORGANICCARBON".
const PARAM_NAME = {
  ph: { en: 'Soil pH', mr: 'सामू (pH)' },
  ec: { en: 'Electrical Conductivity', mr: 'विद्युत वाहकता (EC)' },
  organicCarbon: { en: 'Organic Carbon', mr: 'सेंद्रिय कर्ब' },
  nitrogen: { en: 'Available Nitrogen', mr: 'उपलब्ध नत्र' },
  phosphorus: { en: 'Available Phosphorus', mr: 'उपलब्ध स्फुरद' },
  potassium: { en: 'Available Potassium', mr: 'उपलब्ध पालाश' }
};

const PARAM_UNIT = {
  ph: '',
  ec: 'dS/m',
  organicCarbon: '%',
  nitrogen: 'kg/ha',
  phosphorus: 'kg/ha',
  potassium: 'kg/ha'
};

/**
 * Soil Health Card gap analysis, shared by the Soil Lab screen and the
 * recommendations list so both read the same way.
 */
export default function SoilHealthGapCard({ gap, lang, t, className = '' }) {
  if (!gap) return null;

  const isMr = lang === 'mr';
  const issues = PARAM_ORDER.filter((key) => gap.params?.[key] && gap.params[key].status !== 'good');
  const score = Math.max(0, Math.min(100, Number(gap.healthScore) || 0));

  return (
    <section className={`shc-card shc-gap ${className}`.trim()}>
      <header className="shc-gap-head">
        <div className="shc-gap-headline">
          <h3 className="shc-title">
            <Activity size={18} color="#00695C" />
            {t('soilHealthGapTitle')}
          </h3>
          <p className="shc-gap-sub">{isMr ? gap.healthStatus_mr : gap.healthStatus_en}</p>
        </div>
        <div className="shc-gap-score">
          <span className="shc-gap-value">{score}</span>
          <span className="shc-gap-unit">/100</span>
        </div>
      </header>

      <div className="shc-bar">
        <span
          className="shc-bar-fill"
          style={{ width: `${score}%`, background: gap.badgeColor || '#2E7D32' }}
        />
      </div>
      <p className="shc-gap-basis">{t('soilHealthGapSub')}</p>

      <ul className="shc-param-list">
        {PARAM_ORDER.map((key) => {
          const item = gap.params?.[key];
          if (!item) return null;
          const name = PARAM_NAME[key];
          const unit = PARAM_UNIT[key];
          return (
            <li className="shc-row" key={key}>
              <div className="shc-row-top">
                <span className="shc-row-name">{name ? (isMr ? name.mr : name.en) : key}</span>
                <span className="shc-row-value">
                  {item.value}
                  {unit ? <span className="shc-row-unit"> {unit}</span> : null}
                </span>
              </div>
              <span className={`shc-tag shc-tag--${item.status}`}>
                {isMr ? item.label_mr : item.label_en}
              </span>
              <p className="shc-row-note">{isMr ? item.gap_mr : item.gap_en}</p>
            </li>
          );
        })}
      </ul>

      {(issues.length > 0 || score >= 80) && (
        <div className="shc-advisory">
          <h4 className="shc-advisory-title">
            <ShieldCheck size={16} />
            {isMr ? 'सुधारणा सल्ला' : 'Corrective advisory'}
          </h4>
          <ul>
            {issues.map((key) => {
              const item = gap.params[key];
              return <li key={key}>{isMr ? item.advisory_mr : item.advisory_en}</li>;
            })}
            {score >= 80 && (
              <li>
                {isMr
                  ? 'मातीचे घटक सुस्थितीत आहेत; नियमित सेंद्रिय व्यवस्थापन सुरू ठेवा.'
                  : 'Soil fertility is balanced; maintain organic matter with compost or green manure.'}
              </li>
            )}
          </ul>
        </div>
      )}
    </section>
  );
}
