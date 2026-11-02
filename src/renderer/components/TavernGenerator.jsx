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
  MapPin,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  TAVERN_CONCEPTS, 
  TAVERN_REGIONS,
  TAVERN_KEEPERS, 
  TAVERN_ATMOSPHERES, 
  TAVERN_PATRONS, 
  TAVERN_RUMORS, 
  TAVERN_EVENTS,
  generateTavernName,
  generateRandomTavern 
} from '../data/tavernData.js';

export default function TavernGenerator() {
  const [selectedConcept, setSelectedConcept] = useState('any');
  const [selectedRegion, setSelectedRegion] = useState('any');
  const [currentTavern, setCurrentTavern] = useState(() => generateRandomTavern());
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
    const regionId = forceRandom ? 'any' : selectedRegion;
    if (forceRandom) {
      setSelectedConcept('any');
      setSelectedRegion('any');
    }
    const tav = generateRandomTavern({ conceptId, regionId });
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
    } else if (field === 'menu') {
      // Случайный другой регион и его меню
      const r = TAVERN_REGIONS[Math.floor(Math.random() * TAVERN_REGIONS.length)];
      setCurrentTavern({
        ...currentTavern,
        region: r,
        menu: {
          specialDrink: r.specialDrink,
          specialDish: r.specialDish,
          exoticDish: r.exoticDish,
          items: r.menuItems
        }
      });
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
      `🗺️ Регион: ${currentTavern.region.icon} ${currentTavern.region.name}`,
      `👤 Трактирщик: ${currentTavern.keeper.name} (${currentTavern.keeper.race}, ${currentTavern.keeper.gender})`,
      `   ${currentTavern.keeper.quirk}`,
      `   Отношение: ${currentTavern.keeper.attitude}`,
      `🕯️ Атмосфера: ${currentTavern.atmosphere.visual}`,
      `   Запах: ${currentTavern.atmosphere.smell}`,
      `   Звуки: ${currentTavern.atmosphere.sound}`,
      `🍲 Меню кухни (${currentTavern.region.name}):`,
      `   - Фирменное: ${currentTavern.menu.specialDish.name} (${currentTavern.menu.specialDish.price})`,
      `   - Выпивка: ${currentTavern.menu.specialDrink.name} (${currentTavern.menu.specialDrink.price})`,
      `   - Экзотика: ${currentTavern.menu.exoticDish.name} (${currentTavern.menu.exoticDish.price})`,
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
          Создание атмосферных трактиров с региональным колоритным меню, экзотическими блюдами, ночлегом и слухами.
        </p>
      </div>

      {/* Панель фильтров и генерации */}
      <div className="generators-toolbar">
        <div className="filters-group">
          {/* Концепт заведения */}
          <div className="filter-item">
            <label>Концепт заведения:</label>
            <select 
              value={selectedConcept} 
              onChange={(e) => setSelectedConcept(e.target.value)}
              className="curtain-select filter-select"
              style={{ minWidth: '210px' }}
            >
              <option value="any">🎲 Любой концепт</option>
              {TAVERN_CONCEPTS.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          {/* Регион / Биом */}
          <div className="filter-item">
            <label>Тип региона (колорит кухни):</label>
            <select 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="curtain-select filter-select"
              style={{ minWidth: '220px' }}
            >
              <option value="any">🎲 Любой регион</option>
              {TAVERN_REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
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
                  <span className="npc-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                    {currentTavern.region.icon} {currentTavern.region.name}
                  </span>
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

            {/* Блок 3: ПОЛНОЦЕННОЕ РЕГИОНАЛЬНОЕ МЕНЮ КУХНИ */}
            <div className="npc-section-box tavern-menu-box" style={{ background: 'rgba(234, 179, 8, 0.04)', borderColor: 'rgba(234, 179, 8, 0.25)' }}>
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Utensils size={15} color="var(--accent-gold)" /> Трактирное меню: {currentTavern.region.name}
                </span>
                <button type="button" className="reroll-btn" onClick={() => handleRerollField('menu')}>
                  <RotateCcw size={11} /> Другая кухня / регион
                </button>
              </div>

              {/* 1. Фирменные угощения */}
              <div className="tavern-specialties-grid">
                <div className="tavern-specialty-card">
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    🍺 Фирменная выпивка
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '3px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-title)', fontSize: '13px' }}>
                      {currentTavern.menu.specialDrink.name}
                    </span>
                    <span className="price-tag">{currentTavern.menu.specialDrink.price}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {currentTavern.menu.specialDrink.note}
                  </span>
                </div>

                <div className="tavern-specialty-card">
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    🍲 Фирменное блюдо
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '3px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-title)', fontSize: '13px' }}>
                      {currentTavern.menu.specialDish.name}
                    </span>
                    <span className="price-tag">{currentTavern.menu.specialDish.price}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {currentTavern.menu.specialDish.note}
                  </span>
                </div>
              </div>

              {/* 2. Экзотический деликатес региона */}
              <div className="tavern-exotic-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#fde68a' }}>
                    {currentTavern.menu.exoticDish.name}
                  </span>
                  <span className="price-tag" style={{ background: 'rgba(245, 158, 11, 0.25)', borderColor: '#f59e0b', color: '#fde68a' }}>
                    {currentTavern.menu.exoticDish.price}
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {currentTavern.menu.exoticDish.note}
                </div>
              </div>

              {/* 3. Список других блюд и напитков региона */}
              <div style={{ marginTop: '10px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  📋 Другие угощения в меню:
                </span>
                <div className="tavern-std-menu-grid" style={{ marginTop: '6px' }}>
                  {currentTavern.menu.items.map((item, i) => (
                    <div key={i} className="std-menu-row">
                      <span style={{ color: 'var(--text-primary)' }}>
                        {item.type === 'drink' ? '🍺 ' : '🥣 '}
                        {item.name}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Блок 4: ОТДЕЛЬНЫЙ НОЧЛЕГ И ПОСТОЙ */}
            <div className="npc-section-box" style={{ background: 'rgba(56, 189, 248, 0.04)', borderColor: 'rgba(56, 189, 248, 0.25)' }}>
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                  <Bed size={15} color="#38bdf8" /> Ночлег и постой (уровни комфорта D&D 5e)
                </span>
              </div>

              <div className="tavern-rooms-grid">
                {currentTavern.rooms.map((room, i) => (
                  <div key={i} className="tavern-room-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-title)', fontSize: '12px' }}>
                        {room.tier}
                      </span>
                      <span className="room-price-badge">{room.price}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: '1.35' }}>
                      {room.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Блок 5: Завсегдатаи */}
            <div className="npc-section-box">
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Compass size={15} color="#a855f7" /> Завсегдатаи прямо сейчас
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.45' }}>
                {currentTavern.patrons}
              </p>
            </div>

            {/* Блок 6: Слух у стойки (сюжетная зацепка) */}
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
                💡 Зацепка для квеста: вклинивай в разговор, если игроки решат поболтать с завсегдатаями.
              </span>
            </div>

            {/* Блок 7: Внезапное происшествие прямо сейчас */}
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
              <button type="button" className="micro-btn" onClick={() => handleRerollField('menu')}>
                🍲 Меню / Регион
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
                    <span className="item-meta">{item.region?.name || item.concept.name} • {item.keeper.name}</span>
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
