import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom'; // Импортируем магию роутера
import './styles.css';

// Иконки
import { 
  LayoutDashboard, 
  Coins, 
  Settings, 
  BookOpen, 
  Plus, 
  Trash2, 
  Store, 
  Calculator,
  Menu,
  Swords
} from 'lucide-react';

// Компоненты
import DiceRoller from './components/DiceRoller.jsx';
import InitiativeTracker from './components/InitiativeTracker.jsx';
import NotepadModule from './components/NotepadModule.jsx';
import SettingsTab from './components/SettingsTab.jsx';
import TimerModule from './components/TimerModule.jsx';
import EffectTracker from './components/EffectTracker.jsx';
import BossTracker from './components/BossTracker.jsx';
import PricesTab from './components/PricesTab.jsx';
import CalculatorTab from './components/CalculatorTab.jsx';
import RulesTab from './components/RulesTab.jsx';
import Sidebar from './components/Sidebar.jsx';
import TrialsTab from './components/TrialsTab.jsx';

function App() {
  // 1. ПАМЯТЬ ПРИЛОЖЕНИЯ
  const [modules, setModules] = useState([]);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isModuleMenuOpen, setIsModuleMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // Для кастомного окна очистки стола

  // 2. ФУНКЦИИ-ОБРАБОТЧИКИ
  function handleAddModule(moduleName) {
    const newModule = { 
      id: Date.now(), 
      name: moduleName,
      data: {} 
    };

    if (moduleName === 'Инициатива') {
      newModule.data = { participants: [{ id: 1, name: '', init: '', hp: '', conditions: '' }], isPinned: false, isMinimized: false };
    }
    
    if (moduleName === 'Кубики') {
      newModule.data = { history: [], isPinned: false, isMinimized: false };
    }

    if (moduleName === 'Заметки') {
      newModule.data = { text: '', isPinned: false, isMinimized: false };
    }

    if (moduleName === 'Таймер') {
      newModule.data = { isPinned: false, isMinimized: false };
    }

    if (moduleName === 'Эффекты') {
      newModule.data = { effects: [{ id: 1, name: '', target: '', duration: 10 }], isPinned: false, isMinimized: false };
    }

    if (moduleName === 'Босс') {
      newModule.data = { bossData: { name: '', currentHp: 100, maxHp: 100, legResistances: 3, legActions: 3 }, isPinned: false, isMinimized: false };
    }

    setModules([...modules, newModule]);
    setIsModuleMenuOpen(false); 
  }

  function handleRemoveModule(idToRemove) {
    setModules(modules.filter((m) => m.id !== idToRemove));
  }

  function updateModuleData(moduleId, newData) {
    setModules((prevModules) => prevModules.map(m => {
      if (m.id === moduleId) {
        return { ...m, data: { ...m.data, ...newData } };
      }
      return m;
    }));
  }

  // === ОЧИСТКА СТОЛА (КАСТОМНОЕ ОКНО) ===
  function handleClearBoardClick() {
    setIsConfirmOpen(true);
  }

  function confirmClear() {
    setModules([]);
    setIsConfirmOpen(false);
  }

  // === СОХРАНЕНИЕ / ЗАГРУЗКА ===
  function handleSaveConfig() {
    const dataStr = JSON.stringify(modules, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dnd_scene.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleLoadConfig(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedModules = JSON.parse(e.target.result);
        setModules(loadedModules);
      } catch (error) {
        alert("Ошибка при чтении файла! Убедитесь, что это правильный JSON.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  // 3. РАЗМЕТКА
  return (
    <HashRouter>
      <div className='app-container' data-theme={isDarkTheme ? 'dark' : 'light'}>
        
        {/* Боковая шторка навигации */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          isDarkTheme={isDarkTheme}
          onToggleTheme={() => setIsDarkTheme(!isDarkTheme)}
        />

        {/* --- ВЕРХНЯЯ ПАНЕЛЬ НАВИГАЦИИ --- */}
        <header className='top-navbar'>
          <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              type="button" 
              className="sidebar-toggle-btn"
              onClick={() => setIsSidebarOpen(true)}
              title="Открыть меню разделов"
            >
              <Menu size={20} />
            </button>
            <h2 className="app-title">DnD Dashboard</h2>
          </div>

          <nav className="navbar-center" style={{ display: 'flex', gap: '15px' }}>
            <NavLink to="/" className="nav-tab" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LayoutDashboard size={18} /> Стол
            </NavLink>

            <NavLink to="/trials" className="nav-tab" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Swords size={18} /> Испытания
            </NavLink>

            <NavLink to="/prices" className="nav-tab" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Store size={18} /> Справочник цен
            </NavLink>

            <NavLink to="/calculator" className="nav-tab" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calculator size={18} /> Калькулятор лута
            </NavLink>

            <NavLink to="/rules" className="nav-tab" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={18} /> Справочник
            </NavLink>
            
            <NavLink to="/settings" className="nav-tab" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings size={18} /> Настройки
            </NavLink>
          </nav>

          <div className="navbar-right"></div>
          <input type="file" id="config-upload" accept=".json" style={{ display: 'none' }} onChange={handleLoadConfig} />
        </header>
        
        {/* --- ГЛАВНЫЙ ЭКРАН (МЕНЯЕТСЯ РОУТЕРОМ) --- */}
        <main className='main-board'>
          <Routes>
            
            {/* СТРАНИЦА 1: СТОЛ (Путь по умолчанию "/") */}
            <Route path="/" element={
              <>
                {modules.map((item) => {
                  if (item.name === 'Инициатива') return <InitiativeTracker key={item.id} onClose={() => handleRemoveModule(item.id)} participants={item.data.participants} isPinned={item.data.isPinned} isMinimized={item.data.isMinimized} setParticipants={(data) => updateModuleData(item.id, { participants: data })} setIsPinned={(data) => updateModuleData(item.id, { isPinned: data })} setIsMinimized={(data) => updateModuleData(item.id, { isMinimized: data })} snapToGrid={snapToGrid} layout={item.data.layout} setLayout={(data) => updateModuleData(item.id, { layout: data })} />;
                  if (item.name === 'Кубики') return <DiceRoller key={item.id} onClose={() => handleRemoveModule(item.id)} history={item.data.history || []} isPinned={item.data.isPinned} isMinimized={item.data.isMinimized} setHistory={(data) => updateModuleData(item.id, { history: data })} setIsPinned={(data) => updateModuleData(item.id, { isPinned: data })} setIsMinimized={(data) => updateModuleData(item.id, { isMinimized: data })} snapToGrid={snapToGrid} layout={item.data.layout} setLayout={(data) => updateModuleData(item.id, { layout: data })} />;
                  if (item.name === 'Заметки') return <NotepadModule key={item.id} onClose={() => handleRemoveModule(item.id)} text={item.data.text || ''} setText={(data) => updateModuleData(item.id, { text: data })} isPinned={item.data.isPinned} isMinimized={item.data.isMinimized} setIsPinned={(data) => updateModuleData(item.id, { isPinned: data })} setIsMinimized={(data) => updateModuleData(item.id, { isMinimized: data })} snapToGrid={snapToGrid} layout={item.data.layout} setLayout={(data) => updateModuleData(item.id, { layout: data })} />;
                  if (item.name === 'Таймер') return <TimerModule key={item.id} onClose={() => handleRemoveModule(item.id)} isPinned={item.data.isPinned} isMinimized={item.data.isMinimized} setIsPinned={(data) => updateModuleData(item.id, { isPinned: data })} setIsMinimized={(data) => updateModuleData(item.id, { isMinimized: data })} snapToGrid={snapToGrid} layout={item.data.layout} setLayout={(data) => updateModuleData(item.id, { layout: data })} />;
                  if (item.name === 'Эффекты') return <EffectTracker key={item.id} onClose={() => handleRemoveModule(item.id)} effects={item.data.effects || []} setEffects={(data) => updateModuleData(item.id, { effects: data })} isPinned={item.data.isPinned} isMinimized={item.data.isMinimized} setIsPinned={(data) => updateModuleData(item.id, { isPinned: data })} setIsMinimized={(data) => updateModuleData(item.id, { isMinimized: data })} snapToGrid={snapToGrid} layout={item.data.layout} setLayout={(data) => updateModuleData(item.id, { layout: data })} />;
                  if (item.name === 'Босс') return <BossTracker key={item.id} onClose={() => handleRemoveModule(item.id)} bossData={item.data.bossData} setBossData={(data) => updateModuleData(item.id, { bossData: data })} isPinned={item.data.isPinned} isMinimized={item.data.isMinimized} setIsPinned={(data) => updateModuleData(item.id, { isPinned: data })} setIsMinimized={(data) => updateModuleData(item.id, { isMinimized: data })} snapToGrid={snapToGrid} layout={item.data.layout} setLayout={(data) => updateModuleData(item.id, { layout: data })} />;
                  return null; 
                })}

                <div style={{ position: 'fixed', bottom: '30px', right: '30px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px', zIndex: 1000 }}>
                  {isModuleMenuOpen && (
                    <div className="fab-menu">
                      <button onClick={() => handleAddModule('Инициатива')}>Инициатива</button>
                      <button onClick={() => handleAddModule('Кубики')}>Кубики</button>
                      <button onClick={() => handleAddModule('Заметки')}>Заметки</button>
                      <button onClick={() => handleAddModule('Таймер')}>Таймер</button>
                      <button onClick={() => handleAddModule('Эффекты')}>Эффекты</button>
                      <button onClick={() => handleAddModule('Босс')}>Босс-трекер</button>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', marginRight: '5px' }}>
                    {modules.length > 0 && !isModuleMenuOpen && (
                      <button className="trash-btn" onClick={handleClearBoardClick} title="Очистить стол">
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button 
                      className={`fab-button ${isModuleMenuOpen ? 'open' : ''}`}
                      onClick={() => setIsModuleMenuOpen(!isModuleMenuOpen)}
                      title="Добавить модуль"
                    >
                      +
                    </button>
                  </div>
                </div>
              </>
            } />

            {/* СТРАНИЦА: МАСТЕРСКАЯ ИСПЫТАНИЙ */}
            <Route path="/trials" element={<TrialsTab />} />

            {/* СТРАНИЦА 2: СПРАВОЧНИК ЦЕН */}
            <Route path="/prices" element={<PricesTab />} />

            {/* СТРАНИЦА 3: КАЛЬКУЛЯТОР ЛУТА */}
            <Route path="/calculator" element={<CalculatorTab />} />

            {/* СТРАНИЦА 4: СПРАВОЧНИК */}
            <Route path="/rules" element={<RulesTab />} />

            {/* СТРАНИЦА 5: НАСТРОЙКИ */}
            <Route path="/settings" element={
              <SettingsTab snapToGrid={snapToGrid} setSnapToGrid={setSnapToGrid} isDarkTheme={isDarkTheme} setIsDarkTheme={setIsDarkTheme} onSave={handleSaveConfig} />
            } />

          </Routes>
        </main>

        {/* === КАСТОМНОЕ ОКНО ПОДТВЕРЖДЕНИЯ === */}
        {isConfirmOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
          }}>
            <div style={{
              backgroundColor: 'var(--bg-module)', border: '1px solid var(--border-color)',
              padding: '25px', borderRadius: '12px', maxWidth: '400px', textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: 'var(--text-title)'
            }}>
              <h3 style={{ marginTop: 0 }}>Очистить стол?</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '25px', lineHeight: '1.5' }}>
                Все несохраненные данные модулей будут удалены. Это действие нельзя отменить.
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button onClick={() => setIsConfirmOpen(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-title)', borderRadius: '6px', cursor: 'pointer', transition: '0.2s' }}>
                  Отмена
                </button>
                <button onClick={confirmClear} style={{ padding: '10px 20px', backgroundColor: '#ef4444', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)' }}>
                  Да, очистить
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </HashRouter>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
