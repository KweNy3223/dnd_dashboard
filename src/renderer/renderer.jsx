import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css'
import { useState } from 'react';
import { Rnd } from 'react-rnd';

function InitiativeTracker({onClose}) {
  // 1. ПАМЯТЬ
  const [participants, setParticipants] = useState([{
    id: 1,
    name: '',
    init: '',
    hp: '',
    conditions: ''
  }]);

  const [isPinned, setIsPinned] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

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
      {!isMinimized && (
        <>
          <div className="tracker-labels">
            <span>Персонаж</span>
            <span>Инициатива</span>
            <span>ХП</span>
            <span>Состояния</span>
            <span></span>
          </div>

          {/* НОВАЯ КОРОБКА: Прокручиваться будет только этот блок! */}
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
        </>
      )}
    </Rnd>
  );
}

function App() {
  // 1. ПАМЯТЬ ПРИЛОЖЕНИЯ
  const [modules, setModules] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 2. ФУНКЦИИ-ОБРАБОТЧИКИ
  function handleAddModule(moduleName) {
    // Теперь сохраняем не просто текст, а объект с уникальным ID (время в миллисекундах)
    const newModule = { id: Date.now(), name: moduleName };
    setModules([...modules, newModule]);
    setIsMenuOpen(false); 
  }

  // Новая функция: удаляет модуль по его ID
  function handleRemoveModule(idToRemove) {
    setModules(modules.filter((m) => m.id !== idToRemove));
  }

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  // 3. РАЗМЕТКА
  return (
    <div className='div'>
      <header className='head'>
        <h1 className='headertitle'>DnD DashBoard</h1>
        <button className='modulebtn' onClick={toggleMenu}>Добавить модуль</button>
        
        {isMenuOpen && (
          <div className="dropdown-menu">
            <button onClick={() => handleAddModule('Инициатива')}>Инициатива</button>
            <button onClick={() => handleAddModule('Кубики')}>Кубики</button>
            <button onClick={() => handleAddModule('Инвентарь')}>Инвентарь</button>
          </div>
        )}
      </header>
      
      <main className='main'>
        {modules.map((item) => {
          
          if (item.name === 'Инициатива') {
            return (
              <InitiativeTracker 
                key={item.id} 
                onClose={() => handleRemoveModule(item.id)} /* Передаем кнопку самоуничтожения */
              />
            );
          }
          
          return (
            <Rnd key={item.id} default={{ x: 100, y: 100, width: 300, height: 200 }} bounds="parent">
              <div className="module-card">
                <h3>{item.name}</h3>
                {/* Временная кнопка закрытия для заглушек */}
                <button onClick={() => handleRemoveModule(item.id)}>Закрыть</button>
              </div>
            </Rnd>
          );
          
        })}
      </main>
    </div>
  );
}

const container = document.getElementById('root');

// Говорим React отрисовать наш компонент внутри этого блока
const root = createRoot(container);
root.render(<App />);