import React from 'react';
import { Settings, Moon, Sun, Save, FolderOpen } from 'lucide-react';

export default function SettingsTab({ 
  snapToGrid, 
  setSnapToGrid, 
  isDarkTheme, 
  setIsDarkTheme, 
  onSave 
}) {
  return (
    <div style={{ padding: '30px', color: 'var(--text-title)', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Settings size={24} /> Настройки дашборда
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
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
              {isDarkTheme ? <Moon size={18} /> : <Sun size={18} />} Внешний вид
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              Переключение между светлой и темной темой
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
            <h4 style={{ margin: '0 0 5px 0' }}>Привязка к сетке</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              Модули будут перемещаться по невидимой сетке (шаг 50px)
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
            <h4 style={{ margin: '0 0 5px 0' }}>Данные дашборда</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              Сохранение и загрузка состояния модулей
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => document.getElementById('config-upload').click()} 
              className="sort-btn" 
              style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
            >
              <FolderOpen size={16} /> Загрузить
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
              <Save size={16} /> Сохранить
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}