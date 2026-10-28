import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { DISTRICTS, TEHSILS_BY_DISTRICT } from '../data/locations';
import { X, MapPin, Check, Search } from 'lucide-react';

export default function LocationModal() {
  const {
    lang,
    t,
    district,
    setDistrict,
    tehsil,
    setTehsil,
    isLocationModalOpen,
    setLocationModalOpen
  } = useFarm();

  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchTehsil, setSearchTehsil] = useState('');

  if (!isLocationModalOpen) return null;

  // Filter districts based on search
  const filteredDistricts = DISTRICTS.filter(d => {
    const q = searchDistrict.toLowerCase().trim();
    if (!q) return true;
    return d.name_mr.toLowerCase().includes(q) || d.name_en.toLowerCase().includes(q);
  });

  // Current tehsils for selected district
  const currentTehsils = TEHSILS_BY_DISTRICT[district] || [];

  // Filter tehsils based on search
  const filteredTehsils = currentTehsils.filter(tItem => {
    const q = searchTehsil.toLowerCase().trim();
    if (!q) return true;
    return tItem.name_mr.toLowerCase().includes(q) || tItem.name_en.toLowerCase().includes(q);
  });

  const handleDistrictClick = (distId) => {
    setDistrict(distId);
    setSearchTehsil('');
  };

  return (
    <div className="modal-backdrop" onClick={() => setLocationModalOpen(false)}>
      <div className="modal-card location-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <MapPin size={22} color="#1B5E20" />
            <h3>{t('selectLocation')}</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setLocationModalOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body location-modal-body">
          {/* STEP 1: SELECT DISTRICT */}
          <div className="selector-group">
            <div className="section-title-with-search">
              <label className="field-label" style={{ margin: 0 }}>
                1. {t('district')} ({DISTRICTS.length})
              </label>
              <div className="small-search-box">
                <Search size={14} color="#757575" />
                <input
                  type="text"
                  placeholder={lang === 'mr' ? 'जिल्हा शोधा...' : 'Search district...'}
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  className="small-search-input"
                />
              </div>
            </div>

            <div className="chips-grid scrollable-chips-grid">
              {filteredDistricts.map((d) => {
                const isSelected = district === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    className={`chip-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleDistrictClick(d.id)}
                  >
                    <span>{lang === 'mr' ? d.name_mr : d.name_en}</span>
                    {isSelected && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: SELECT TEHSIL */}
          <div className="selector-group" style={{ marginTop: '1.25rem' }}>
            <div className="section-title-with-search">
              <label className="field-label" style={{ margin: 0 }}>
                2. {t('tehsil')} ({currentTehsils.length} {lang === 'mr' ? 'तालुके' : 'Tehsils'})
              </label>
              {currentTehsils.length > 6 && (
                <div className="small-search-box">
                  <Search size={14} color="#757575" />
                  <input
                    type="text"
                    placeholder={lang === 'mr' ? 'तालुका शोधा...' : 'Search tehsil...'}
                    value={searchTehsil}
                    onChange={(e) => setSearchTehsil(e.target.value)}
                    className="small-search-input"
                  />
                </div>
              )}
            </div>

            <div className="chips-grid scrollable-chips-grid">
              {filteredTehsils.map((tItem) => {
                const isSelected = tehsil === tItem.id;
                return (
                  <button
                    key={tItem.id}
                    type="button"
                    className={`chip-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setTehsil(tItem.id)}
                  >
                    <span>{lang === 'mr' ? tItem.name_mr : tItem.name_en}</span>
                    {isSelected && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn-primary full-width"
            onClick={() => setLocationModalOpen(false)}
          >
            {t('apply')}
          </button>
        </div>
      </div>
    </div>
  );
}