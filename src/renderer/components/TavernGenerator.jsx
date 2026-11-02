import React, { useState, useEffect } from 'react';
import { 
  Beer, 
  Bed, 
  Utensils, 
  User, 
  Sparkles, 
  Bookmark, 
  Copy, 
  Check, 
  Trash2, 
  RotateCcw,
  Volume2,
  Flame,
  MessageSquare,
  AlertTriangle,
  Compass,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  TAVERN_CONCEPTS, 
  TAVERN_KEEPERS, 
  TAVERN_ATMOSPHERES, 
  TAVERN_SPECIALTIES, 
  TAVERN_PATRONS, 
  TAVERN_RUMORS, 
  TAVERN_EVENTS,
  generateTavernName,
  generateRandomTavern 
} from '../data/tavernData.js';

export default function TavernGenerator() {
  const [selectedConcept, setSelectedConcept] = useState('any');
  const [currentTavern, setCurrentTavern] = useState(() => generateRandomTavern());
  const [showStandardMenu, setShowStandardMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Сохранённые таверны (сессионная записная книжка)
  const [savedTaverns, setSavedTaverns] = useState(() => {
    try {
      const saved = localStorage.getItem('dnd_saved_taverns');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dnd_saved_taverns', JSON.stringify(savedTaverns));
    } catch (e) {
      console.warn('Не удалось сохранить таверны в localStorage', e);
    }
  }, [savedTaverns]);

  // Генерация таверны
  const handleGenerate = (forceRandom = false) => {
    const conceptId = forceRandom ? 'any' : selectedConcept;
    if (forceRandom) setSelectedConcept('any');
    const tav = generateRandomTavern({ conceptId });
    setCurrentTavern(tav);
  };

  // Микро-перегенерация полей
  const handleRerollField = (field) => {
    if (!currentTavern) return;
    if (field === 'name') {
      setCurrentTavern({ ...currentTavern, name: generateTavernName() });
    } else if (field === 'keeper') {
      const k = TAVERN_KEEPERS[Math.floor(Math.random() * TAVERN_KEEPERS.length)];
      setCurrentTavern({ ...currentTavern, keeper: k });
    } else if (field === 'specialty') {
      const s = TAVERN_SPECIALTIES[Math.floor(Math.random() * TAVERN_SPECIALTIES.length)];
      setCurrentTavern({ ...currentTavern, specialty: s });
    } else if (field === 'rumor') {
      const r = TAVERN_RUMORS[Math.floor(Math.random() * TAVERN_RUMORS.length)];
      setCurrentTavern({ ...currentTavern, rumor: r });
    } else if (field === 'event') {
      const ev = TAVERN_EVENTS[Math.floor(Math.random() * TAVERN_EVENTS.length)];
      setCurrentTavern({ ...currentTavern, event: ev });
    }
  };

  // Сохранить / удалить из избранного
  const isCurrentSaved = savedTaverns.some(t => t.id === currentTavern?.id);

  const toggleSaveCurrent = () => {
    if (!currentTavern) return;
    if (isCurrentSaved) {
      setSavedTaverns(savedTaverns.filter(t => t.id !== currentTavern.id));
    } else {
      setSavedTaverns([currentTavern, ...savedTaverns]);
    }
  };

  const removeSavedTavern = (id, e) => {
    e.stopPropagation();
    setSavedTaverns(savedTaverns.filter(t => t.id !== id));
  };

  // Копирование в буфер обмена
  const handleCopy = () => {
    if (!currentTavern) return;
    const text = [
      `🍺 Таверна: "${currentTavern.name}" (${currentTavern.concept.name})`,
      `👤 Трактирщик: ${currentTavern.keeper.name} (${currentTavern.keeper.race}, ${currentTavern.keeper.gender})`,
      `   ${currentTavern.keeper.quirk}`,
      `   Отношение: ${currentTavern.keeper.attitude}`,
      `🕯️ Атмосфера: ${currentTavern.atmosphere.visual}`,
      `   Запах: ${currentTavern.atmosphere.smell}`,
      `   Звуки: ${currentTavern.atmosphere.sound}`,
      `🍲 Фирменное блюдо: ${currentTavern.specialty.dish} (${currentTavern.specialty.dishPrice})`,
      `🍺 Фирменная выпивка: ${currentTavern.specialty.drink} (${currentTavern.specialty.drinkPrice})`,
      `👥 Завсегдатаи: ${currentTavern.patrons}`,
      `📜 Слух у стойки: "${currentTavern.rumor}"`,
      `⚡ Событие прямо сейчас: "${currentTavern.event}"`
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div>
      {/* Шапка подраздела */}
      <div className="generators-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Beer size={26} color="var(--accent-gold)" />
          <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-title)' }}>
            Генератор Таверн и Заведений
          </h2>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Создание атмосферных трактиров с меню, комнатами, трактирщиком, завсегдатаями и слухами для вдохновения Мастера.
        </p>
      </div>

      {/* Панель фильтров и генерации */}
      <div className="generators-toolbar">
        <div className="filters-group">
          <div className="filter-item">
            <label>Концепт заведения:</label>
            <select 
              value={selectedConcept} 
              onChange={(e) => setSelectedConcept(e.target.value)}
              className="curtain-select filter-select"
              style={{ minWidth: '240px' }}
            >
              <option value="any">🎲 Любой концепт</option>
              {TAVERN_CONCEPTS.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
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
            <Beer size={18} /> Сгенерировать заведение
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={() => handleGenerate(true)}
            title="Сбросить фильтры и сгенерировать полностью случайную таверну"
          >
            <RotateCcw size={16} /> Полный рандом
          </button>
        </div>
      </div>

      {/* Основная сетка: Карточка таверны слева + Записная книжка справа */}
      <div className="generators-main-layout">
        {currentTavern && (
          <div className="npc-card tavern-card">
            {/* Шапка карточки */}
            <div className="npc-card-header">
              <div className="npc-avatar-box tavern-avatar-box">
                <span style={{ fontSize: '28px' }}>{currentTavern.concept.icon}</span>
              </div>
              <div className="npc-title-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 className="npc-name">«{currentTavern.name}»</h3>
                  <button 
                    type="button" 
                    className="reroll-btn" 
                    onClick={() => handleRerollField('name')} 
                    title="Сменить название"
                  >
                    <RotateCcw size={11} /> Другое имя
                  </button>
                </div>
                <div className="npc-meta-row">
                  <span className="npc-tag highlight">{currentTavern.concept.name}</span>
                </div>
              </div>

              <div className="npc-actions-box">
                <button 
                  type="button" 
                  className={`trials-btn secondary icon-btn ${isCurrentSaved ? 'active' : ''}`}
                  onClick={toggleSaveCurrent}
                  title={isCurrentSaved ? 'Удалить из сохранённых' : 'Сохранить таверну'}
                >
                  <Bookmark size={17} color={isCurrentSaved ? 'var(--accent-gold)' : 'currentColor'} />
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleCopy}
                  title="Скопировать описание в буфер"
                >
                  {copied ? <Check size={17} color="#22c55e" /> : <Copy size={17} />}
                </button>
              </div>
            </div>

            {/* Блок 1: Трактирщик */}
            <div className="npc-section-box">
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} color="var(--accent-gold)" /> Хозяин заведения
                </span>
                <button type="button" className="reroll-btn" onClick={() => handleRerollField('keeper')}>
                  <RotateCcw size={11} /> Другой хозяин
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong style={{ color: 'var(--text-title)', fontSize: '14.5px' }}>
                    {currentTavern.keeper.name}
                  </strong>
                  <span className="npc-tag">{currentTavern.keeper.race} ({currentTavern.keeper.gender})</span>
                </div>
                <div style={{ color: 'var(--text-primary)', lineHeight: '1.45' }}>
                  {currentTavern.keeper.quirk}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderLeft: '2px solid var(--accent-gold)', paddingLeft: '8px', marginTop: '2px' }}>
                  💡 <strong>Отношение к героям:</strong> {currentTavern.keeper.attitude}
                </div>
              </div>
            </div>

            {/* Блок 2: Атмосфера, запахи и обстановка */}
            <div className="npc-section-box">
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={15} color="#f97316" /> Обстановка и атмосфера
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', lineHeight: '1.45' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>🕯️ Вид: </span>
                  <span style={{ color: 'var(--text-primary)' }}>{currentTavern.atmosphere.visual}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>🥖 Запах: </span>
                  <span style={{ color: 'var(--text-primary)' }}>{currentTavern.atmosphere.smell}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>🎶 Звуки: </span>
                  <span style={{ color: 'var(--text-primary)' }}>{currentTavern.atmosphere.sound}</span>
                </div>
              </div>
            </div>

            {/* Блок 3: Меню (Фирменное + Общее меню и Ночлег) */}
            <div className="npc-section-box" style={{ background: 'rgba(234, 179, 8, 0.04)', borderColor: 'rgba(234, 179, 8, 0.2)' }}>
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Utensils size={15} color="var(--accent-gold)" /> Кухня, выпивка и комнаты
                </span>
                <button type="button" className="reroll-btn" onClick={() => handleRerollField('specialty')}>
                  <RotateCcw size={11} /> Другое фирменное
                </button>
              </div>

              {/* Фирменные угощения */}
              <div className="tavern-specialties-grid">
                <div className="tavern-specialty-card">
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    🍺 Фирменная выпивка
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '3px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-title)' }}>
                      {currentTavern.specialty.drink}
                    </span>
                    <span className="price-tag">{currentTavern.specialty.drinkPrice}</span>
                  </div>
                </div>

                <div className="tavern-specialty-card">
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    🍲 Фирменное блюдо
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '3px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-title)' }}>
                      {currentTavern.specialty.dish}
                    </span>
                    <span className="price-tag">{currentTavern.specialty.dishPrice}</span>
                  </div>
                </div>
              </div>

              {currentTavern.specialty.note && (
                <div style={{ fontSize: '11.5px', color: '#fde68a', fontStyle: 'italic', marginTop: '6px' }}>
                  ✨ {currentTavern.specialty.note}
                </div>
              )}

              {/* Ночлег / Комнаты по уровню комфорта */}
              <div style={{ marginTop: '10px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Bed size={13} /> Ночлег (по уровню комфорта D&D 5e):
                </span>
                <div className="tavern-rooms-grid">
                  {currentTavern.rooms.map((room, i) => (
                    <div key={i} className="tavern-room-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-title)', fontSize: '12px' }}>
                          {room.tier}
                        </span>
                        <span className="room-price-badge">{room.price}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {room.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Спойлер: Общее меню D&D 5e */}
              <div style={{ marginTop: '12px' }}>
                <button 
                  type="button" 
                  className="clean-btn"
                  onClick={() => setShowStandardMenu(!showStandardMenu)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '4px 0' }}
                >
                  {showStandardMenu ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>{showStandardMenu ? 'Скрыть стандартное меню D&D 5e' : 'Показать стандартное меню D&D 5e (хлеб, эль, рагу)'}</span>
                </button>

                {showStandardMenu && (
                  <div className="tavern-std-menu-grid">
                    {currentTavern.standardMenu.map((item, i) => (
                      <div key={i} className="std-menu-row">
                        <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                        <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>{item.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Блок 4: Завсегдатаи */}
            <div className="npc-section-box">
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Compass size={15} color="#38bdf8" /> Завсегдатаи прямо сейчас
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.45' }}>
                {currentTavern.patrons}
              </p>
            </div>

            {/* Блок 5: Слух у стойки (сюжетная зацепка) */}
            <div className="npc-section-box" style={{ background: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.25)' }}>
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                  <MessageSquare size={15} color="#38bdf8" /> Слух у барной стойки
                </span>
                <button type="button" className="reroll-btn" onClick={() => handleRerollField('rumor')}>
                  <RotateCcw size={11} /> Другой слух
                </button>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.45', fontStyle: 'italic' }}>
                «{currentTavern.rumor}»
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                💡 Зацепка для квеста: вклинивай в разговор, если игроки решат завести беседу с местными.
              </span>
            </div>

            {/* Блок 6: Внезапное происшествие прямо сейчас */}
            <div className="npc-section-box" style={{ background: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.25)' }}>
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f43f5e' }}>
                  <AlertTriangle size={15} color="#f43f5e" /> Происшествие (если заскучали)
                </span>
                <button type="button" className="reroll-btn" onClick={() => handleRerollField('event')}>
                  <RotateCcw size={11} /> Другое событие
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.45' }}>
                {currentTavern.event}
              </p>
            </div>

            {/* Быстрые микро-кнопки перегенерации */}
            <div className="npc-micro-rerolls">
              <button type="button" className="micro-btn" onClick={() => handleRerollField('name')}>
                🔄 Название
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('keeper')}>
                👤 Трактирщик
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('specialty')}>
                🍲 Угощения
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('rumor')}>
                📜 Слух
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('event')}>
                ⚡ Происшествие
              </button>
            </div>
          </div>
        )}

        {/* Правая панель: Сохраненные таверны */}
        <div className="saved-npcs-sidebar">
          <div className="saved-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={16} color="var(--accent-gold)" />
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)' }}>
                Записная книжка ({savedTaverns.length})
              </h4>
            </div>
            {savedTaverns.length > 0 && (
              <button 
                type="button" 
                className="clean-btn" 
                onClick={() => setSavedTaverns([])}
                title="Очистить список"
              >
                Очистить
              </button>
            )}
          </div>

          <p style={{ margin: '4px 0 10px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            Сохраняйте заведения, где побывала партия, чтобы быстро вернуться к их ценам, хозяину и атмосфере.
          </p>

          <div className="saved-list">
            {savedTaverns.length === 0 ? (
              <div className="saved-empty-state">
                <span>🍺</span>
                <p>Нажмите закладку на карточке заведения, чтобы сохранить его в кампанию.</p>
              </div>
            ) : (
              savedTaverns.map(item => (
                <div 
                  key={item.id} 
                  className={`saved-npc-item ${currentTavern?.id === item.id ? 'active' : ''}`}
                  onClick={() => setCurrentTavern(item)}
                >
                  <span className="item-icon">{item.concept.icon}</span>
                  <div className="item-info">
                    <span className="item-name">«{item.name}»</span>
                    <span className="item-meta">{item.concept.name} • {item.keeper.name}</span>
                  </div>
                  <button 
                    type="button" 
                    className="item-delete-btn" 
                    onClick={(e) => removeSavedTavern(item.id, e)}
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
