import React from 'react';
import { Rnd } from 'react-rnd';
import { Pin, PinOff, ChevronDown, ChevronUp, X, Sparkles, Plus, Trash2, Minus, FastForward } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext.jsx';

export default function EffectTracker({ 
  onClose, 
  effects, 
  setEffects, 
  isPinned, 
  setIsPinned, 
  isMinimized, 
  setIsMinimized, 
  snapToGrid, 
  layout, 
  setLayout 
}) {

  const { t } = useTranslation();

  // --- ФУНКЦИИ УПРАВЛЕНИЯ СПИСКОМ ---
  const handleAddEffect = () => {
    const newId = effects.length > 0 ? Math.max(...effects.map(e => e.id)) + 1 : 1;
    setEffects([...effects, { id: newId, name: '', target: '', duration: 10 }]);
  };

  const handleRemoveEffect = (id) => {
    setEffects(effects.filter(e => e.id !== id));
  };

  const handleUpdateEffect = (id, field, value) => {
    setEffects(effects.map(e => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const changeDuration = (id, delta) => {
    setEffects(effects.map(e => {
      if (e.id === id) {
        const newDuration = Math.max(0, Number(e.duration || 0) + delta);
        return { ...e, duration: newDuration };
      }
      return e;
    }));
  };

  // --- МАГИЧЕСКАЯ КНОПКА "СЛЕДУЮЩИЙ РАУНД" ---
  const handleNextRound = () => {
    setEffects(effects.map(e => ({
      ...e,
      // Уменьшаем у всех на 1, но не даем уйти в минус
      duration: Math.max(0, Number(e.duration || 0) - 1) 
    })));
  };

  return (
    <Rnd
      className={isMinimized ? "module-card minimized" : "module-card"}
      default={{ 
        x: layout?.x || 200, 
        y: layout?.y || 200, 
        width: layout?.width || 380, 
        height: layout?.height || 300 
      }}
      minWidth={320}
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
          <Sparkles size={20} /> {t('modules.effects.title')}
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
        
        {/* Заголовки столбцов */}
        <div style={{ display: 'flex', gap: '6px', padding: '0 8px 6px 8px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>
          <div style={{ flex: 2 }}>{t('modules.effects.effect')}</div>
          <div style={{ flex: 2 }}>{t('modules.effects.target')}</div>
          <div style={{ width: '85px', textAlign: 'center' }}>{t('modules.effects.rounds')}</div>
          <div style={{ width: '28px' }}></div>
        </div>

        {/* Список эффектов */}
        <div className="tracker-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px', paddingRight: '4px' }}>
          {effects.map((e) => {
            // Если раундов 0, активируем "тревожный" красный цвет
            const isExpired = e.duration <= 0;
            const borderColor = isExpired ? 'var(--accent-red)' : 'var(--border-color)';

            return (
              <div key={e.id} style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%' }}>
                
                <input
                  type="text"
                  placeholder={t('modules.effects.namePlaceholder')}
                  value={e.name}
                  onChange={(evt) => handleUpdateEffect(e.id, 'name', evt.target.value)}
                  style={{ 
                    flex: 2, minWidth: 0, padding: '8px', borderRadius: '4px', 
                    border: `1px solid ${borderColor}`, // Динамическая рамка
                    background: 'var(--bg-input)', color: 'white', boxSizing: 'border-box',
                    transition: '0.3s'
                  }}
                />
                
                <input
                  type="text"
                  placeholder={t('modules.effects.targetPlaceholder')}
                  value={e.target}
                  onChange={(evt) => handleUpdateEffect(e.id, 'target', evt.target.value)}
                  style={{ 
                    flex: 2, minWidth: 0, padding: '8px', borderRadius: '4px', 
                    border: `1px solid ${borderColor}`, // Динамическая рамка
                    background: 'var(--bg-input)', color: 'white', boxSizing: 'border-box',
                    transition: '0.3s'
                  }}
                />
                
                {/* Блок счетчика с кнопками */}
                <div style={{ 
                  display: 'flex', alignItems: 'center', background: 'var(--bg-input)', 
                  borderRadius: '4px', border: `1px solid ${borderColor}`, padding: '2px',
                  transition: '0.3s'
                }}>
                  <button onClick={() => changeDuration(e.id, -1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                    <Minus size={14} />
                  </button>
                  
                  <input
                    type="number"
                    value={e.duration}
                    onChange={(evt) => handleUpdateEffect(e.id, 'duration', evt.target.value)}
                    style={{ 
                      width: '30px', textAlign: 'center', background: 'transparent', border: 'none', 
                      color: isExpired ? 'var(--accent-red)' : 'white', 
                      fontWeight: 'bold', padding: '4px 0', boxSizing: 'border-box' 
                    }}
                  />
                  
                  <button onClick={() => changeDuration(e.id, 1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                    <Plus size={14} />
                  </button>
                </div>
                
                <button className="delete-btn" onClick={() => handleRemoveEffect(e.id)} style={{ padding: '6px', flexShrink: 0 }}>
                  <Trash2 size={16} />
                </button>
                
              </div>
            );
          })}
        </div>

        {/* Кнопки управления внизу */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="sort-btn" onClick={handleAddEffect} style={{ flex: 1, margin: 0, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Plus size={16} /> {t('modules.effects.add')}
          </button>
          
          <button 
            className="sort-btn" 
            onClick={handleNextRound} 
            style={{ 
              flex: 1, margin: 0, padding: '8px 0', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', gap: '6px', 
              backgroundColor: 'var(--accent-primary)', // Выделяем кнопку цветом
              color: 'white'
            }}
          >
            <FastForward size={16} /> {t('modules.effects.nextRound')}
          </button>
        </div>

      </div>
    </Rnd>
  );
}