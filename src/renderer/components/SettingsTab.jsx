import React from 'react';
import { Settings, Moon, Sun, Save, FolderOpen, Globe } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext.jsx';

export default function SettingsTab({ 
  snapToGrid, 
  setSnapToGrid, 
  isDarkTheme, 
  setIsDarkTheme, 
  onSave 
}) {
  const { t, languageMode, setLanguageMode } = useTranslation();

  return (
    <div style={{ padding: '30px', color: 'var(--text-title)', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Settings size={24} /> {t('settings.title')}
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* --- НАСТРОЙКА 0: ЯЗЫК --- */}
        <div style={{ 
          backgroundColor: 'var(--bg-module)', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div>
            <h4 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} /> {t('language.label')}
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              {t('language.description')}
            </p>
          </div>
          <select
            value={languageMode}
            onChange={(e) => setLanguageMode(e.target.value)}
            className="curtain-select filter-select"
            style={{ minWidth: '170px' }}
            aria-label={t('language.label')}
          >
            <option value="ru">{t('language.ru')}</option>
            <option value="en">{t('language.en')}</option>
            <option value="auto">{t('language.auto')}</option>
          </select>
        </div>

        {/* --- НАСТРОЙКА 1: ТЕМА --- */}
        <div style={{ 
          backgroundColor: 'var(--bg-module)', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h4 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isDarkTheme ? <Moon size={18} /> : <Sun size={18} />} {t('settings.appearance')}
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              {t('settings.appearanceDesc')}
            </p>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={isDarkTheme} 
              onChange={(e) => setIsDarkTheme(e.target.checked)} 
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* --- НАСТРОЙКА 2: СЕТКА --- */}
        <div style={{ 
          backgroundColor: 'var(--bg-module)', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h4 style={{ margin: '0 0 5px 0' }}>{t('settings.snapGrid')}</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              {t('settings.snapGridDesc')}
            </p>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={snapToGrid} 
              onChange={(e) => setSnapToGrid(e.target.checked)} 
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* --- НАСТРОЙКА 3: УПРАВЛЕНИЕ ФАЙЛАМИ --- */}
        <div style={{ 
          backgroundColor: 'var(--bg-module)', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h4 style={{ margin: '0 0 5px 0' }}>{t('settings.data')}</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              {t('settings.dataDesc')}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => document.getElementById('config-upload').click()} 
              className="sort-btn" 
              style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
            >
              <FolderOpen size={16} /> {t('common.load')}
            </button>
            
            <button 
              onClick={onSave} 
              className="sort-btn" 
              style={{ 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '8px 16px',
                backgroundColor: 'var(--accent-primary)', /* Выделяем главную кнопку */
                color: '#fff'
              }}
            >
              <Save size={16} /> {t('common.save')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}