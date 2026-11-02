import React from 'react';
import { Rnd } from 'react-rnd';
import { Pin, PinOff, ChevronDown, ChevronUp, X, Swords, Plus, ArrowDown10, Trash2 } from 'lucide-react';

export default function InitiativeTracker({ 
  onClose, 
  participants, 
  setParticipants, 
  isPinned, 
  setIsPinned, 
  isMinimized, 
  setIsMinimized, 
  snapToGrid, 
  layout, 
  setLayout 
}) {

  // --- Функции управления списком ---
  const handleAddParticipant = () => {
    // Ищем самый большой ID и прибавляем 1, чтобы не было дубликатов
    const newId = participants.length > 0 ? Math.max(...participants.map(p => p.id)) + 1 : 1;
    setParticipants([...participants, { id: newId, name: '', init: '', ac: '', hp: '', conditions: '' }]);
  };

  const handleRemoveParticipant = (id) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const handleUpdateParticipant = (id, field, value) => {
    setParticipants(participants.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleSort = () => {
    // Сортируем от наибольшей инициативы к наименьшей
    const sorted = [...participants].sort((a, b) => Number(b.init) - Number(a.init));
    setParticipants(sorted);
  };

  return (
    <Rnd
      className={isMinimized ? "module-card minimized" : "module-card"}
      default={{ 
        x: layout?.x || 100, 
        y: layout?.y || 100, 
        width: layout?.width || 360, 
        height: layout?.height || 450 
      }}
      minWidth={310}
      minHeight={200}
      bounds="parent"
      dragHandleClassName="tracker-header"
      disableDragging={isPinned}
      dragGrid={snapToGrid ? [50, 50] : [1, 1]}
      
      onDragStop={(e, d) => {
        if (setLayout) setLayout({ ...(layout || {}), x: d.x, y: d.y });
      }}
      
      onResizeStop={(e, direction, ref, delta, position) => {
        if (setLayout) {
          setLayout({
            width: ref.style.width,
            height: ref.style.height,
            x: position.x,
            y: position.y
          });
        }
      }}
    >
      {/* 1. ШАПКА */}
      <div className="tracker-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Swords size={20} /> Инициатива
        </h3>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button onClick={() => setIsPinned(!isPinned)}>
            {isPinned ? <Pin size={18} /> : <PinOff size={18} />}
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
          <button className="delete-btn" onClick={onClose} style={{ padding: '0 4px' }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 2. ТЕЛО */}
      <div className={`tracker-body ${isMinimized ? 'collapsed' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 40px)' }}>
        
        {/* Список участников (с прокруткой, если их много) */}
        {/* Список участников (с прокруткой, если их много) */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden', /* Жестко запрещаем горизонтальный ползунок */
          paddingRight: '4px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          marginBottom: '10px' 
        }}>
          {participants.map((p) => (
            <div key={p.id} style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%' }}>
              
              <input
                type="text"
                placeholder="Имя"
                value={p.name}
                onChange={(e) => handleUpdateParticipant(p.id, 'name', e.target.value)}
                style={{ 
                  flex: 1, 
                  minWidth: 0, /* Позволяет инпуту сжиматься */
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid var(--border-color)', 
                  background: 'var(--bg-input)', 
                  color: 'white', 
                  boxSizing: 'border-box' 
                }}
              />
              
              <input
                type="number"
                placeholder="Иниц."
                title="Инициатива"
                value={p.init}
                onChange={(e) => handleUpdateParticipant(p.id, 'init', e.target.value)}
                style={{ 
                  width: '48px', 
                  minWidth: '48px', 
                  padding: '8px 2px', 
                  borderRadius: '4px', 
                  border: '1px solid var(--border-color)', 
                  background: 'var(--bg-input)', 
                  color: 'white', 
                  boxSizing: 'border-box', 
                  textAlign: 'center' 
                }}
              />

              <input
                type="number"
                placeholder="КД"
                title="Класс Доспеха (КД)"
                value={p.ac ?? ''}
                onChange={(e) => handleUpdateParticipant(p.id, 'ac', e.target.value)}
                style={{ 
                  width: '44px', 
                  minWidth: '44px', 
                  padding: '8px 2px', 
                  borderRadius: '4px', 
                  border: '1px solid var(--border-color)', 
                  background: 'var(--bg-input)', 
                  color: '#38bdf8', 
                  fontWeight: '600',
                  boxSizing: 'border-box', 
                  textAlign: 'center' 
                }}
              />
              
              <input
                type="number"
                placeholder="ХП"
                title="Очки здоровья (ХП)"
                value={p.hp}
                onChange={(e) => handleUpdateParticipant(p.id, 'hp', e.target.value)}
                style={{ 
                  width: '48px', 
                  minWidth: '48px', 
                  padding: '8px 2px', 
                  borderRadius: '4px', 
                  border: '1px solid var(--border-color)', 
                  background: 'var(--bg-input)', 
                  color: '#4ade80', 
                  fontWeight: '600',
                  boxSizing: 'border-box', 
                  textAlign: 'center' 
                }}
              />
              
              <button className="delete-btn" onClick={() => handleRemoveParticipant(p.id)} style={{ padding: '6px', flexShrink: 0 }}>
                <Trash2 size={16} />
              </button>
              
            </div>
          ))}
        </div>

        {/* Кнопки управления в самом низу */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="sort-btn" onClick={handleAddParticipant} style={{ flex: 1, margin: 0, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Plus size={16} /> Добавить
          </button>
          <button className="sort-btn" onClick={handleSort} style={{ flex: 1, margin: 0, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <ArrowDown10 size={16} /> Сортировка
          </button>
        </div>

      </div>
    </Rnd>
  );
}