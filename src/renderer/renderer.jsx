import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css'
import { useState } from 'react';
import { Rnd } from 'react-rnd';
import { useRef } from 'react';

function InitiativeTracker({ onClose, participants, setParticipants, isPinned, setIsPinned, isMinimized, setIsMinimized }) {

  // 2. ФУНКЦИИ-ОБРАБОТЧИКИ
  const handleAddRow = () => {
    const newId = participants.length + 1;
    setParticipants([
      ...participants,
      { id: newId, name: '', init: '', hp: '', conditions: '' }
    ]);
  };

  const handleRemoveRow = (idToRemove) => {
    // Оставляем в памяти только тех персонажей, чей id не совпадает с удаляемым
    const updatedParticipants = participants.filter((p) => p.id !== idToRemove);
    setParticipants(updatedParticipants);
  };

  const handleInputChange = (id, field, value) => {
    const updatedParticipants = participants.map((p) => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    });
    setParticipants(updatedParticipants);
  };

  const handleSort = () => {
    // 1. Делаем копию массива (React требует менять память только через set...)
    const sortedParticipants = [...participants];

    // 2. Сортируем копию
    sortedParticipants.sort((a, b) => {
      // Превращаем текст в числа. Если поле пустое, считаем его нулем
      const initA = Number(a.init) || 0;
      const initB = Number(b.init) || 0;
      
      // Возвращаем разницу. Если результат положительный, b встанет выше a
      return initB - initA; 
    });

    // 3. Сохраняем отсортированный список обратно в память
    setParticipants(sortedParticipants);
  };

  // 3. РАЗМЕТКА (ВЫВОД НА ЭКРАН)
    return (
    <Rnd
      className={isMinimized ? "module-card minimized" : "module-card"}
      default={{ x: 50, y: 50, width: 600, height: 400 }} /* <--- МЕНЯЕМ 'auto' НА 400 */
      minWidth={550}
      minHeight={150}
      bounds="parent"
      dragHandleClassName="tracker-header"
      disableDragging={isPinned}
    >
      {/* 1. ШАПКА МОДУЛЯ */}
      <div className="tracker-header">
        <h3>Трекер Инициативы</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          
          <button className="pin-btn" onClick={() => setIsPinned(!isPinned)}>
            {isPinned ? '📌' : '📍'}
          </button>
          
          <button onClick={handleAddRow}>+</button>

          {/* Кнопка "Свернуть/Развернуть" */}
          <button className="pin-btn" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? '🔽' : '🔼'}
          </button>
          
          {/* Кнопка "Закрыть модуль" */}
          <button className="delete-btn" onClick={onClose} style={{ fontSize: '20px', padding: '0 4px' }}>
            ×
          </button>
          
        </div>
      </div>

      {/* 2. ТЕЛО МОДУЛЯ */}
      {/* 2. ТЕЛО МОДУЛЯ (Обернуто для плавной анимации) */}
      <div className={`tracker-body ${isMinimized ? 'collapsed' : ''}`}>
        <div className="tracker-body-inner">
          
          <div className="tracker-labels">
            <span>Персонаж</span>
            <span>Инициатива</span>
            <span>ХП</span>
            <span>Состояния</span>
            <span></span>
          </div>

          <div className="tracker-list">
            {participants.map((p) => (
              <div key={p.id} className="tracker-row">
                <input type="text" placeholder="Персонаж" value={p.name} onChange={(e) => handleInputChange(p.id, 'name', e.target.value)} />
                <input type="number" placeholder="Иниц." value={p.init} onChange={(e) => handleInputChange(p.id, 'init', e.target.value)} />
                <input type="number" placeholder="ХП" value={p.hp} onChange={(e) => handleInputChange(p.id, 'hp', e.target.value)} />
                <input type="text" placeholder="Эффекты" value={p.conditions} onChange={(e) => handleInputChange(p.id, 'conditions', e.target.value)} />
                <button className="delete-btn" onClick={() => handleRemoveRow(p.id)}>×</button>
              </div>
            ))}
          </div>

          <div className="tracker-footer">
            <button className="sort-btn" onClick={handleSort}>Сортировать</button>
          </div>

        </div>
      </div>
    </Rnd>
  );
}

