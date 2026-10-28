import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import { Home, BarChart2, History, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useFarm();

  const navItems = [
    { path: '/', labelKey: 'navHome', icon: Home },
    { path: '/compare', labelKey: 'navCompare', icon: BarChart2 },
    { path: '/history', labelKey: 'navHistory', icon: History },
    { path: '/profile', labelKey: 'navProfile', icon: User }
  ];

  // Helper to determine active tab reliably across all sub-pages
  const isActive = (itemPath) => {
    const current = location.pathname;
    if (itemPath === '/') {
      return (
        current === '/' ||
        current === '/home' ||
        current === '/find-crop' ||
        current === '/recommendations' ||
        current === '/check-crop' ||
        current === '/crop-facts' ||
        current.startsWith('/crop/')
      );
    }
    return current.startsWith(itemPath);
  };

  return (
    <nav className="bottom-nav" aria-label="Bottom Navigation">
      <div className="bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              type="button"
              className={`nav-tab ${active ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <div className="tab-icon-wrapper">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className="tab-label">{t(item.labelKey)}</span>
              {active && <div className="active-dot-indicator" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}