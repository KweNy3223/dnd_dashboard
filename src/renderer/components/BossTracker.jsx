import React from 'react';
import { Rnd } from 'react-rnd';
import { Pin, PinOff, ChevronDown, ChevronUp, X, Skull, Heart, Shield, Zap, RotateCcw } from 'lucide-react';

export default function BossTracker({ 
  onClose, 
  bossData, 
  setBossData, 
  isPinned, 
  setIsPinned, 
  isMinimized, 
  setIsMinimized, 
  snapToGrid, 
  layout, 
  setLayout 
}) {

  // Безопасное обновление данных босса
  const updateData = (field, value) => {
    setBossData({ ...bossData, [field]: value });
  };

  const handleHpChange = (delta) => {
    const newHp = Math.max(0, Math.min(bossData.maxHp, Number(bossData.currentHp || 0) + delta));
    updateData('currentHp', newHp);
  };

  // Вычисляем процент здоровья для полоски
  const hpPercent = bossData.maxHp > 0 ? Math.max(0, Math.min(100, (bossData.currentHp / bossData.maxHp) * 100)) : 0;
  
  // Цвет полоски меняется в зависимости от состояния
  const getHpColor = () => {
    if (hpPercent > 50) return '#22c55e'; // Зеленый
    if (hpPercent > 20) return '#eab308'; // Желтый
    return '#ef4444'; // Красный
  };

  // Функция для отрисовки кликабельных точек (Легендарные действия/сопротивления)
  const renderDots = (current, field, max = 3) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        {[...Array(max)].map((_, i) => (
          <div 
            key={i}
            onClick={() => updateData(field, i < current ? i : i + 1)} // Клик меняет количество
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '2px solid var(--border-color)',
              backgroundColor: i < current ? 'var(--accent-primary)' : 'transparent',
              cursor: 'pointer',
              transition: '0.2s',
              boxShadow: i < current ? '0 0 8px var(--accent-primary)' : 'none'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <Rnd
      className={isMinimized ? "module-card minimized" : "module-card"}
      default={{ 
        x: layout?.x || 300, 
        y: layout?.y || 100, 
        width: layout?.width || 380, 
        height: layout?.height || 360 
      }}
      minWidth={320}
      minHeight={250}
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
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--accent-red)' }}>
          <Skull size={20} /> Босс
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
      <div className={`tracker-body ${isMinimized ? 'collapsed' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: 'calc(100% - 40px)' }}>
        
        {/* Имя Босса */}
        <input
          type="text"
          placeholder="Имя Эпического Врага..."
          value={bossData.name}
          onChange={(e) => updateData('name', e.target.value)}
          style={{ 
            width: '100%', padding: '10px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center',
            borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-title)', boxSizing: 'border-box'
          }}
        />

        {/* Блок Здоровья */}
        <div style={{ backgroundColor: 'var(--bg-app)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
              <Heart size={16} /> ЗДОРОВЬЕ
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input 
                type="number" 
                value={bossData.currentHp} 
                onChange={(e) => updateData('currentHp', Number(e.target.value))}
                style={{ width: '50px', padding: '4px', textAlign: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}
              />
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <input 
                type="number" 
                value={bossData.maxHp} 
                onChange={(e) => updateData('maxHp', Number(e.target.value))}
                style={{ width: '50px', padding: '4px', textAlign: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '4px' }}
              />
            </div>
          </div>

          {/* Визуальная полоска ХП */}
          <div style={{ height: '14px', background: 'var(--bg-input)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '10px' }}>
            <div style={{ 
              height: '100%', 
              width: `${hpPercent}%`, 
              backgroundColor: getHpColor(), 
              transition: 'width 0.3s ease, background-color 0.3s ease' 
            }} />
          </div>

          {/* Кнопки быстрого урона/лечения */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleHpChange(-10)} className="sort-btn" style={{ flex: 1, margin: 0, padding: '6px', fontSize: '12px' }}>-10 ХП</button>
            <button onClick={() => handleHpChange(-5)} className="sort-btn" style={{ flex: 1, margin: 0, padding: '6px', fontSize: '12px' }}>-5 ХП</button>
            <button onClick={() => handleHpChange(5)} className="sort-btn" style={{ flex: 1, margin: 0, padding: '6px', fontSize: '12px' }}>+5 ХП</button>
            <button onClick={() => handleHpChange(10)} className="sort-btn" style={{ flex: 1, margin: 0, padding: '6px', fontSize: '12px' }}>+10 ХП</button>
          </div>
        </div>

        {/* Легендарные Сопротивления */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-app)', padding: '12px 15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
            <Shield size={18} color="var(--accent-gold)" /> Лег. Сопротивления
          </div>
          {renderDots(bossData.legResistances, 'legResistances')}
        </div>

        {/* Легендарные Действия */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-app)', padding: '12px 15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
            <Zap size={18} color="#3b82f6" /> Лег. Действия
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {renderDots(bossData.legActions, 'legActions')}
            <button 
              onClick={() => updateData('legActions', 3)} 
              title="Восстановить действия"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

      </div>
    </Rnd>
  );
}