function DiceRoller({ onClose, history, setHistory, isPinned, setIsPinned, isMinimized, setIsMinimized }) {
  // Локальная память для настроек броска
  const [quantity, setQuantity] = useState(1);
  const [modifier, setModifier] = useState(0);
  
  // Память для "Крупного экрана"
  const [latestRoll, setLatestRoll] = useState(null); 

  const rollDice = (sides) => {
    let sum = 0;
    let individualRolls = [];
    
    // Бросаем кубик нужное количество раз
    for (let i = 0; i < quantity; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      sum += roll;
      individualRolls.push(roll);
    }

    const total = sum + modifier;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Собираем красивую строку математики
    let baseStr = `${quantity}d${sides}`;
    if (modifier !== 0) {
      baseStr += modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
    }
    
    const detailsStr = `(${individualRolls.join(', ')})`;
    let fullText = `${baseStr} = ${detailsStr}`;
    if (modifier !== 0) {
      fullText += modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
    }
    fullText += ` = ${total}`;

    // Обновляем большой экран (с проверкой на 1 и 20 для d20)
    setLatestRoll({
      total: total,
      dice: `d${sides}`,
      details: fullText,
      isCrit: sides === 20 && quantity === 1 && sum === 20,
      isFail: sides === 20 && quantity === 1 && sum === 1
    });

    // Сохраняем в глобальную историю
    const newHistoryItem = { id: Date.now(), text: fullText, time: time };
    setHistory([newHistoryItem, ...history]);
  };

  return (
    <Rnd
      className={isMinimized ? "module-card minimized" : "module-card"}
      default={{ x: 100, y: 150, width: 450, height: 500 }}
      minWidth={400}
      minHeight={150}
      bounds="parent"
      dragHandleClassName="tracker-header"
      disableDragging={isPinned}
    >
      {/* 1. ШАПКА */}
      <div className="tracker-header">
        <h3>🎲 Бросок кубиков</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setIsPinned(!isPinned)}>
            {isPinned ? '📌' : '📍'}
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? '🔽' : '🔼'}
          </button>
          <button className="delete-btn" onClick={onClose} style={{ fontSize: '20px', padding: '0 4px' }}>
            ×
          </button>
        </div>
      </div>

      {/* 2. ТЕЛО */}
      <div className={`tracker-body ${isMinimized ? 'collapsed' : ''}`}>
        <div className="tracker-body-inner" style={{ gap: '15px' }}>
          
          {/* ОГРОМНЫЙ ЭКРАН РЕЗУЛЬТАТА С ВОДЯНЫМ ЗНАКОМ */}
          <div style={{
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            minHeight: '120px',
            justifyContent: 'center',
            position: 'relative', 
            overflow: 'hidden'    
          }}>
            {latestRoll ? (
              <>
                {/* ФОНОВЫЙ КУБИК (SVG водяной знак) */}
                <svg 
                  viewBox="0 0 100 100" 
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120px',
                    height: '120px',
                    opacity: latestRoll.isCrit || latestRoll.isFail ? 0.15 : 0.05, 
                    color: latestRoll.isCrit ? 'var(--accent-gold)' : latestRoll.isFail ? 'var(--accent-red)' : 'var(--text-title)',
                    zIndex: 0,
                    pointerEvents: 'none'
                  }}
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinejoin="round"
                >
                  <polygon points="50,5 95,28 95,72 50,95 5,72 5,28" />
                  <polygon points="50,5 25,50 75,50" />
                  <line x1="25" y1="50" x2="5" y2="28" />
                  <line x1="75" y1="50" x2="95" y2="28" />
                  <line x1="25" y1="50" x2="5" y2="72" />
                  <line x1="75" y1="50" x2="95" y2="72" />
                  <line x1="25" y1="50" x2="50" y2="95" />
                  <line x1="75" y1="50" x2="50" y2="95" />
                </svg>

                {/* САМ ТЕКСТ (Размещаем поверх кубика) */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    Результат броска {latestRoll.dice}:
                  </div>
                  <div style={{ 
                    fontSize: '56px', 
                    fontWeight: 'bold', 
                    lineHeight: '1',
                    color: latestRoll.isCrit ? 'var(--accent-gold)' : latestRoll.isFail ? 'var(--accent-red)' : 'var(--text-title)',
                    textShadow: latestRoll.isCrit 
                      ? '0 0 15px rgba(207, 168, 50, 0.6)' 
                      : latestRoll.isFail 
                        ? '0 0 15px rgba(237, 66, 69, 0.6)' 
                        : 'none'
                  }}>
                    {latestRoll.total}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {latestRoll.details}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '16px', position: 'relative', zIndex: 1 }}>
                Выберите количество и бросьте кубик
              </div>
            )}
          </div>

          {/* НАСТРОЙКА КОЛИЧЕСТВА И МОДИФИКАТОРА */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <div className="tracker-row" style={{ margin: 0, gridTemplateColumns: '1fr', textAlign: 'center', flex: 1 }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Количество</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                <button className="delete-btn" style={{ fontSize: '24px' }} onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-title)' }}>{quantity}</span>
                <button className="delete-btn" style={{ fontSize: '24px' }} onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div className="tracker-row" style={{ margin: 0, gridTemplateColumns: '1fr', textAlign: 'center', flex: 1 }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Модификатор</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                <button className="delete-btn" style={{ fontSize: '24px' }} onClick={() => setModifier(modifier - 1)}>-</button>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-title)' }}>{modifier > 0 ? `+${modifier}` : modifier}</span>
                <button className="delete-btn" style={{ fontSize: '24px' }} onClick={() => setModifier(modifier + 1)}>+</button>
              </div>
            </div>
          </div>

          {/* ПАНЕЛЬ КНОПОК (КУБИКИ) */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[4, 6, 8, 10, 12, 20, 100].map((dice) => (
              <button 
                key={dice} 
                className="sort-btn" 
                style={{ flex: 1, padding: '12px 0', margin: 0, fontSize: '16px', fontWeight: 'bold' }}
                onClick={() => rollDice(dice)}
              >
                d{dice}
              </button>
            ))}
          </div>

          {/* ИСТОРИЯ БРОСКОВ */}
          <div className="tracker-list" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            {history.map((roll) => (
              <div key={roll.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-primary)' }}>{roll.text}</span>
                <span style={{ color: 'var(--text-muted)' }}>{roll.time}</span>
              </div>
            ))}
          </div>

          <div className="tracker-footer">
            <button className="sort-btn" onClick={() => setHistory([])}>Очистить историю</button>
          </div>

        </div>
      </div>
    </Rnd>
  );
}

