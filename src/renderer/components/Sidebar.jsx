import React from 'react';
import { NavLink } from 'react-router-dom';
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

export default function Sidebar({ isOpen, onClose, isDarkTheme, onToggleTheme }) {
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
            <span className="sidebar-crest">⚜️</span>
            <div>
              <h3 className="sidebar-title">DnD Suite</h3>
              <span className="sidebar-subtitle">Инструменты Мастера</span>
            </div>
          </div>
          <button 
            type="button" 
            className="sidebar-close-btn" 
            onClick={onClose} 
            title="Закрыть меню"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">ОСНОВНОЕ</div>

          <NavLink 
            to="/" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <LayoutDashboard size={19} className="sidebar-icon" />
            <span>Стол Мастера</span>
          </NavLink>

          <NavLink 
            to="/trials" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Swords size={19} className="sidebar-icon" />
            <span>Мастерская Испытаний</span>
            <span className="sidebar-badge">5 игр</span>
          </NavLink>

          <div className="sidebar-section-label">СПРАВОЧНИКИ</div>

          <NavLink 
            to="/prices" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Store size={19} className="sidebar-icon" />
            <span>Лавка и Цены</span>
          </NavLink>

          <NavLink 
            to="/calculator" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Calculator size={19} className="sidebar-icon" />
            <span>Калькулятор лута</span>
          </NavLink>

          <NavLink 
            to="/rules" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <BookOpen size={19} className="sidebar-icon" />
            <span>Справочник D&D 5e</span>
          </NavLink>

          <div className="sidebar-section-label">СИСТЕМА</div>

          <NavLink 
            to="/settings" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Settings size={19} className="sidebar-icon" />
            <span>Настройки</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-row">
            <span className="status-dot"></span>
            <span className="session-status">Сессия активна</span>
          </div>

          {onToggleTheme && (
            <button 
              type="button" 
              className="sidebar-theme-toggle" 
              onClick={onToggleTheme}
              title="Переключить тему оформления"
            >
              {isDarkTheme ? <Sun size={17} /> : <Moon size={17} />}
              <span>{isDarkTheme ? 'Светлая тема' : 'Темная тема'}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
