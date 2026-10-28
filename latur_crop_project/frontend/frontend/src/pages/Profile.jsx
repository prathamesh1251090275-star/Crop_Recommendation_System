import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import {
  ChevronRight,
  User,
  History as HistoryIcon,
  Bell,
  Settings as SettingsIcon,
  HelpCircle,
  Info,
  LogOut,
  PhoneCall,
  CloudSun
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const {
    lang,
    t,
    districtName,
    tehsilName,
    landArea,
    landUnit,
    soilType,
    setLocationModalOpen
  } = useFarm();

  const [activeModal, setActiveModal] = useState(null);

  const getSoilName = () => {
    if (soilType === 'black') return t('soilBlack');
    if (soilType === 'red') return t('soilRed');
    if (soilType === 'rocky') return t('soilRocky');
    return t('soilMixed');
  };

  const handleReset = () => {
    if (window.confirm(lang === 'mr' ? 'सर्व डेटा रीसेट करायचा आहे का?' : 'Reset all settings and history?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="mobile-screen profile-screen">
      <main className="screen-content pad-body">
        {/* Farmer Welcome Header Banner */}
        <div className="farmer-profile-banner">
          <div className="farmer-avatar-circle">
            <span className="farmer-emoji" role="img" aria-label="Farmer">
              👨‍🌾
            </span>
          </div>
          <div className="farmer-greeting-text">
            <h3 className="farmer-greeting-title">{t('greetingFarmer')}</h3>
            <p className="farmer-greeting-tagline">{t('farmerReadyTagline')}</p>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="profile-menu-card">
          {/* Item 1: My Farm Info */}
          <div
            className="profile-menu-row"
            onClick={() => setActiveModal('farmInfo')}
          >
            <div className="menu-icon-box bg-green-light">
              <User size={20} color="#1B5E20" />
            </div>
            <div className="menu-text-group">
              <h4 className="menu-item-title">{t('myFarmInfo')}</h4>
              <p className="menu-item-sub">
                {districtName}, {tehsilName} • {landArea} {t('unitAcre')} • {getSoilName()}
              </p>
            </div>
            <ChevronRight size={18} className="menu-arrow" />
          </div>

          {/* Item 2: Search History */}
          <div
            className="profile-menu-row"
            onClick={() => navigate('/history')}
          >
            <div className="menu-icon-box bg-blue-light">
              <HistoryIcon size={20} color="#1565C0" />
            </div>
            <div className="menu-text-group">
              <h4 className="menu-item-title">{t('myHistory')}</h4>
              <p className="menu-item-sub">{t('myHistorySub')}</p>
            </div>
            <ChevronRight size={18} className="menu-arrow" />
          </div>

          {/* Item 3: Weather & Advisories */}
          <div
            className="profile-menu-row"
            onClick={() => setActiveModal('weather')}
          >
            <div className="menu-icon-box bg-amber-light">
              <Bell size={20} color="#E65100" />
            </div>
            <div className="menu-text-group">
              <h4 className="menu-item-title">{t('notifications')}</h4>
              <p className="menu-item-sub">{t('notificationsSub')}</p>
            </div>
            <ChevronRight size={18} className="menu-arrow" />
          </div>

          {/* Item 4: Settings & Location */}
          <div
            className="profile-menu-row"
            onClick={() => setLocationModalOpen(true)}
          >
            <div className="menu-icon-box bg-gray-light">
              <SettingsIcon size={20} color="#455A64" />
            </div>
            <div className="menu-text-group">
              <h4 className="menu-item-title">{t('settings')}</h4>
              <p className="menu-item-sub">{t('settingsSub')}</p>
            </div>
            <ChevronRight size={18} className="menu-arrow" />
          </div>

          {/* Item 5: Help & FAQ */}
          <div
            className="profile-menu-row"
            onClick={() => setActiveModal('help')}
          >
            <div className="menu-icon-box bg-purple-light">
              <HelpCircle size={20} color="#6A1B9A" />
            </div>
            <div className="menu-text-group">
              <h4 className="menu-item-title">{t('helpDesk')}</h4>
              <p className="menu-item-sub">{t('helpDeskSub')}</p>
            </div>
            <ChevronRight size={18} className="menu-arrow" />
          </div>

          {/* Item 6: About App */}
          <div
            className="profile-menu-row"
            onClick={() => setActiveModal('about')}
          >
            <div className="menu-icon-box bg-teal-light">
              <Info size={20} color="#00695C" />
            </div>
            <div className="menu-text-group">
              <h4 className="menu-item-title">{t('aboutApp')}</h4>
              <p className="menu-item-sub">{t('aboutAppSub')}</p>
            </div>
            <ChevronRight size={18} className="menu-arrow" />
          </div>
        </div>

        {/* Kisan Call Center Box */}
        <div className="kisan-helpline-card">
          <PhoneCall size={20} color="#1B5E20" />
          <span className="helpline-text">{t('kisanCallCenter')}</span>
        </div>

        {/* Log out / Reset button */}
        <div className="logout-btn-container">
          <button
            type="button"
            className="btn-outline-danger"
            onClick={handleReset}
          >
            <LogOut size={18} />
            <span>{t('logOut')}</span>
          </button>
        </div>
      </main>

      {/* Weather Dialog */}
      {activeModal === 'weather' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <CloudSun size={24} color="#1565C0" />
                <h3>{t('weatherTitle')}</h3>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                {t('tempToday')}
              </p>
              <p style={{ marginTop: '0.8rem', color: '#555' }}>
                {t('rainfallStatus')}
              </p>
              <div className="guidance-banner" style={{ marginTop: '1rem' }}>
                <p className="guidance-text">
                  {lang === 'mr'
                    ? 'पुढील आठवड्यात कोरड्या हवामानाचा अंदाज. पिकांमध्ये कीड नियंत्रण व खते देण्यास योग्य वेळ.'
                    : 'Dry weather expected for the upcoming week. Good window for weed control and fertilizer application.'}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-primary full-width"
                onClick={() => setActiveModal(null)}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help FAQ Dialog */}
      {activeModal === 'help' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('helpDesk')}</h3>
            </div>
            <div className="modal-body faq-content">
              <h4>{lang === 'mr' ? '1. योग्यता गुणांक कसा मोजला जातो?' : '1. How is suitability calculated?'}</h4>
              <p>
                {lang === 'mr'
                  ? 'तुमच्या भागातील मातीचा प्रकार, वार्षिक पाऊस, तापमान, सिंचन उपलब्धता आणि APMC बाजारभाव यांचा अभ्यास करून योग्यता ठरवली जाते.'
                  : 'Scores are computed using regional soil type, rainfall distribution, temperatures, irrigation sources, and mandi pricing.'}
              </p>

              <h4 style={{ marginTop: '1rem' }}>{lang === 'mr' ? '2. माहिती ऐकण्यासाठी काय करावे?' : '2. How to listen to audio?'}</h4>
              <p>
                {lang === 'mr'
                  ? '"माहिती ऐका" या बटणावर क्लिक करा. आपला फोन मराठीतून संपूर्ण माहिती वाचून दाखवेल.'
                  : 'Click the "Listen Audio" button to hear spoken advice in your language.'}
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-primary full-width"
                onClick={() => setActiveModal(null)}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Dialog */}
      {activeModal === 'about' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('aboutApp')}</h3>
            </div>
            <div className="modal-body">
              <p style={{ lineHeight: '1.6' }}>
                {lang === 'mr'
                  ? 'पीक मित्र हा महाराष्ट्र व लातूर भागातील शेतकरी बांधवांसाठी तयार केलेला निर्णय साहाय्यक मंच आहे. यातील माहिती महाराष्ट्र कृषी विभाग, हवामान खाते आणि APMC लातूर बाजार समितीच्या आकडेवारीवर आधारित आहे.'
                  : 'Peek Mitra is an agro-advisory tool dedicated to farmers across Maharashtra and Latur district, utilizing Maharashtra Agriculture Department, IMD weather, and APMC Mandi data.'}
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-primary full-width"
                onClick={() => setActiveModal(null)}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
  );
}