function NotepadModule({ onClose, text, setText, isPinned, setIsPinned, isMinimized, setIsMinimized }) {
  const fileInputRef = useRef(null);

  const handleSave = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `note_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setText(e.target.result);
    reader.readAsText(file);
  };

  return (
    <Rnd
      className={isMinimized ? "module-card minimized" : "module-card"}
      default={{ x: 200, y: 200, width: 350, height: 350 }}
      minWidth={250}
      minHeight={150}
      bounds="parent"
      dragHandleClassName="tracker-header"
      disableDragging={isPinned}
    >
      <div className="tracker-header">
        <h3>📝 Заметка</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setIsPinned(!isPinned)}>{isPinned ? '📌' : '📍'}</button>
          <button onClick={() => setIsMinimized(!isMinimized)}>{isMinimized ? '🔽' : '🔼'}</button>
          <button className="delete-btn" onClick={onClose} style={{ fontSize: '20px', padding: '0 4px' }}>×</button>
        </div>
      </div>

      <div className={`tracker-body ${isMinimized ? 'collapsed' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 40px)' }}>
        <div className="tracker-body-inner" style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, height: '100%' }}>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Наброски квестов, имена NPC..."
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '12px',
              fontFamily: 'inherit',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="sort-btn" onClick={handleSave} style={{ flex: 1, margin: 0, padding: '8px 0' }}>💾 .txt</button>
            <input type="file" ref={fileInputRef} onChange={handleLoad} style={{ display: 'none' }} accept=".txt" />
            <button className="sort-btn" onClick={() => fileInputRef.current.click()} style={{ flex: 1, margin: 0, padding: '8px 0' }}>📂 Загрузить</button>
            <button className="sort-btn" onClick={() => setText('')} style={{ flex: 1, margin: 0, padding: '8px 0', backgroundColor: 'var(--bg-hover)' }}>🗑️ Очистить</button>
          </div>
        </div>
      </div>
    </Rnd>
  );
}

