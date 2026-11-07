import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext.jsx';
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
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const [selectedTheme, setSelectedTheme] = useState('any');
  const [currentRoom, setCurrentRoom] = useState(() => {
    try {
      const cached = localStorage.getItem('dnd_active_room');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.title_en && parsed.architecture_en) {
          return parsed;
        }
      }
      return generateRandomDungeonRoom('any', { language });
    } catch {
      return generateRandomDungeonRoom('any', { language });
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

  // Обновление локализованных полей при смене языка
  useEffect(() => {
    if (!currentRoom || !currentRoom.title_en || !currentRoom.architecture_en) {
      setCurrentRoom(generateRandomDungeonRoom(selectedTheme, { language }));
    }
  }, [language]);

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
    setCurrentRoom(generateRandomDungeonRoom(theme, { language }));
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

  // Локализованные поля текущей комнаты
  const roomTitle = isEn ? (currentRoom?.title_en || currentRoom?.title) : (currentRoom?.title_ru || currentRoom?.title);
  const roomThemeLabel = isEn ? (currentRoom?.themeLabel_en || currentRoom?.themeLabel) : (currentRoom?.themeLabel_ru || currentRoom?.themeLabel);
  const roomSize = isEn ? (currentRoom?.size_en || currentRoom?.size) : (currentRoom?.size_ru || currentRoom?.size);
  const roomArchitecture = isEn ? (currentRoom?.architecture_en || currentRoom?.architecture) : (currentRoom?.architecture_ru || currentRoom?.architecture);
  const roomSight = isEn ? (currentRoom?.sight_en || currentRoom?.sight) : (currentRoom?.sight_ru || currentRoom?.sight);
  const roomSound = isEn ? (currentRoom?.sound_en || currentRoom?.sound) : (currentRoom?.sound_ru || currentRoom?.sound);
  const roomSmell = isEn ? (currentRoom?.smell_en || currentRoom?.smell) : (currentRoom?.smell_ru || currentRoom?.smell);
  const roomFeature = isEn ? (currentRoom?.feature_en || currentRoom?.feature) : (currentRoom?.feature_ru || currentRoom?.feature);
  const roomHazard = isEn ? (currentRoom?.hazard_en || currentRoom?.hazard) : (currentRoom?.hazard_ru || currentRoom?.hazard);
  const roomTreasure = isEn ? (currentRoom?.treasure_en || currentRoom?.treasure) : (currentRoom?.treasure_ru || currentRoom?.treasure);

  const handleCopy = () => {
    if (!currentRoom) return;
    const text = isEn ? [
      `🗝️ DUNGEON CHAMBER: ${roomTitle}`,
      `📐 Dimensions: ${roomSize}`,
      `🏛️ Architecture: ${roomArchitecture}`,
      '',
      `👁️ Sight & Light: ${roomSight}`,
      `👂 Sound & Echo: ${roomSound}`,
      `👃 Scent & Air: ${roomSmell}`,
      '',
      `🧩 Interactive Mechanism: ${roomFeature}`,
      `⚠️ Trap / Hazard (Perception DC ${currentRoom.perceptionDC}): ${roomHazard}`,
      `💎 Secret Discovery (Investigation DC ${currentRoom.investigationDC}): ${roomTreasure}`
    ].join('\n') : [
      `🗝️ ПОДЗЕМЕЛЬЕ: ${roomTitle}`,
      `📐 Размеры: ${roomSize}`,
      `🏛️ Архитектура: ${roomArchitecture}`,
      '',
      `👁️ Зрение: ${roomSight}`,
      `👂 Слух: ${roomSound}`,
      `👃 Запах: ${roomSmell}`,
      '',
      `🧩 Интерактивный объект: ${roomFeature}`,
      `⚠️ Опасность / Ловушка (Сл ${currentRoom.perceptionDC}): ${roomHazard}`,
      `💎 Находка (Сл ${currentRoom.investigationDC}): ${roomTreasure}`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendRoomToNotes = () => {
    if (!currentRoom || !onSendToNotes) return;
    const text = isEn ? [
      `【 🗝️ Dungeon Chamber: ${roomTitle} 】`,
      `Dimensions: ${roomSize}`,
      `Architecture: ${roomArchitecture}`,
      `Atmosphere: Sight: ${roomSight} | Sound: ${roomSound} | Scent: ${roomSmell}`,
      `Interactive Feature: ${roomFeature}`,
      `Hazard: ${roomHazard}`,
      `Secret (DC ${currentRoom.investigationDC}): ${roomTreasure}`
    ].join('\n') : [
      `【 🗝️ Комната подземелья: ${roomTitle} 】`,
      `Размеры: ${roomSize}`,
      `Архитектура: ${roomArchitecture}`,
      `Атмосфера: Зрение: ${roomSight} | Звук: ${roomSound} | Запах: ${roomSmell}`,
      `Интерактивный объект: ${roomFeature}`,
      `Опасность: ${roomHazard}`,
      `Находка (Сл ${currentRoom.investigationDC}): ${roomTreasure}`
    ].join('\n');
    onSendToNotes(text, roomTitle);
  };

  return (
    <div>
      {/* Шапка подраздела */}
      <div className="generators-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Compass size={26} color="#f2f3f5" />
          <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-title)' }}>
            {t('generators.dungeon.title')}
          </h2>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          {t('generators.dungeon.desc')}
        </p>
      </div>

      {/* Горизонтальная панель фильтров */}
      <div className="generators-toolbar">
        <div className="filters-group">
          <div className="filter-item">
            <label>{t('generators.dungeon.theme')}</label>
            <select 
              value={selectedTheme} 
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="curtain-select filter-select"
            >
              {DUNGEON_THEMES.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {isEn ? (theme.label_en || theme.label) : theme.label}
                </option>
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
            <Dices size={18} /> {t('generators.dungeon.generateBtn')}
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={() => handleGenerate(true)}
            title={isEn ? 'Random dungeon theme' : 'Случайная тема'}
          >
            <RotateCcw size={16} /> {t('generators.actions.fullRandom')}
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
                <h3 className="npc-name">{roomTitle}</h3>
                <div className="npc-meta-row">
                  <span className="npc-tag highlight">{roomThemeLabel}</span>
                  <span className="npc-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                    {roomSize}
                  </span>
                </div>
              </div>

              <div className="npc-actions-box">
                <button 
                  type="button" 
                  className={`trials-btn secondary icon-btn ${isSaved ? 'active' : ''}`}
                  onClick={toggleSaveRoom}
                  title={isSaved ? (isEn ? 'Remove from saved' : 'Удалить из сохраненных') : (isEn ? 'Bookmark chamber' : 'Сохранить комнату')}
                >
                  <Bookmark size={17} color={isSaved ? '#f2f3f5' : 'currentColor'} />
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleSendRoomToNotes}
                  title={isEn ? 'Send chamber description to DM Notes' : 'Отправить комнату в Заметки на Стол'}
                >
                  <FileText size={17} />
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleCopy}
                  title={isEn ? 'Copy chamber description' : 'Скопировать описание'}
                >
                  {copied ? <Check size={17} color="#22c55e" /> : <Copy size={17} />}
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={() => handleGenerate(false)}
                  title={isEn ? 'Reroll chamber' : 'Сгенерировать заново'}
                >
                  <RotateCcw size={17} />
                </button>
              </div>
            </div>

            {/* Архитектура */}
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                <Ruler size={16} /> {isEn ? 'Architecture & Masonry' : 'Архитектура и кладка'}
              </div>
              <p style={{ margin: 0, color: 'var(--text-title)', fontSize: '14px', lineHeight: '1.5' }}>
                {roomArchitecture}
              </p>
            </div>

            {/* Атмосфера 3 чувств */}
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#949ba4" /> {t('generators.dungeon.senses')}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-title)', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                    <Eye size={14} /> {isEn ? 'Sight & Light' : 'Зрение и Свет'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                    {roomSight}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                    <Volume2 size={14} /> {isEn ? 'Sounds & Echo' : 'Звуки и Эхо'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                    {roomSound}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                    <Wind size={14} /> {isEn ? 'Scent & Air' : 'Запах и Воздух'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                    {roomSmell}
                  </div>
                </div>
              </div>
            </div>

            {/* Интерактивный объект и механизм */}
            <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>
                <Puzzle size={17} /> {t('generators.dungeon.feature')}
              </div>
              <p style={{ margin: 0, color: 'var(--text-title)', fontSize: '14px', lineHeight: '1.5' }}>
                {roomFeature}
              </p>
            </div>

            {/* Опасность и Тайник */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                  <AlertTriangle size={16} /> {isEn ? `Trap (Perception DC ${currentRoom.perceptionDC})` : `Ловушка (Внимательность Сл ${currentRoom.perceptionDC})`}
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                  {roomHazard}
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-app)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-title)', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                  <Sparkles size={16} /> {isEn ? `Secret Cache (Investigation DC ${currentRoom.investigationDC})` : `Скрытый тайник (Анализ Сл ${currentRoom.investigationDC})`}
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                  {roomTreasure}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Правая панель: Сохраненные залы */}
        <div className="saved-npcs-sidebar">
          <div className="saved-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={16} color="#949ba4" />
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)' }}>
                {t('generators.dungeon.notepad', { count: savedRooms.length })}
              </h4>
            </div>
            {savedRooms.length > 0 && (
              <button 
                type="button" 
                className="clean-btn" 
                onClick={() => setSavedRooms([])}
                title={t('common.clear')}
              >
                {t('common.clear')}
              </button>
            )}
          </div>

          <p style={{ margin: '4px 0 10px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            {isEn 
              ? 'Save chamber descriptions to build a comprehensive dungeon map.'
              : 'Сохраняйте описания комнат для построения карты приключения.'}
          </p>

          <div className="saved-list">
            {savedRooms.length === 0 ? (
              <div className="saved-empty-state">
                <span>🗝️</span>
                <p>{t('generators.dungeon.notepadEmpty')}</p>
              </div>
            ) : (
              savedRooms.map(item => {
                const sTitle = isEn ? (item.title_en || item.title) : (item.title_ru || item.title);
                const sTheme = isEn ? (item.themeLabel_en || item.themeLabel) : (item.themeLabel_ru || item.themeLabel);
                const sSize = isEn ? (item.size_en || item.size) : (item.size_ru || item.size);
                return (
                  <div 
                    key={item.id} 
                    className={`saved-npc-item ${currentRoom?.id === item.id ? 'active' : ''}`}
                    onClick={() => setCurrentRoom(item)}
                  >
                    <span className="item-icon">🗝️</span>
                    <div className="item-info">
                      <span className="item-name">{sTitle}</span>
                      <span className="item-meta">{sTheme} • {sSize.split('(')[0]}</span>
                    </div>
                    <button 
                      type="button" 
                      className="item-delete-btn" 
                      onClick={(e) => removeSavedRoom(item.id, e)}
                      title={t('common.delete') || 'Удалить'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
