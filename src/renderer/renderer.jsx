import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom'; // Импортируем магию роутера
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
  Swords,
  Sparkles,
  User,
  Beer,
  Scroll,
  Compass,
  Gem
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
import GeneratorsTab from './components/GeneratorsTab.jsx';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext.jsx';

import logoSvg from './assets/logo.svg';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('app.title');
  }, [t]);
  const isTrialsRoute = location.pathname.startsWith('/trials');
  const isGeneratorsRoute = location.pathname.startsWith('/generators');

  // 1. ПАМЯТЬ ПРИЛОЖЕНИЯ С СОХРАНЕНИЕМ В LOCALSTORAGE
  const [modules, setModules] = useState(() => {
    try {
      const saved = localStorage.getItem('dnd_table_modules');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Ошибка загрузки модулей стола:', e);
      return [];
    }
  });

  const [snapToGrid, setSnapToGrid] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isModuleMenuOpen, setIsModuleMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // Для кастомного окна очистки стола

  // Всплывающее уведомление (Toast)
  const [toast, setToast] = useState(null);

  // Синхронизация модулей стола с localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dnd_table_modules', JSON.stringify(modules));
    } catch (e) {
      console.error('Ошибка сохранения модулей стола:', e);
    }
  }, [modules]);

  // Функция показа уведомлений
  function showToast(message, actionLabel = t('common.sendToTable'), actionPath = '/') {
    setToast({ message, actionLabel, actionPath });
  }

  // Автоматическое скрытие тоста
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  // 2. ФУНКЦИИ-ОБРАБОТЧИКИ
  function handleAddModule(moduleName) {
    const newModule = { 
      id: Date.now(), 
      name: moduleName,
      data: {} 
    };

    if (moduleName === 'Инициатива') {
      newModule.data = { participants: [{ id: 1, name: '', init: '', ac: '', hp: '', conditions: '' }], isPinned: false, isMinimized: false };
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

  // === СВЯЗКА ГЕНЕРАТОРОВ СО СТОЛОМ МАСТЕРА ===
  // 1. Отправка монстров из энкаунтера в Инициативу
  function handleSendToInitiative(roster, encounterTitle) {
    if (!roster || roster.length === 0) return;

    const newParticipants = [];
    roster.forEach((m, idx) => {
      const count = Number(m.count) || 1;
      for (let i = 1; i <= count; i++) {
        newParticipants.push({
          id: Date.now() + Math.floor(Math.random() * 10000) + idx * 20 + i,
          name: count > 1 ? `${m.name} #${i}` : m.name,
          init: '',
          ac: m.ac || '',
          hp: m.hp || '',
          conditions: ''
        });
      }
    });

    setModules(prev => {
      const existingIndex = prev.findIndex(mod => mod.name === 'Инициатива');
      if (existingIndex >= 0) {
        const updated = [...prev];
        const currentParticipants = updated[existingIndex].data?.participants || [];
        // Убираем пустую строчку-заглушку, если она была единственной пустой
        const cleanCurrent = currentParticipants.filter(p => (p.name && p.name.trim() !== '') || p.init !== '' || p.ac !== '' || p.hp !== '');
        updated[existingIndex] = {
          ...updated[existingIndex],
          data: {
            ...updated[existingIndex].data,
            participants: [...cleanCurrent, ...newParticipants]
          }
        };
        return updated;
      } else {
        const newModule = {
          id: Date.now(),
          name: 'Инициатива',
          data: {
            participants: newParticipants,
            isPinned: false,
            isMinimized: false
          }
        };
        return [...prev, newModule];
      }
    });

    showToast(t('table.sentInitiative', { count: newParticipants.length, title: encounterTitle || t('nav.encounters') }));
  }

  // 2. Отправка заметок (квесты, описания энкаунтеров, NPC, сокровища)
  function handleSendToNotes(noteText, noteTitle) {
    if (!noteText) return;

    setModules(prev => {
      const existingIndex = prev.findIndex(mod => mod.name === 'Заметки');
      if (existingIndex >= 0) {
        const updated = [...prev];
        const currentText = updated[existingIndex].data?.text || '';
        const separator = currentText.trim() ? '\n\n═════════════════════════════\n\n' : '';
        updated[existingIndex] = {
          ...updated[existingIndex],
          data: {
            ...updated[existingIndex].data,
            text: currentText + separator + noteText
          }
        };
        return updated;
      } else {
        const newModule = {
          id: Date.now(),
          name: 'Заметки',
          data: {
            text: noteText,
            isPinned: false,
            isMinimized: false
          }
        };
        return [...prev, newModule];
      }
    });

    showToast(t('table.sentNotes', { title: noteTitle || t('modules.notes') }));
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
        alert(t('table.loadError'));
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  // 3. РАЗМЕТКА
  return (
    <div className='app-container' data-theme={isDarkTheme ? 'dark' : 'light'}>
      
      {/* Боковая шторка навигации */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isDarkTheme={isDarkTheme}
        onToggleTheme={() => setIsDarkTheme(!isDarkTheme)}
      />

      {/* --- ВЕРХНЯЯ ПАНЕЛЬ НАВИГАЦИИ (скрывается в Мастерской Испытаний) --- */}
      {!isTrialsRoute && (
        <header className='top-navbar'>
          <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              type="button" 
              className="sidebar-toggle-btn"
              onClick={() => setIsSidebarOpen(true)}
              title={t('sidebar.openMenu')}
            >
              <Menu size={20} />
            </button>
            <h2 className="app-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isGeneratorsRoute ? (
                <>
                  <Sparkles size={20} color="#f2f3f5" />
                  <span>{t('nav.generators')}</span>
                </>
              ) : (
                <>
                  <img src={logoSvg} alt="d20" style={{ width: '22px', height: '22px' }} />
                  <span>DnD Dashboard</span>
                </>
              )}
            </h2>
          </div>

          <nav className="navbar-center" style={{ display: 'flex', gap: '12px' }}>
            {isGeneratorsRoute ? (
              <>
                <NavLink 
                  to="/generators/npc" 
                  className={`nav-tab ${location.pathname === '/generators/npc' || location.pathname === '/generators' ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <User size={18} /> NPC
                </NavLink>

                <NavLink 
                  to="/generators/tavern" 
                  className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Beer size={18} /> {t('nav.taverns')}
                </NavLink>

                <NavLink 
                  to="/generators/shops" 
                  className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Store size={18} /> {t('nav.shops')}
                </NavLink>

                <NavLink 
                  to="/generators/quests" 
                  className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Scroll size={18} /> {t('nav.quests')}
                </NavLink>

                <NavLink 
                  to="/generators/encounters" 
                  className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Swords size={18} /> {t('nav.encounters')}
                </NavLink>

                <NavLink 
                  to="/generators/dungeon" 
                  className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Compass size={18} /> {t('nav.dungeon')}
                </NavLink>

                <NavLink 
                  to="/generators/loot" 
                  className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Gem size={18} /> {t('nav.loot')}
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/" className="nav-tab" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LayoutDashboard size={18} /> {t('nav.table')}
                </NavLink>

                <NavLink to="/prices" className="nav-tab" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Store size={18} /> {t('nav.prices')}
                </NavLink>

                <NavLink to="/calculator" className="nav-tab" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calculator size={18} /> {t('nav.calculator')}
                </NavLink>

                <NavLink to="/rules" className="nav-tab" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={18} /> {t('nav.rules')}
                </NavLink>
                
                <NavLink to="/settings" className="nav-tab" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Settings size={18} /> {t('nav.settings')}
                </NavLink>
              </>
            )}
          </nav>

          <div className="navbar-right"></div>
          <input type="file" id="config-upload" accept=".json" style={{ display: 'none' }} onChange={handleLoadConfig} />
        </header>
      )}
        
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
                      <button onClick={() => handleAddModule('Инициатива')}>{t('modules.initiative')}</button>
                      <button onClick={() => handleAddModule('Кубики')}>{t('modules.dice')}</button>
                      <button onClick={() => handleAddModule('Заметки')}>{t('modules.notes')}</button>
                      <button onClick={() => handleAddModule('Таймер')}>{t('modules.timer')}</button>
                      <button onClick={() => handleAddModule('Эффекты')}>{t('modules.effects')}</button>
                      <button onClick={() => handleAddModule('Босс')}>{t('modules.bossTracker') || t('modules.boss')}</button>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', marginRight: '5px' }}>
                    {modules.length > 0 && !isModuleMenuOpen && (
                      <button className="trash-btn" onClick={handleClearBoardClick} title={t('table.clearBoard')}>
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button 
                      className={`fab-button ${isModuleMenuOpen ? 'open' : ''}`}
                      onClick={() => setIsModuleMenuOpen(!isModuleMenuOpen)}
                      title={t('table.addModule')}
                    >
                      +
                    </button>
                  </div>
                </div>
              </>
            } />

            {/* СТРАНИЦА: МАСТЕРСКАЯ ИСПЫТАНИЙ */}
            <Route path="/trials" element={<TrialsTab onOpenSidebar={() => setIsSidebarOpen(true)} />} />

            {/* СТРАНИЦА: ГЕНЕРАТОРЫ */}
            <Route path="/generators" element={<GeneratorsTab onSendToInitiative={handleSendToInitiative} onSendToNotes={handleSendToNotes} />} />
            <Route path="/generators/npc" element={<GeneratorsTab onSendToInitiative={handleSendToInitiative} onSendToNotes={handleSendToNotes} />} />
            <Route path="/generators/tavern" element={<GeneratorsTab onSendToInitiative={handleSendToInitiative} onSendToNotes={handleSendToNotes} />} />
            <Route path="/generators/shops" element={<GeneratorsTab onSendToInitiative={handleSendToInitiative} onSendToNotes={handleSendToNotes} />} />
            <Route path="/generators/quests" element={<GeneratorsTab onSendToInitiative={handleSendToInitiative} onSendToNotes={handleSendToNotes} />} />
            <Route path="/generators/encounters" element={<GeneratorsTab onSendToInitiative={handleSendToInitiative} onSendToNotes={handleSendToNotes} />} />
            <Route path="/generators/dungeon" element={<GeneratorsTab onSendToInitiative={handleSendToInitiative} onSendToNotes={handleSendToNotes} />} />
            <Route path="/generators/loot" element={<GeneratorsTab onSendToInitiative={handleSendToInitiative} onSendToNotes={handleSendToNotes} />} />

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

        {/* === ВСПЛЫВАЮЩИЙ ТОСТ СВЯЗКИ СО СТОЛОМ === */}
        {toast && (
          <aside aria-label={t('table.notification')} className="table-toast-banner">
            <div className="table-toast-content">
              <Sparkles size={18} color="var(--accent-gold)" />
              <span className="table-toast-text">{toast.message}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                type="button" 
                className="table-toast-action-btn"
                onClick={() => {
                  navigate(toast.actionPath || '/');
                  setToast(null);
                }}
              >
                {toast.actionLabel} →
              </button>
              <button 
                type="button" 
                className="table-toast-close-btn"
                onClick={() => setToast(null)}
                title={t('common.close')}
              >
                ✕
              </button>
            </div>
          </aside>
        )}

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
              <h3 style={{ marginTop: 0 }}>{t('table.clearTitle')}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '25px', lineHeight: '1.5' }}>
                {t('table.clearText')}
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button onClick={() => setIsConfirmOpen(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-title)', borderRadius: '6px', cursor: 'pointer', transition: '0.2s' }}>
                  {t('common.cancel')}
                </button>
                <button onClick={confirmClear} style={{ padding: '10px 20px', backgroundColor: '#ef4444', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)' }}>
                  {t('table.clearConfirm')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </LanguageProvider>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