function App() {
  // 1. ПАМЯТЬ ПРИЛОЖЕНИЯ
  const [modules, setModules] = useState([]);
  
  // Для плавающей кнопки добавления модулей (справа внизу)
  const [isModuleMenuOpen, setIsModuleMenuOpen] = useState(false);
  
  // Для верхней панели
  const [activeTab, setActiveTab] = useState('sessions');
  const [isSessionMenuOpen, setIsSessionMenuOpen] = useState(false);

  // 2. ФУНКЦИИ-ОБРАБОТЧИКИ
  function handleAddModule(moduleName) {
    const newModule = { 
      id: Date.now(), 
      name: moduleName,
      data: {} 
    };

    if (moduleName === 'Инициатива') {
      newModule.data = {
        participants: [{ id: 1, name: '', init: '', hp: '', conditions: '' }],
        isPinned: false,
        isMinimized: false
      };
    }

    if (moduleName === 'Кубики') {
      newModule.data = {
        history: [], 
        isPinned: false,
        isMinimized: false
      };
    }

    if (moduleName === 'Заметки') {
      newModule.data = {
        text: '', // <--- Просто пустая строка для нашего блокнота
        isPinned: false,
        isMinimized: false
      };
    }

    setModules([...modules, newModule]);
    
    // --- ИСПРАВЛЯЕМ ЭТУ СТРОЧКУ ---
    setIsModuleMenuOpen(false); 
  }

  // Новая функция: удаляет модуль по его ID
  function handleRemoveModule(idToRemove) {
    setModules(modules.filter((m) => m.id !== idToRemove));
  }

  // Функция для обновления данных конкретного модуля
  function updateModuleData(moduleId, newData) {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        // Берем модуль и обновляем его "рюкзак" (data), склеивая старые данные с новыми
        return { ...m, data: { ...m.data, ...newData } };
      }
      return m;
    }));
  }

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  // === СОХРАНЕНИЕ СЦЕНЫ ===
  function handleSaveConfig() {
    // 1. Превращаем наш массив модулей в красивый текст JSON
    const dataStr = JSON.stringify(modules, null, 2);
    // 2. Создаем системный файл (Blob - кусок данных)
    const blob = new Blob([dataStr], { type: 'application/json' });
    // 3. Делаем временную ссылку на этот файл
    const url = URL.createObjectURL(blob);
    
    // 4. Имитируем клик по ссылке для скачивания
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dnd_scene.json';
    a.click();
    
    URL.revokeObjectURL(url); // Убираем за собой мусор в памяти
  }

  // === ЗАГРУЗКА СЦЕНЫ ===
  function handleLoadConfig(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Читаем текст из файла и превращаем обратно в рабочий массив
        const loadedModules = JSON.parse(e.target.result);
        setModules(loadedModules); // Заменяем текущую память загруженной
      } catch (error) {
        alert("Ошибка при чтении файла! Убедитесь, что это правильный JSON.");
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Сбрасываем инпут, чтобы можно было загрузить файл повторно
  }


  // 3. РАЗМЕТКА
  return (
    <div className='app-container'>
      {/* --- НОВАЯ ВЕРХНЯЯ ПАНЕЛЬ --- */}
      <header className='top-navbar'>
        
        {/* Левая часть: Название и текущая сессия */}
        <div className="navbar-left">
          <h2 className="app-title">DnD Dashboard</h2>
        </div>

        {/* Центральная часть: Вкладки */}
        <nav className="navbar-center">
          
          <div style={{ position: 'relative' }}>
            <button 
              className={`nav-tab ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => { setActiveTab('sessions'); setIsSessionMenuOpen(!isSessionMenuOpen); }}
            >
              🗓️ Sessions
            </button>
            
            {/* Выпадающее меню Сессий */}
            {isSessionMenuOpen && (
              <div className="dropdown-menu session-menu">
                <button onClick={() => { handleSaveConfig(); setIsSessionMenuOpen(false); }}>💾 Сохранить</button>
                <button onClick={() => { document.getElementById('config-upload').click(); setIsSessionMenuOpen(false); }}>📂 Загрузить</button>
              </div>
            )}
          </div>

          <button className={`nav-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => {setActiveTab('notes'); setIsSessionMenuOpen(false);}}>📝 Notes</button>
          <button className={`nav-tab ${activeTab === 'creatures' ? 'active' : ''}`} onClick={() => {setActiveTab('creatures'); setIsSessionMenuOpen(false);}}>🐺 Creatures</button>
          <button className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => {setActiveTab('settings'); setIsSessionMenuOpen(false);}}>⚙️ Settings</button>
          
        </nav>

        {/* Правая часть: Пустая (или для профиля/часов) */}
        <div className="navbar-right"></div>
        
        {/* Скрытый инпут для загрузки файла */}
        <input type="file" id="config-upload" accept=".json" style={{ display: 'none' }} onChange={handleLoadConfig} />
      </header>
      
      {/* --- ГЛАВНЫЙ ЭКРАН С МОДУЛЯМИ --- */}
      {/* --- ГЛАВНЫЙ ЭКРАН С МОДУЛЯМИ --- */}
      <main className='main-board'>
        {modules.map((item) => {
          
          if (item.name === 'Инициатива') {
            return (
              <InitiativeTracker 
                key={item.id} 
                onClose={() => handleRemoveModule(item.id)}
                participants={item.data.participants}
                isPinned={item.data.isPinned}
                isMinimized={item.data.isMinimized}
                setParticipants={(newParticipants) => updateModuleData(item.id, { participants: newParticipants })}
                setIsPinned={(newPinned) => updateModuleData(item.id, { isPinned: newPinned })}
                setIsMinimized={(newMin) => updateModuleData(item.id, { isMinimized: newMin })}
              />
            );
          }

          if (item.name === 'Кубики') {
            return (
              <DiceRoller 
                key={item.id} 
                onClose={() => handleRemoveModule(item.id)}
                history={item.data.history || []}
                isPinned={item.data.isPinned}
                isMinimized={item.data.isMinimized}
                setHistory={(newHistory) => updateModuleData(item.id, { history: newHistory })}
                setIsPinned={(newPinned) => updateModuleData(item.id, { isPinned: newPinned })}
                setIsMinimized={(newMin) => updateModuleData(item.id, { isMinimized: newMin })}
              />
            );
          }

          if (item.name === 'Заметки') {
            return (
              <NotepadModule 
                key={item.id} 
                onClose={() => handleRemoveModule(item.id)}
                
                /* Наши уникальные данные для заметки */
                text={item.data.text || ''}
                setText={(newText) => updateModuleData(item.id, { text: newText })}
                
                /* Стандартные настройки окна */
                isPinned={item.data.isPinned}
                isMinimized={item.data.isMinimized}
                setIsPinned={(newPinned) => updateModuleData(item.id, { isPinned: newPinned })}
                setIsMinimized={(newMin) => updateModuleData(item.id, { isMinimized: newMin })}
              />
            );
          }

          return null; 

        })}

        {/* --- ПЛАВАЮЩАЯ КНОПКА ДОБАВЛЕНИЯ МОДУЛЯ --- */}
        <div className="fab-container">
          {isModuleMenuOpen && (
            <div className="fab-menu">
              <button onClick={() => handleAddModule('Инициатива')}>Инициатива</button>
              <button onClick={() => handleAddModule('Кубики')}>Кубики</button>
              
              {/* --- ЗАМЕНИЛИ ИНВЕНТАРЬ НА ЗАМЕТКИ --- */}
              <button onClick={() => handleAddModule('Заметки')}>Заметки</button>
            </div>
          )}
          <button 
            className={`fab-button ${isModuleMenuOpen ? 'open' : ''}`}
            onClick={() => setIsModuleMenuOpen(!isModuleMenuOpen)}
            title="Добавить модуль"
          >
            +
          </button>
        </div>
      </main>
    </div>
  );
}

const container = document.getElementById('root');

// Говорим React отрисовать наш компонент внутри этого блока
const root = createRoot(container);
root.render(<App />);