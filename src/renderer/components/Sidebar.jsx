import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, 
  Swords, 
  Store, 
  Calculator, 
  BookOpen, 
  Settings, 
  X,
  Sparkles,
  Shield,
  Moon,
  Sun
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext.jsx';
import logoSvg from '../assets/logo.svg';

export default function Sidebar({ isOpen, onClose, isDarkTheme, onToggleTheme }) {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <>
      {/* Затемнение фона при открытом меню */}
      <div 
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />

      {/* Выдвижная панель меню слева */}
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src={logoSvg} alt="logo" style={{ width: '22px', height: '22px' }} />
            <div>
              <h3 className="sidebar-title">{t('app.brand')}</h3>
              <span className="sidebar-subtitle">{t('app.subtitle')}</span>
            </div>
          </div>
          <button 
            type="button" 
            className="sidebar-close-btn" 
            onClick={onClose} 
            title={t('sidebar.closeMenu')}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">{t('sidebar.main')}</div>

          <NavLink 
            to="/" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <LayoutDashboard size={19} className="sidebar-icon" />
            <span>{t('sidebar.table')}</span>
          </NavLink>

          <NavLink 
            to="/trials" 
            className={`sidebar-link ${location.pathname.startsWith('/trials') ? 'active' : ''}`}
            onClick={onClose}
          >
            <Swords size={19} className="sidebar-icon" />
            <span>{t('sidebar.trials')}</span>
          </NavLink>

          <NavLink 
            to="/generators" 
            className={`sidebar-link ${location.pathname.startsWith('/generators') ? 'active' : ''}`}
            onClick={onClose}
          >
            <Sparkles size={19} className="sidebar-icon" />
            <span>{t('sidebar.generators')}</span>
          </NavLink>

          <div className="sidebar-section-label">{t('sidebar.reference')}</div>

          <NavLink 
            to="/prices" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Store size={19} className="sidebar-icon" />
            <span>{t('sidebar.prices')}</span>
          </NavLink>

          <NavLink 
            to="/calculator" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Calculator size={19} className="sidebar-icon" />
            <span>{t('sidebar.calculator')}</span>
          </NavLink>

          <NavLink 
            to="/rules" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <BookOpen size={19} className="sidebar-icon" />
            <span>{t('sidebar.rules')}</span>
          </NavLink>

          <div className="sidebar-section-label">{t('sidebar.system')}</div>

          <NavLink 
            to="/settings" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Settings size={19} className="sidebar-icon" />
            <span>{t('sidebar.settings')}</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-row">
            <span className="status-dot"></span>
            <span className="session-status">{t('sidebar.sessionActive')}</span>
          </div>

          {onToggleTheme && (
            <button 
              type="button" 
              className="sidebar-theme-toggle" 
              onClick={onToggleTheme}
              title={t('sidebar.toggleTheme')}
            >
              {isDarkTheme ? <Sun size={17} /> : <Moon size={17} />}
              <span>{isDarkTheme ? t('sidebar.lightTheme') : t('sidebar.darkTheme')}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
