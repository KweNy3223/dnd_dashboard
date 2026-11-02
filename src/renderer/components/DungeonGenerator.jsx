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
  Ruler,
  FileText
} from 'lucide-react';
import { 
  DUNGEON_THEMES, 
  generateRandomDungeonRoom 
} from '../data/dungeonData.js';

export default function DungeonGenerator({ onSendToNotes }) {
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

  const handleGenerate = (forceRandom = false) => {
    const theme = forceRandom ? 'any' : selectedTheme;
    if (forceRandom) setSelectedTheme('any');
    setCurrentRoom(generateRandomDungeonRoom(theme));
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

  const handleSendRoomToNotes = () => {
    if (!currentRoom || !onSendToNotes) return;
    const text = [
      `【 🗝️ Комната подземелья: ${currentRoom.title} 】`,
      `Размеры: ${currentRoom.size}`,
      `Архитектура: ${currentRoom.architecture}`,
      `Атмосфера: Зрение: ${currentRoom.sight} | Звук: ${currentRoom.sound} | Запах: ${currentRoom.smell}`,
      `Интерактивный объект: ${currentRoom.feature}`,
      `Опасность: ${currentRoom.hazard}`,
      `Находка (Сл ${currentRoom.investigationDC}): ${currentRoom.treasure}`
    ].join('\n');
    onSendToNotes(text, currentRoom.title);
  };

  return (
    <div>
      {/* Шапка подраздела */}
      <div className="generators-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Compass size={26} color="var(--accent-primary)" />
          <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-title)' }}>
            Генератор Комнат и Данжей
          </h2>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Атмосферные залы подземелий: габариты, звуки и запахи, интерактивные механизмы, опасности и секреты.
        </p>
      </div>

      {/* Горизонтальная панель фильтров */}
      <div className="generators-toolbar">
        <div className="filters-group">
          <div className="filter-item">
            <label>Тип подземелья:</label>
            <select 
              value={selectedTheme} 
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="curtain-select filter-select"
            >
              {DUNGEON_THEMES.map(theme => (
                <option key={theme.id} value={theme.id}>{theme.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="gen-buttons-group">
          <button 
            type="button" 
            className="trials-btn primary gen-main-btn"
            onClick={() => handleGenerate(false)}
          >
            <Dices size={18} /> Сгенерировать зал
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={() => handleGenerate(true)}
            title="Случайная тема"
          >
            <RotateCcw size={16} /> Рандом
          </button>
        </div>
      </div>

      {/* Основная сетка: Карточка комнаты слева (1fr) + Записная книжка справа (320px) */}
      <div className="generators-main-layout">
        
        {/* Карточка комнаты */}
        {currentRoom && (
          <div className="npc-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Шапка карточки */}
            <div className="npc-card-header">
              <div className="npc-avatar-box">
                <span className="npc-race-emoji">🗝️</span>
              </div>
              <div className="npc-title-box">
                <h3 className="npc-name">{currentRoom.title}</h3>
                <div className="npc-meta-row">
                  <span className="npc-tag highlight">{currentRoom.themeLabel}</span>
                  <span className="npc-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                    {currentRoom.size}
                  </span>
                </div>
              </div>

              <div className="npc-actions-box">
                <button 
                  type="button" 
                  className={`trials-btn secondary icon-btn ${isSaved ? 'active' : ''}`}
                  onClick={toggleSaveRoom}
                  title={isSaved ? 'Удалить из сохраненных' : 'Сохранить комнату'}
                >
                  <Bookmark size={17} color={isSaved ? 'var(--accent-gold)' : 'currentColor'} />
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleSendRoomToNotes}
                  title="Отправить комнату в Заметки на Стол"
                >
                  <FileText size={17} />
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleCopy}
                  title="Скопировать описание"
                >
                  {copied ? <Check size={17} color="#22c55e" /> : <Copy size={17} />}
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={() => handleGenerate(false)}
                  title="Сгенерировать заново"
                >
                  <RotateCcw size={17} />
                </button>
              </div>
            </div>

            {/* Архитектура */}
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#facc15', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                    <Eye size={14} /> Зрение и Свет
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                    {currentRoom.sight}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                    <Volume2 size={14} /> Звуки и Эхо
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                    {currentRoom.sound}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                    <Wind size={14} /> Запах и Воздух
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                    {currentRoom.smell}
                  </div>
                </div>
              </div>
            </div>

            {/* Интерактивный объект и механизм */}
            <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>
                <Puzzle size={17} /> Интерактивный объект / Механизм
              </div>
              <p style={{ margin: 0, color: 'var(--text-title)', fontSize: '14px', lineHeight: '1.5' }}>
                {currentRoom.feature}
              </p>
            </div>

            {/* Опасность и Тайник */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                  <AlertTriangle size={16} /> Ловушка (Внимательность Сл {currentRoom.perceptionDC})
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                  {currentRoom.hazard}
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                  <Sparkles size={16} /> Скрытый тайник (Анализ Сл {currentRoom.investigationDC})
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                  {currentRoom.treasure}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Правая панель: Сохраненные залы */}
        <div className="saved-npcs-sidebar">
          <div className="saved-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={16} color="var(--accent-gold)" />
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)' }}>
                Залы подземелья ({savedRooms.length})
              </h4>
            </div>
            {savedRooms.length > 0 && (
              <button 
                type="button" 
                className="clean-btn" 
                onClick={() => setSavedRooms([])}
                title="Очистить список"
              >
                Очистить
              </button>
            )}
          </div>

          <p style={{ margin: '4px 0 10px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            Сохраняйте описания комнат для построения карты приключения.
          </p>

          <div className="saved-list">
            {savedRooms.length === 0 ? (
              <div className="saved-empty-state">
                <span>🗝️</span>
                <p>Нажмите значок закладки, чтобы сохранить зал в план данжа.</p>
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
                    <span className="item-meta">{item.themeLabel} • {item.size.split('(')[0]}</span>
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
    </div>
  );
}
