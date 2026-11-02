import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Eye, 
  Volume2, 
  Wind, 
  Puzzle, 
  AlertTriangle, 
  Sparkles, 
  Dices, 
  Bookmark, 
  Copy, 
  Check, 
  Trash2, 
  RotateCcw,
  Ruler
} from 'lucide-react';
import { 
  DUNGEON_THEMES, 
  generateRandomDungeonRoom 
} from '../data/dungeonData.js';

export default function DungeonGenerator() {
  const [selectedTheme, setSelectedTheme] = useState('any');
  const [currentRoom, setCurrentRoom] = useState(() => {
    try {
      const cached = localStorage.getItem('dnd_active_room');
      return cached ? JSON.parse(cached) : generateRandomDungeonRoom();
    } catch {
      return generateRandomDungeonRoom();
    }
  });

  const [savedRooms, setSavedRooms] = useState(() => {
    try {
      const saved = localStorage.getItem('dnd_saved_rooms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copied, setCopied] = useState(false);
  const [skillRoll, setSkillRoll] = useState(null);

  useEffect(() => {
    if (currentRoom) {
      try {
        localStorage.setItem('dnd_active_room', JSON.stringify(currentRoom));
      } catch (e) {
        console.warn('Не удалось закешировать активную комнату', e);
      }
    }
  }, [currentRoom]);

  useEffect(() => {
    try {
      localStorage.setItem('dnd_saved_rooms', JSON.stringify(savedRooms));
    } catch (e) {
      console.warn('Не удалось сохранить список комнат', e);
    }
  }, [savedRooms]);

  const handleGenerate = () => {
    setSkillRoll(null);
    setCurrentRoom(generateRandomDungeonRoom(selectedTheme));
  };

  const handleRollSkill = (type) => {
    if (!currentRoom) return;
    const roll = Math.floor(Math.random() * 20) + 1;
    const targetDC = type === 'perception' ? currentRoom.perceptionDC : currentRoom.investigationDC;
    const isSuccess = roll >= targetDC;
    setSkillRoll({
      type: type === 'perception' ? 'Внимательность' : 'Анализ',
      roll,
      dc: targetDC,
      isSuccess
    });
  };

  const isSaved = savedRooms.some(r => r.id === currentRoom?.id);

  const toggleSaveRoom = () => {
    if (!currentRoom) return;
    if (isSaved) {
      setSavedRooms(savedRooms.filter(r => r.id !== currentRoom.id));
    } else {
      setSavedRooms([currentRoom, ...savedRooms]);
    }
  };

  const removeSavedRoom = (id, e) => {
    e.stopPropagation();
    setSavedRooms(savedRooms.filter(r => r.id !== id));
  };

  const handleCopy = () => {
    if (!currentRoom) return;
    const text = `🗝️ ПОДЗЕМЕЛЬЕ: ${currentRoom.title}\n` +
      `📐 Размеры: ${currentRoom.size}\n` +
      `🏛️ Архитектура: ${currentRoom.architecture}\n\n` +
      `👁️ Зрение: ${currentRoom.sight}\n` +
      `👂 Слух: ${currentRoom.sound}\n` +
      `👃 Запах: ${currentRoom.smell}\n\n` +
      `🧩 Интерактивный объект: ${currentRoom.feature}\n` +
      `⚠️ Опасность / Ловушка: ${currentRoom.hazard}\n` +
      `💎 Находка (Сл ${currentRoom.investigationDC}): ${currentRoom.treasure}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="npc-generator-container">
      {/* ЛЕВАЯ ПАНЕЛЬ: Фильтры */}
      <div className="npc-controls-panel">
        <h3 className="controls-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={20} color="var(--accent-primary)" />
          Параметры данжа
        </h3>

        <div className="control-group">
          <label>Тип подземелья</label>
          <select 
            value={selectedTheme} 
            onChange={(e) => setSelectedTheme(e.target.value)}
          >
            {DUNGEON_THEMES.map(theme => (
              <option key={theme.id} value={theme.id}>{theme.label}</option>
            ))}
          </select>
        </div>

        <button 
          type="button" 
          className="generate-main-btn"
          onClick={handleGenerate}
        >
          <Dices size={18} /> Сгенерировать зал
        </button>

        {currentRoom && (
          <div className="npc-card" style={{ marginTop: '20px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Dices size={15} color="var(--accent-gold)" /> Проверки отряда
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                type="button" 
                className="con-roll-btn"
                style={{ width: '100%', justifyContent: 'space-between' }}
                onClick={() => handleRollSkill('perception')}
              >
                <span>Внимательность (Заметить ловушку)</span>
                <strong>Сл {currentRoom.perceptionDC}</strong>
              </button>
              <button 
                type="button" 
                className="con-roll-btn"
                style={{ width: '100%', justifyContent: 'space-between' }}
                onClick={() => handleRollSkill('investigation')}
              >
                <span>Анализ (Найти тайник)</span>
                <strong>Сл {currentRoom.investigationDC}</strong>
              </button>
            </div>

            {skillRoll && (
              <div style={{ marginTop: '12px', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: skillRoll.isSuccess ? '#4ade80' : '#ef4444' }}>
                    {skillRoll.type}: d20 = {skillRoll.roll}
                  </span>
                  <span style={{ 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    fontSize: '11px',
                    backgroundColor: skillRoll.isSuccess ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: skillRoll.isSuccess ? '#4ade80' : '#f87171',
                    fontWeight: 'bold'
                  }}>
                    {skillRoll.isSuccess ? 'УСПЕХ' : 'ПРОВАЛ'} (Сл {skillRoll.dc})
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ЦЕНТРАЛЬНАЯ ПАНЕЛЬ: Карточка комнаты */}
      <div className="npc-display-panel">
        {currentRoom && (
          <div className="npc-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Шапка карточки */}
            <div className="card-top-header">
              <div className="card-main-meta">
                <span className="card-race-icon">🗝️</span>
                <div>
                  <h2 className="card-character-name" style={{ fontSize: '20px' }}>
                    {currentRoom.title}
                  </h2>
                  <span className="card-character-sub">
                    {currentRoom.themeLabel} • {currentRoom.size}
                  </span>
                </div>
              </div>

              <div className="card-action-btns">
                <button 
                  type="button" 
                  className={`card-tool-btn ${isSaved ? 'bookmarked' : ''}`}
                  onClick={toggleSaveRoom}
                  title={isSaved ? 'Удалить из сохраненных' : 'Сохранить комнату'}
                >
                  <Bookmark size={18} />
                </button>
                <button 
                  type="button" 
                  className="card-tool-btn"
                  onClick={handleCopy}
                  title="Скопировать описание зала"
                >
                  {copied ? <Check size={18} color="#22c55e" /> : <Copy size={18} />}
                </button>
                <button 
                  type="button" 
                  className="card-tool-btn"
                  onClick={handleGenerate}
                  title="Сгенерировать заново"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            {/* Архитектура и кладка */}
            <div style={{ backgroundColor: 'var(--bg-input)', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                <Ruler size={16} /> Архитектура и кладка
              </div>
              <p style={{ margin: 0, color: 'var(--text-title)', fontSize: '14px', lineHeight: '1.5' }}>
                {currentRoom.architecture}
              </p>
            </div>

            {/* Атмосфера 3 чувств */}
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--accent-gold)" /> Атмосфера чувств
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div style={{ backgroundColor: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#facc15', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                    <Eye size={14} /> Зрение и Свет
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                    {currentRoom.sight}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                    <Volume2 size={14} /> Звуки и Эхо
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                    {currentRoom.sound}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                    <Wind size={14} /> Запах и Воздух
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                    {currentRoom.smell}
                  </div>
                </div>
              </div>
            </div>

            {/* Интерактивный объект и загадка */}
            <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>
                <Puzzle size={17} /> Интерактивный объект / Механизм
              </div>
              <p style={{ margin: 0, color: 'var(--text-title)', fontSize: '14px', lineHeight: '1.5' }}>
                {currentRoom.feature}
              </p>
            </div>

            {/* Опасность и Тайник */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                  <AlertTriangle size={16} /> Опасность / Ловушка (Внимательность Сл {currentRoom.perceptionDC})
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                  {currentRoom.hazard}
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                  <Sparkles size={16} /> Скрытая находка (Анализ Сл {currentRoom.investigationDC})
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                  {currentRoom.treasure}
                </p>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ: Сохраненные залы */}
      <div className="npc-saved-panel">
        <h3 className="saved-title">
          <span>Сохранённые залы</span>
          <span className="saved-count">{savedRooms.length}</span>
        </h3>

        <div className="saved-list">
          {savedRooms.length === 0 ? (
            <div className="saved-empty-state">
              <span>⭐</span>
              <p>Нажмите значок закладки, чтобы сохранить комнату подземелья.</p>
            </div>
          ) : (
            savedRooms.map(item => (
              <div 
                key={item.id} 
                className={`saved-npc-item ${currentRoom?.id === item.id ? 'active' : ''}`}
                onClick={() => setCurrentRoom(item)}
              >
                <span className="item-icon">🗝️</span>
                <div className="item-info">
                  <span className="item-name">{item.title}</span>
                  <span className="item-meta">{item.themeLabel} • Сл {item.investigationDC}</span>
                </div>
                <button 
                  type="button" 
                  className="item-delete-btn" 
                  onClick={(e) => removeSavedRoom(item.id, e)}
                  title="Удалить"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
