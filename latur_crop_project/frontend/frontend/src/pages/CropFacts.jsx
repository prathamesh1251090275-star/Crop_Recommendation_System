import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import { ChevronLeft, Search, X, ArrowRight } from 'lucide-react';

export default function CropFacts() {
  const navigate = useNavigate();
  const { lang, t, crops } = useFarm();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', labelKey: 'catAll' },
    { id: 'cereals', labelKey: 'catCereals' },
    { id: 'pulses', labelKey: 'catPulses' },
    { id: 'oilseeds', labelKey: 'catOilseeds' },
    { id: 'vegetables', labelKey: 'catVegetables' },
    { id: 'fruits', labelKey: 'catFruits' },
    { id: 'cashcrops', labelKey: 'catCashCrops' }
  ];

  const filteredCrops = crops.filter((crop) => {
    const matchesCategory = activeCategory === 'all' || crop.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      crop.name_mr.includes(query) ||
      crop.name_en.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const featuredCrop = crops[0]; // Soybean

  return (
    <div className="mobile-screen catalog-screen">
      {/* Top Navbar */}
      <div className="screen-header-bar">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="screen-header-title">{t('cropInfoTitle')}</h2>
      </div>

      <main className="screen-content pad-body">
        {/* Search Bar */}
        <div className="search-input-box">
          <Search size={18} color="#666" />
          <input
            type="text"
            placeholder={t('searchCropCatalog')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-field"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="category-chips-row">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`cat-chip-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {t(cat.labelKey)}
            </button>
          ))}
        </div>

        {/* Crops Grid */}
        <div className="crops-catalog-grid">
          {filteredCrops.map((crop) => {
            const cropName = lang === 'mr' ? crop.name_mr : crop.name_en;
            return (
              <div
                key={crop.id}
                className="catalog-crop-item"
                onClick={() => navigate(`/crop/${crop.id}`)}
              >
                <div className="catalog-crop-thumb">
                  <img
                    src={crop.image}
                    alt={cropName}
                    className="catalog-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="crop-icon-fallback" style={{ display: 'none' }}>
                    {crop.icon}
                  </div>
                </div>
                <span className="catalog-crop-title">{cropName}</span>
              </div>
            );
          })}
        </div>

        {/* Popular / Featured Crops Card */}
        <div className="featured-crop-section">
          <h4 className="section-small-heading">{t('popularCrops')}</h4>

          <div
            className="featured-crop-card"
            onClick={() => navigate(`/crop/${featuredCrop.id}`)}
          >
            <div className="featured-crop-thumb">
              <img
                src={featuredCrop.image}
                alt={featuredCrop.name_mr}
                className="featured-img"
              />
            </div>
            <div className="featured-crop-info">
              <h4 className="featured-title">
                {lang === 'mr' ? featuredCrop.name_mr : featuredCrop.name_en}
              </h4>
              <span className="featured-score">
                {t('suitabilityScore')} {featuredCrop.score}%
              </span>
            </div>
            <button type="button" className="btn-view-pill">
              <span>{t('viewCropInfo')}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </main>

      </div>
  );
}
