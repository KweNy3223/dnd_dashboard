import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext.jsx';
import { 
  Beer, 
  Bed, 
  Utensils, 
  User, 
  Bookmark, 
  Copy, 
  Check, 
  Trash2, 
  RotateCcw,
  Flame,
  MessageSquare,
  AlertTriangle,
  Compass,
  Wine,
  Dices
} from 'lucide-react';
import { 
  TAVERN_CONCEPTS, 
  TAVERN_REGIONS, 
  TAVERN_KEEPERS, 
  TAVERN_ATMOSPHERES, 
  TAVERN_PATRONS, 
  TAVERN_RUMORS, 
  TAVERN_EVENTS,
  TAVERN_ROOM_TIERS,
  generateTavernName,
  generateRandomTavern 
} from '../data/tavernData.js';
import {
  TAVERN_KEEPERS_EN,
  TAVERN_ATMOSPHERES_EN,
  TAVERN_ROOM_TIERS_EN,
  TAVERN_PATRONS_EN,
  TAVERN_RUMORS_EN,
  TAVERN_EVENTS_EN,
  REGIONAL_MENUS_EN
} from '../data/tavernDataEn.js';

export default function TavernGenerator() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const [selectedConcept, setSelectedConcept] = useState('any');
  const [selectedRegion, setSelectedRegion] = useState('any');
  const [currentTavern, setCurrentTavern] = useState(() => {
    try {
      const cached = localStorage.getItem('dnd_active_tavern');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.name_en && parsed.patrons_en && parsed.keeper_en) {
          return parsed;
        }
      }
      return generateRandomTavern({ language });
    } catch {
      return generateRandomTavern({ language });
    }
  });
  const [copied, setCopied] = useState(false);

  // Обновление локализованных полей при смене языка
  useEffect(() => {
    if (!currentTavern || !currentTavern.name_en || !currentTavern.patrons_en || !currentTavern.keeper_en) {
      const updated = generateRandomTavern({
        conceptId: currentTavern?.concept?.id || selectedConcept,
        regionId: currentTavern?.region?.id || selectedRegion,
        language
      });
      setCurrentTavern(updated);
    }
  }, [language]);

  // Кеширование активной таверны
  useEffect(() => {
    if (currentTavern) {
      try {
        localStorage.setItem('dnd_active_tavern', JSON.stringify(currentTavern));
      } catch (e) {
        console.warn('Не удалось закешировать активную таверну', e);
      }
    }
  }, [currentTavern]);

  // Спасброски Телосложения
  const [conRolls, setConRolls] = useState({});

  const handleRollCon = (itemKey, dc) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const isPass = roll >= dc;
    setConRolls(prev => ({
      ...prev,
      [`${currentTavern?.id || 'tav'}_${itemKey}`]: { roll, isPass }
    }));
  };

  const renderConCheck = (conCheck, itemKey) => {
    if (!conCheck) return null;
    const outcome = conRolls[`${currentTavern?.id || 'tav'}_${itemKey}`];

    return (
      <div className="con-check-box">
        <div className="con-check-header">
          <span className="con-check-badge">
            🎲 {conCheck.label}
          </span>
          <button 
            type="button" 
            className="con-roll-btn"
            onClick={() => handleRollCon(itemKey, conCheck.dc)}
            title={isEn ? "Roll d20 Constitution check" : "Сделать бросок d20 на Телосложение"}
          >
            <Dices size={12} /> {t('generators.taverns.rollCon')}
          </button>
        </div>

        {outcome && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span className={`con-roll-outcome ${outcome.isPass ? 'pass' : 'fail'}`}>
              d20: {outcome.roll} — {outcome.isPass ? t('generators.taverns.pass') : t('generators.taverns.fail')} ({isEn ? 'DC' : 'Сл'} {conCheck.dc})
            </span>
          </div>
        )}

        <div className="con-check-desc-row">
          <div className="con-check-pass">
            <strong>✅ {t('generators.taverns.conSuccess')}</strong> {conCheck.onPass}
          </div>
          <div className="con-check-fail">
            <strong>❌ {t('generators.taverns.conFail')}</strong> {conCheck.onFail}
          </div>
        </div>
      </div>
    );
  };

  // Сохранённые таверны
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
    const tav = generateRandomTavern({ conceptId, regionId, language });
    setCurrentTavern(tav);
  };

  // Микро-перегенерация полей
  const handleRerollField = (field) => {
    if (!currentTavern) return;
    if (field === 'name') {
      const nameRu = generateTavernName(false);
      const nameEn = generateTavernName(true);
      setCurrentTavern({
        ...currentTavern,
        name: isEn ? nameEn : nameRu,
        name_ru: nameRu,
        name_en: nameEn
      });
    } else if (field === 'keeper') {
      const kIdx = Math.floor(Math.random() * TAVERN_KEEPERS.length);
      const kRu = TAVERN_KEEPERS[kIdx];
      const kEn = TAVERN_KEEPERS_EN[kIdx] || kRu;
      setCurrentTavern({
        ...currentTavern,
        keeperIdx: kIdx,
        keeper: isEn ? kEn : kRu,
        keeper_ru: kRu,
        keeper_en: kEn
      });
    } else if (field === 'menu') {
      const r = TAVERN_REGIONS[Math.floor(Math.random() * TAVERN_REGIONS.length)];
      const regEn = REGIONAL_MENUS_EN[r.id] || {};
      const menuRu = { food: r.food, drinks: r.drinks };
      const menuEn = { food: regEn.food || r.food, drinks: regEn.drinks || r.drinks };
      setCurrentTavern({
        ...currentTavern,
        region: {
          ...r,
          name: isEn ? (r.name_en || r.name) : r.name,
          name_ru: r.name,
          name_en: r.name_en || r.name
        },
        menu: isEn ? menuEn : menuRu,
        menu_ru: menuRu,
        menu_en: menuEn
      });
    } else if (field === 'rumor') {
      const rIdx = Math.floor(Math.random() * TAVERN_RUMORS.length);
      const rRu = TAVERN_RUMORS[rIdx];
      const rEn = TAVERN_RUMORS_EN[rIdx] || rRu;
      setCurrentTavern({
        ...currentTavern,
        rumor: isEn ? rEn : rRu,
        rumor_ru: rRu,
        rumor_en: rEn
      });
    } else if (field === 'event') {
      const evIdx = Math.floor(Math.random() * TAVERN_EVENTS.length);
      const evRu = TAVERN_EVENTS[evIdx];
      const evEn = TAVERN_EVENTS_EN[evIdx] || evRu;
      setCurrentTavern({
        ...currentTavern,
        event: isEn ? evEn : evRu,
        event_ru: evRu,
        event_en: evEn
      });
    }
  };

  // Сохранить / удалить
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

  // Получение локализованных данных
  const tavName = isEn ? (currentTavern?.name_en || currentTavern?.name) : (currentTavern?.name_ru || currentTavern?.name);
  const tavConceptName = isEn ? (currentTavern?.concept?.name_en || currentTavern?.concept?.name) : (currentTavern?.concept?.name_ru || currentTavern?.concept?.name);
  const tavRegionName = isEn ? (currentTavern?.region?.name_en || currentTavern?.region?.name) : (currentTavern?.region?.name_ru || currentTavern?.region?.name);
  const tavKeeper = isEn ? (currentTavern?.keeper_en || currentTavern?.keeper) : (currentTavern?.keeper_ru || currentTavern?.keeper);
  const tavAtmosphere = isEn ? (currentTavern?.atmosphere_en || currentTavern?.atmosphere) : (currentTavern?.atmosphere_ru || currentTavern?.atmosphere);
  const tavMenu = isEn ? (currentTavern?.menu_en || currentTavern?.menu) : (currentTavern?.menu_ru || currentTavern?.menu);
  const tavRooms = isEn ? (currentTavern?.rooms_en || TAVERN_ROOM_TIERS_EN) : (currentTavern?.rooms_ru || TAVERN_ROOM_TIERS);
  const tavPatrons = isEn ? (currentTavern?.patrons_en || currentTavern?.patrons) : (currentTavern?.patrons_ru || currentTavern?.patrons);
  const tavRumor = isEn ? (currentTavern?.rumor_en || currentTavern?.rumor) : (currentTavern?.rumor_ru || currentTavern?.rumor);
  const tavEvent = isEn ? (currentTavern?.event_en || currentTavern?.event) : (currentTavern?.event_ru || currentTavern?.event);

  // Копирование в буфер
  const handleCopy = () => {
    if (!currentTavern) return;
    const text = isEn ? [
      `🍺 TAVERN: "${tavName}" (${tavConceptName})`,
      `📍 Region: ${tavRegionName}`,
      `👤 Keeper: ${tavKeeper?.name} (${tavKeeper?.race}, ${tavKeeper?.gender}) — ${tavKeeper?.quirk}`,
      `🕯️ Ambience: ${tavAtmosphere?.visual}`,
      `🥖 Scent: ${tavAtmosphere?.smell} | Sounds: ${tavAtmosphere?.sound}`,
      `⭐ Specialty: ${tavMenu?.food?.signature?.name} (${tavMenu?.food?.signature?.price})`,
      `🍷 House Drink: ${tavMenu?.drinks?.signature?.name} (${tavMenu?.drinks?.signature?.price})`,
      `📜 Rumor: "${tavRumor}"`,
      `⚡ Sudden Event: ${tavEvent}`
    ].join('\n') : [
      `🍺 ТАВЕРНА: «${tavName}» (${tavConceptName})`,
      `📍 Регион: ${tavRegionName}`,
      `👤 Хозяин: ${tavKeeper?.name} (${tavKeeper?.race}, ${tavKeeper?.gender}) — ${tavKeeper?.quirk}`,
      `🕯️ Вид: ${tavAtmosphere?.visual}`,
      `🥖 Запах: ${tavAtmosphere?.smell} | Звуки: ${tavAtmosphere?.sound}`,
      `⭐ Фирменное блюдо: ${tavMenu?.food?.signature?.name} (${tavMenu?.food?.signature?.price})`,
      `🍷 Выпивка: ${tavMenu?.drinks?.signature?.name} (${tavMenu?.drinks?.signature?.price})`,
      `📜 Слух: «${tavRumor}»`,
      `⚡ Происшествие: ${tavEvent}`
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const { food, drinks } = tavMenu || {};

  return (
    <div>
      {/* Шапка подраздела */}
      <div className="generators-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Beer size={26} color="#f2f3f5" />
          <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-title)' }}>
            {t('generators.taverns.title')}
          </h2>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          {t('generators.taverns.desc')}
        </p>
      </div>

      {/* Панель фильтров и генерации */}
      <div className="generators-toolbar">
        <div className="filters-group">
          {/* Концепт заведения */}
          <div className="filter-item">
            <label>{t('generators.taverns.concept')}</label>
            <select 
              value={selectedConcept} 
              onChange={(e) => setSelectedConcept(e.target.value)}
              className="curtain-select filter-select"
              style={{ minWidth: '210px' }}
            >
              <option value="any">🎲 {t('generators.taverns.anyConcept')}</option>
              {TAVERN_CONCEPTS.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {isEn ? (c.name_en || c.name) : c.name}</option>
              ))}
            </select>
          </div>

          {/* Регион / Биом */}
          <div className="filter-item">
            <label>{t('generators.taverns.region')}</label>
            <select 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="curtain-select filter-select"
              style={{ minWidth: '220px' }}
            >
              <option value="any">🎲 {t('generators.taverns.anyRegion')}</option>
              {TAVERN_REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.icon} {isEn ? (r.name_en || r.name) : r.name}</option>
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
            <Beer size={18} /> {t('generators.taverns.generateBtn')}
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={() => handleGenerate(true)}
            title={isEn ? "Reset filters and generate completely random tavern" : "Сбросить фильтры и сгенерировать полностью случайную таверну"}
          >
            <RotateCcw size={16} /> {t('generators.actions.fullRandom')}
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
                  <h3 className="npc-name">«{tavName}»</h3>
                  <button 
                    type="button" 
                    className="reroll-btn" 
                    onClick={() => handleRerollField('name')} 
                    title={t('generators.actions.anotherName')}
                  >
                    <RotateCcw size={11} /> {t('generators.actions.anotherName')}
                  </button>
                </div>
                <div className="npc-meta-row">
                  <span className="npc-tag highlight">{tavConceptName}</span>
                  <span className="npc-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                    {currentTavern.region.icon} {tavRegionName}
                  </span>
                </div>
              </div>

              <div className="npc-actions-box">
                <button 
                  type="button" 
                  className={`trials-btn secondary icon-btn ${isCurrentSaved ? 'active' : ''}`}
                  onClick={toggleSaveCurrent}
                  title={isCurrentSaved ? (isEn ? 'Remove from saved' : 'Удалить из сохранённых') : (isEn ? 'Save tavern' : 'Сохранить таверну')}
                >
                  <Bookmark size={17} color={isCurrentSaved ? '#f2f3f5' : 'currentColor'} />
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleCopy}
                  title={isEn ? 'Copy description to clipboard' : 'Скопировать описание в буфер'}
                >
                  {copied ? <Check size={17} color="#22c55e" /> : <Copy size={17} />}
                </button>
              </div>
            </div>

            {/* Блок 1: Трактирщик */}
            <div className="npc-section-box">
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} color="#949ba4" /> {t('generators.taverns.keeper')}
                </span>
                <button type="button" className="reroll-btn" onClick={() => handleRerollField('keeper')}>
                  <RotateCcw size={11} /> {t('generators.actions.anotherKeeper')}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong style={{ color: 'var(--text-title)', fontSize: '14.5px' }}>
                    {tavKeeper?.name}
                  </strong>
                  <span className="npc-tag">{tavKeeper?.race} ({tavKeeper?.gender})</span>
                </div>
                <div style={{ color: 'var(--text-primary)', lineHeight: '1.45' }}>
                  {tavKeeper?.quirk}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderLeft: '2px solid rgba(255, 255, 255, 0.25)', paddingLeft: '8px', marginTop: '2px' }}>
                  💡 <strong>{t('generators.taverns.attitude')}</strong> {tavKeeper?.attitude}
                </div>
              </div>
            </div>

            {/* Блок 2: Атмосфера, запахи и обстановка */}
            <div className="npc-section-box">
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={15} color="#f97316" /> {t('generators.taverns.atmosphere')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', lineHeight: '1.45' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>🕯️ {t('generators.taverns.sight')} </span>
                  <span style={{ color: 'var(--text-primary)' }}>{tavAtmosphere?.visual}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>🥖 {t('generators.taverns.smell')} </span>
                  <span style={{ color: 'var(--text-primary)' }}>{tavAtmosphere?.smell}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>🎶 {t('generators.taverns.sounds')} </span>
                  <span style={{ color: 'var(--text-primary)' }}>{tavAtmosphere?.sound}</span>
                </div>
              </div>
            </div>

            {/* Блок 3: ПОЛНОЦЕННОЕ РАЗДЕЛЬНОЕ МЕНЮ КУХНИ И ВЫПИВКИ */}
            <div className="npc-section-box tavern-menu-box" style={{ background: 'rgba(234, 179, 8, 0.03)', borderColor: 'rgba(234, 179, 8, 0.25)' }}>
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Utensils size={15} color="#949ba4" /> {t('generators.taverns.menuTitle', { region: tavRegionName })}
                </span>
                <button type="button" className="reroll-btn" onClick={() => handleRerollField('menu')}>
                  <RotateCcw size={11} /> {t('generators.actions.anotherMenu')}
                </button>
              </div>

              {/* Две отдельные колонки: Кухня и Погреб */}
              <div className="tavern-menus-layout">
                
                {/* КОЛОНКА 1: КУХНЯ И БЛЮДА */}
                <div className="tavern-menu-col">
                  <div className="menu-col-header">
                    <span className="menu-col-title" style={{ color: 'var(--text-title)' }}>
                      <Utensils size={14} /> {t('generators.taverns.foodCol')}
                    </span>
                  </div>

                  {/* 1.1 Фирменное блюдо шефа */}
                  {food?.signature && (
                    <div className="menu-highlight-card">
                      <div className="menu-badge-label" style={{ color: 'var(--text-muted)' }}>
                        ⭐ {t('generators.taverns.signatureDish')}
                      </div>
                      <div className="menu-highlight-title-row">
                        <span className="menu-highlight-title">
                          {food.signature.name}
                        </span>
                        <span className="price-tag">{food.signature.price}</span>
                      </div>
                      <div className="menu-highlight-desc">
                        {food.signature.desc}
                      </div>
                      {renderConCheck(food.signature.conCheck, 'food_signature')}
                    </div>
                  )}

                  {/* 1.2 Экзотический деликатес региона */}
                  {food?.exotic && (
                    <div className="menu-highlight-card exotic">
                      <div className="menu-badge-label" style={{ color: '#c084fc' }}>
                        🌟 {t('generators.taverns.exoticDish')}
                      </div>
                      <div className="menu-highlight-title-row">
                        <span className="menu-highlight-title" style={{ color: '#f3e8ff' }}>
                          {food.exotic.name}
                        </span>
                        <span className="price-tag" style={{ background: 'rgba(168, 85, 247, 0.2)', borderColor: '#a855f7', color: '#f3e8ff' }}>
                          {food.exotic.price}
                        </span>
                      </div>
                      <div className="menu-highlight-desc" style={{ color: '#e9d5ff' }}>
                        {food.exotic.desc}
                      </div>
                      {renderConCheck(food.exotic.conCheck, 'food_exotic')}
                    </div>
                  )}

                  {/* 1.3 Обычные блюда кухни */}
                  <div className="menu-items-list">
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>
                      🥣 {t('generators.taverns.dishes')}
                    </span>
                    {food?.dishes?.map((dish, i) => (
                      <div key={i} className="menu-item-card">
                        <div className="menu-item-top">
                          <span className="menu-item-name">{dish.name}</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-title)', fontSize: '12px' }}>
                            {dish.price}
                          </span>
                        </div>
                        <div className="menu-item-desc">{dish.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* КОЛОНКА 2: ПОГРЕБ И ВЫПИВКА */}
                <div className="tavern-menu-col">
                  <div className="menu-col-header">
                    <span className="menu-col-title" style={{ color: '#38bdf8' }}>
                      <Beer size={14} /> {t('generators.taverns.drinksCol')}
                    </span>
                  </div>

                  {/* 2.1 Фирменная выпивка таверны */}
                  {drinks?.signature && (
                    <div className="menu-highlight-card" style={{ borderLeftColor: '#38bdf8', background: 'rgba(56, 189, 248, 0.07)', borderColor: 'rgba(56, 189, 248, 0.35)' }}>
                      <div className="menu-badge-label" style={{ color: '#38bdf8' }}>
                        ⭐ {t('generators.taverns.signatureDrink')}
                      </div>
                      <div className="menu-highlight-title-row">
                        <span className="menu-highlight-title">
                          {drinks.signature.name}
                        </span>
                        <span className="price-tag" style={{ background: 'rgba(56, 189, 248, 0.2)', borderColor: '#38bdf8', color: '#e0f2fe' }}>
                          {drinks.signature.price}
                        </span>
                      </div>
                      <div className="menu-highlight-desc">
                        {drinks.signature.desc}
                      </div>
                      {renderConCheck(drinks.signature.conCheck, 'drinks_signature')}
                    </div>
                  )}

                  {/* 2.2 Редкое / Особое пойло */}
                  {drinks?.special && (
                    <div className="menu-highlight-card special">
                      <div className="menu-badge-label" style={{ color: '#f87171' }}>
                        🍷 {t('generators.taverns.specialDrink')}
                      </div>
                      <div className="menu-highlight-title-row">
                        <span className="menu-highlight-title" style={{ color: '#fee2e2' }}>
                          {drinks.special.name}
                        </span>
                        <span className="price-tag" style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444', color: '#fee2e2' }}>
                          {drinks.special.price}
                        </span>
                      </div>
                      <div className="menu-highlight-desc" style={{ color: '#fecaca' }}>
                        {drinks.special.desc}
                      </div>
                      {renderConCheck(drinks.special.conCheck, 'drinks_special')}
                    </div>
                  )}

                  {/* 2.3 Обычные напитки погреба */}
                  <div className="menu-items-list">
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>
                      🍺 {t('generators.taverns.drinks')}
                    </span>
                    {drinks?.items?.map((drink, i) => (
                      <div key={i} className="menu-item-card">
                        <div className="menu-item-top">
                          <span className="menu-item-name">{drink.name}</span>
                          <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '12px' }}>
                            {drink.price}
                          </span>
                        </div>
                        <div className="menu-item-desc">{drink.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Блок 4: ОТДЕЛЬНЫЙ НОЧЛЕГ И ПОСТОЙ */}
            <div className="npc-section-box" style={{ background: 'rgba(56, 189, 248, 0.04)', borderColor: 'rgba(56, 189, 248, 0.25)' }}>
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                  <Bed size={15} color="#38bdf8" /> {t('generators.taverns.lodging')}
                </span>
              </div>

              <div className="tavern-rooms-grid">
                {tavRooms?.map((room, i) => (
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
                  <Compass size={15} color="#a855f7" /> {t('generators.taverns.patrons')}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.45' }}>
                {tavPatrons}
              </p>
            </div>

            {/* Блок 6: Слух у стойки (сюжетная зацепка) */}
            <div className="npc-section-box" style={{ background: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.25)' }}>
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                  <MessageSquare size={15} color="#38bdf8" /> {t('generators.taverns.rumor')}
                </span>
                <button type="button" className="reroll-btn" onClick={() => handleRerollField('rumor')}>
                  <RotateCcw size={11} /> {t('generators.actions.anotherRumor')}
                </button>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.45', fontStyle: 'italic' }}>
                «{tavRumor}»
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                💡 {t('generators.taverns.rumorHint')}
              </span>
            </div>

            {/* Блок 7: Внезапное происшествие прямо сейчас */}
            <div className="npc-section-box" style={{ background: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.25)' }}>
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f43f5e' }}>
                  <AlertTriangle size={15} color="#f43f5e" /> {t('generators.taverns.event')}
                </span>
                <button type="button" className="reroll-btn" onClick={() => handleRerollField('event')}>
                  <RotateCcw size={11} /> {t('generators.actions.anotherEvent')}
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.45' }}>
                {tavEvent}
              </p>
            </div>

            {/* Быстрые микро-кнопки перегенерации */}
            <div className="npc-micro-rerolls">
              <button type="button" className="micro-btn" onClick={() => handleRerollField('name')}>
                🔄 {t('generators.taverns.microName')}
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('keeper')}>
                👤 {t('generators.taverns.microKeeper')}
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('menu')}>
                🍲 {t('generators.taverns.microMenu')}
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('rumor')}>
                📜 {t('generators.taverns.microRumor')}
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('event')}>
                ⚡ {t('generators.taverns.microEvent')}
              </button>
            </div>
          </div>
        )}

        {/* Правая панель: Сохраненные таверны */}
        <div className="saved-npcs-sidebar">
          <div className="saved-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={16} color="#949ba4" />
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)' }}>
                {t('generators.taverns.notepad', { count: savedTaverns.length })}
              </h4>
            </div>
            {savedTaverns.length > 0 && (
              <button 
                type="button" 
                className="clean-btn" 
                onClick={() => setSavedTaverns([])}
                title={t('generators.actions.clear')}
              >
                {t('generators.actions.clear')}
              </button>
            )}
          </div>

          <p style={{ margin: '4px 0 10px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            {t('generators.taverns.notepadDesc')}
          </p>

          <div className="saved-list">
            {savedTaverns.length === 0 ? (
              <div className="saved-empty-state">
                <span>🍺</span>
                <p>{t('generators.taverns.notepadEmpty')}</p>
              </div>
            ) : (
              savedTaverns.map(item => {
                const sName = isEn ? (item.name_en || item.name) : (item.name_ru || item.name);
                const sConcept = isEn ? (item.concept?.name_en || item.concept?.name) : (item.concept?.name_ru || item.concept?.name);
                const sRegion = isEn ? (item.region?.name_en || item.region?.name) : (item.region?.name_ru || item.region?.name);
                return (
                  <div 
                    key={item.id} 
                    className={`saved-npc-item ${currentTavern?.id === item.id ? 'active' : ''}`}
                    onClick={() => setCurrentTavern(item)}
                  >
                    <span className="item-icon">{item.concept.icon}</span>
                    <div className="item-info">
                      <span className="item-name">«{sName}»</span>
                      <span className="item-meta">{sConcept} • {sRegion}</span>
                    </div>
                    <button 
                      type="button" 
                      className="item-delete-btn" 
                      onClick={(e) => removeSavedTavern(item.id, e)}
                      title={t('generators.actions.remove')}
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
