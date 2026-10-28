import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import {
  ChevronLeft,
  Download,
  CheckCircle,
  Sprout,
  CloudRain,
  Thermometer,
  Droplets,
  Store,
  ArrowLeft
} from 'lucide-react';

export default function Compare() {
  const navigate = useNavigate();
  const { lang, t, crops } = useFarm();
  const [downloadMsg, setDownloadMsg] = useState(false);

  // Top 4 crops for comparison matrix
  const compareCrops = crops.slice(0, 4);

  const handleDownload = () => {
    setDownloadMsg(true);
    setTimeout(() => setDownloadMsg(false), 3000);
    // In mobile, trigger window print or CSV download
    try {
      const rows = [
        ['Factor', ...compareCrops.map(c => lang === 'mr' ? c.name_mr : c.name_en)].join(','),
        ['Soil', ...compareCrops.map(c => c.factors.soil)].join(','),
        ['Rain', ...compareCrops.map(c => c.factors.rain)].join(','),
        ['Temp', ...compareCrops.map(c => c.factors.temp)].join(','),
        ['Irrigation', ...compareCrops.map(c => c.factors.irrigation)].join(','),
        ['Market', ...compareCrops.map(c => c.factors.market)].join(','),
        ['Total', ...compareCrops.map(c => c.score)].join(',')
      ];
      const csvContent = 'data:text/csv;charset=utf-8,' + rows.join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "peek_mitra_comparison.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // fallback
    }
  };

  return (
    <div className="mobile-screen compare-screen">
      {/* Top Navbar */}
      <div className="screen-header-bar">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="screen-header-text">
          <h2 className="screen-header-title">{t('cropComparisonTitle')}</h2>
          <p className="screen-header-sub">{t('cropComparisonSub')}</p>
        </div>
      </div>

      <main className="screen-content pad-body">
        {/* Comparison Matrix Table */}
        <div className="matrix-table-card">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="th-factor">{t('factorHeader')}</th>
                {compareCrops.map((c) => (
                  <th key={c.id} className="th-crop">
                    {lang === 'mr' ? c.name_mr : c.name_en}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Soil */}
              <tr>
                <td className="td-factor">
                  <div className="factor-cell">
                    <Sprout size={16} color="#2E7D32" />
                    <span>{t('factorSoil')}</span>
                  </div>
                </td>
                {compareCrops.map(c => (
                  <td key={c.id} className="td-val">{c.factors.soil}</td>
                ))}
              </tr>

              {/* Row 2: Rain */}
              <tr>
                <td className="td-factor">
                  <div className="factor-cell">
                    <CloudRain size={16} color="#1565C0" />
                    <span>{t('factorRain')}</span>
                  </div>
                </td>
                {compareCrops.map(c => (
                  <td key={c.id} className="td-val">{c.factors.rain}</td>
                ))}
              </tr>

              {/* Row 3: Temperature */}
              <tr>
                <td className="td-factor">
                  <div className="factor-cell">
                    <Thermometer size={16} color="#D84315" />
                    <span>{t('factorTemp')}</span>
                  </div>
                </td>
                {compareCrops.map(c => (
                  <td key={c.id} className="td-val">{c.factors.temp}</td>
                ))}
              </tr>

              {/* Row 4: Irrigation */}
              <tr>
                <td className="td-factor">
                  <div className="factor-cell">
                    <Droplets size={16} color="#0288D1" />
                    <span>{t('factorIrrigation')}</span>
                  </div>
                </td>
                {compareCrops.map(c => (
                  <td key={c.id} className="td-val">{c.factors.irrigation}</td>
                ))}
              </tr>

              {/* Row 5: Market */}
              <tr>
                <td className="td-factor">
                  <div className="factor-cell">
                    <Store size={16} color="#7B1FA2" />
                    <span>{t('factorMarket')}</span>
                  </div>
                </td>
                {compareCrops.map(c => (
                  <td key={c.id} className="td-val">{c.factors.market}</td>
                ))}
              </tr>

              {/* Row 6: Total Score */}
              <tr className="tr-highlight-score">
                <td className="td-factor font-bold">{t('totalScore')}</td>
                {compareCrops.map(c => (
                  <td key={c.id} className="td-val font-bold text-green">{c.score}</td>
                ))}
              </tr>

              {/* Row 7: Rank Medals */}
              <tr className="tr-rank-medals">
                <td className="td-factor font-bold">{t('rank')}</td>
                {compareCrops.map((c, idx) => {
                  const medals = ['🥇 1', '🥈 2', '🥉 3', '4'];
                  return (
                    <td key={c.id} className="td-val font-bold">{medals[idx]}</td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Note Banner */}
        <div className="guidance-banner" style={{ marginTop: '1.2rem' }}>
          <CheckCircle size={20} color="#2E7D32" />
          <p className="guidance-text">{t('comparisonNote')}</p>
        </div>

        {downloadMsg && (
          <div className="success-toast">
            {t('downloadSuccess')}
          </div>
        )}

        {/* Actions */}
        <div className="compare-actions-stack">
          <button
            type="button"
            className="btn-outline-action"
            onClick={handleDownload}
          >
            <Download size={18} color="#1B5E20" />
            <span>{t('downloadComparison')}</span>
          </button>

          <button
            type="button"
            className="btn-primary-action"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} color="#FFF" />
            <span>{t('goBack')}</span>
          </button>
        </div>
      </main>

      </div>
  );
}
