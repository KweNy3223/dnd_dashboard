import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Bookmark, 
  Copy, 
  Check, 
  Trash2, 
  RotateCcw, 
  User, 
  Flame, 
  ShieldAlert, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  ShoppingBag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  SHOP_TYPES, 
  WEALTH_TIERS, 
  MERCHANTS_POOL, 
  ATMOSPHERES, 
  GOODS_CATALOG, 
  SECRET_LOTS, 
  SECURITY_OPTIONS, 
  SHOP_RUMORS, 
  generateShopName, 
  generateRandomShop 
} from '../data/shopData.js';

export default function ShopGenerator({ onOpenInNpc }) {
  const [selectedType, setSelectedType] = useState('any');
  // По умолчанию дефолтный район — Торговый квартал города (medium)
  const [selectedWealth, setSelectedWealth] = useState('medium');
  const [isCatalogExpanded, setIsCatalogExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Активная лавка (сохраняется в localStorage)
  const [currentShop, setCurrentShop] = useState(() => {
    try {
      const cached = localStorage.getItem('dnd_active_shop');
      return cached ? JSON.parse(cached) : generateRandomShop({ wealthId: 'medium' });
    } catch {
      return generateRandomShop({ wealthId: 'medium' });
    }
  });

  useEffect(() => {
    if (currentShop) {
      try {
        localStorage.setItem('dnd_active_shop', JSON.stringify(currentShop));
      } catch (e) {
        console.warn('Не удалось закешировать активную лавку', e);
      }
    }
  }, [currentShop]);

  // Записная книжка сохраненных лавок
  const [savedShops, setSavedShops] = useState(() => {
    try {
      const saved = localStorage.getItem('dnd_saved_shops');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dnd_saved_shops', JSON.stringify(savedShops));
    } catch (e) {
      console.warn('Не удалось сохранить лавки в localStorage', e);
    }
  }, [savedShops]);

  // Генерация лавки по фильтрам (с дефолтным районом Торговый квартал)
  const handleGenerate = (forceRandom = false) => {
    const typeId = forceRandom ? 'any' : selectedType;
    const wealthId = forceRandom ? 'any' : (selectedWealth || 'medium');
    if (forceRandom) {
      setSelectedType('any');
      setSelectedWealth('medium');
    }
    const shop = generateRandomShop({ typeId, wealthId, forceRandom });
    setCurrentShop(shop);
    setIsCatalogExpanded(false); // сбрасываем аккордеон при новой генерации
  };

  // Микро-перегенерация отдельных полей
  const handleRerollField = (field) => {
    if (!currentShop) return;
    if (field === 'name') {
      setCurrentShop({ ...currentShop, name: generateShopName(currentShop.type.id) });
    } else if (field === 'merchant') {
      const m = MERCHANTS_POOL[Math.floor(Math.random() * MERCHANTS_POOL.length)];
      setCurrentShop({ ...currentShop, merchant: m });
    } else if (field === 'showcase') {
      const list = GOODS_CATALOG[currentShop.type.id]?.[currentShop.wealth.id] || GOODS_CATALOG.armory.medium;
      const shuffled = [...list].sort(() => 0.5 - Math.random());
      setCurrentShop({ ...currentShop, showcase: shuffled.slice(0, Math.min(4, shuffled.length)) });
    } else if (field === 'secretLot') {
      const list = SECRET_LOTS[currentShop.type.id] || SECRET_LOTS.armory;
      const lot = list[Math.floor(Math.random() * list.length)];
      setCurrentShop({ ...currentShop, secretLot: lot });
    } else if (field === 'security') {
      const sec = SECURITY_OPTIONS[Math.floor(Math.random() * SECURITY_OPTIONS.length)];
      setCurrentShop({ ...currentShop, security: sec });
    } else if (field === 'rumor') {
      const r = SHOP_RUMORS[Math.floor(Math.random() * SHOP_RUMORS.length)];
      setCurrentShop({ ...currentShop, rumor: r });
    }
  };

  // Избранное
  const isCurrentSaved = savedShops.some(s => s.id === currentShop?.id);
  const toggleSaveCurrent = () => {
    if (!currentShop) return;
    if (isCurrentSaved) {
      setSavedShops(savedShops.filter(s => s.id !== currentShop.id));
    } else {
      setSavedShops([currentShop, ...savedShops]);
    }
  };

  const removeSavedShop = (id, e) => {
    e.stopPropagation();
    setSavedShops(savedShops.filter(s => s.id !== id));
  };

  // Копирование информации о лавке в буфер обмена
  const handleCopy = () => {
    if (!currentShop) return;
    const { merchant, showcase, allGoods, secretLot, security } = currentShop;
    const allGoodsList = allGoods || GOODS_CATALOG[currentShop.type.id]?.[currentShop.wealth.id] || showcase;
    const itemsToCopy = isCatalogExpanded ? allGoodsList : showcase;

    const text = [
      `🏪 Лавка: ${currentShop.name} (${currentShop.type.name})`,
      `📍 Район: ${currentShop.wealth.name}`,
      `👤 Владелец: ${merchant.name} (${merchant.race}, ${merchant.gender}) — ${merchant.occupation}`,
      `🕯️ Обстановка: ${currentShop.atmosphere.visual}`,
      `   Запах: ${currentShop.atmosphere.smell}`,
      `   Звуки: ${currentShop.atmosphere.sound}`,
      ``,
      `📦 ${isCatalogExpanded ? 'ПОЛНЫЙ АССОРТИМЕНТ ТОВАРОВ' : 'ХОДОВЫЕ ТОВАРЫ НА ВИТРИНЕ'}:`,
      ...itemsToCopy.map(item => `• ${item.name} (${item.price}) — ${item.desc}`),
      ``,
      `⭐ ТОВАР ИЗ-ПОД ПРИЛАВКА:`,
      `   ${secretLot.name} (${secretLot.price})`,
      `   История: ${secretLot.history}`,
      `   Особенность: ${secretLot.quirk}`,
      ``,
      `🛡️ ОХРАНА И ЗАЩИТА ОТ КРАЖИ:`,
      `   ${security.badge}: ${security.desc} [${security.dc}]`,
      currentShop.rumor ? `\n💬 Забота / Слух: "${currentShop.rumor}"` : ''
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  // Полный список товаров лавки для текущего типа и района
  const allGoodsList = currentShop?.allGoods || 
    GOODS_CATALOG[currentShop?.type?.id]?.[currentShop?.wealth?.id] || 
    currentShop?.showcase || 
    [];

  return (
    <div>
      {/* Шапка подраздела */}
      <div className="generators-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Store size={26} color="var(--accent-gold)" />
          <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-title)' }}>
            Генератор Лавок и Торговцев
          </h2>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Создание кузниц, алхимических лавок, магии и ломбардов с витриной, уникальным товаром из-под прилавка и защитой от кражи.
        </p>
      </div>

      {/* Панель фильтров и генерации */}
      <div className="generators-toolbar">
        <div className="filters-group">
          {/* Тип заведения */}
          <div className="filter-item">
            <label>Тип лавки:</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="curtain-select filter-select"
              style={{ minWidth: '220px' }}
            >
              <option value="any">🎲 Любая лавка</option>
              {SHOP_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
              ))}
            </select>
          </div>

          {/* Достаток / Квартал (по умолчанию Торговый квартал) */}
          <div className="filter-item">
            <label>Район / Достаток:</label>
            <select 
              value={selectedWealth} 
              onChange={(e) => setSelectedWealth(e.target.value)}
              className="curtain-select filter-select"
              style={{ minWidth: '230px' }}
            >
              <option value="medium">🏪 Торговый квартал (по умолчанию)</option>
              <option value="poor">🏚️ Деревня / Трущобы</option>
              <option value="wealthy">🏛️ Богатый квартал столицы</option>
              <option value="any">🎲 Случайный район</option>
            </select>
          </div>
        </div>

        {/* Кнопки генерации в фирменном стиле приложения */}
        <div className="gen-buttons-group">
          <button 
            type="button" 
            className="trials-btn primary gen-main-btn"
            onClick={() => handleGenerate(false)}
          >
            <Store size={18} /> Сгенерировать лавку
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={() => handleGenerate(true)}
            title="Сбросить фильтры и сгенерировать полностью случайную лавку"
          >
            <RotateCcw size={16} /> Полный рандом
          </button>
        </div>
      </div>

      {/* Основная сетка: Карточка лавки слева + Записная книжка справа */}
      <div className="generators-main-layout">
        
        {/* Карточка текущей лавки */}
        {currentShop && (
          <div className="npc-card tavern-card">
            
            {/* Шапка карточки */}
            <div className="npc-card-header">
              <div className="npc-avatar-box tavern-avatar-box">
                <span style={{ fontSize: '28px' }}>{currentShop.type.icon}</span>
              </div>

              <div className="npc-title-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 className="npc-name">{currentShop.name}</h3>
                  <button 
                    type="button" 
                    className="reroll-btn" 
                    onClick={() => handleRerollField('name')} 
                    title="Сменить название"
                  >
                    <RotateCcw size={11} /> Другое имя
                  </button>
                </div>
                
                {/* Мета-теги лавки */}
                <div className="npc-meta-row">
                  <span className="npc-tag highlight">{currentShop.type.name}</span>
                  <span className="npc-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                    {currentShop.wealth.icon} {currentShop.wealth.name}
                  </span>
                </div>
              </div>

              {/* Кнопки сохранения и копирования */}
              <div className="npc-actions-box">
                <button 
                  type="button" 
                  className={`trials-btn secondary icon-btn ${isCurrentSaved ? 'active' : ''}`}
                  onClick={toggleSaveCurrent}
                  title={isCurrentSaved ? 'Удалить из сохранённых' : 'Сохранить лавку'}
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

            {/* Блок 1: Владелец лавки */}
            <div className="npc-section-box">
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Store size={15} color="var(--accent-gold)" /> Торговец за прилавком
                </span>
                <button type="button" className="reroll-btn" onClick={() => handleRerollField('merchant')}>
                  <RotateCcw size={11} /> Другой торговец
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong style={{ color: 'var(--text-title)', fontSize: '14.5px' }}>
                    {currentShop.merchant.name}
                  </strong>
                  <span className="npc-tag">{currentShop.merchant.race}</span>
                  <span className="npc-tag">{currentShop.merchant.gender}</span>
                  <span className="npc-tag highlight">💼 {currentShop.merchant.occupation}</span>
                </div>

                {/* Кнопка быстрого перехода в Генератор NPC */}
                {onOpenInNpc && (
                  <button 
                    type="button" 
                    className="trials-btn secondary"
                    onClick={() => onOpenInNpc(currentShop.merchant)}
                    title="Перейти в Генератор NPC и детально проработать голос и характер торговца"
                    style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <User size={13} />
                    <span>Открыть в NPC</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Блок 2: Атмосфера и интерьер */}
            <div className="npc-section-box">
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={15} color="#f97316" /> Интерьер и обстановка
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', lineHeight: '1.45' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>🕯️ Вид: </span>
                  <span style={{ color: 'var(--text-primary)' }}>{currentShop.atmosphere.visual}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>💨 Запах: </span>
                  <span style={{ color: 'var(--text-primary)' }}>{currentShop.atmosphere.smell}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>🎶 Звуки: </span>
                  <span style={{ color: 'var(--text-primary)' }}>{currentShop.atmosphere.sound}</span>
                </div>
              </div>
            </div>

            {/* Блок 3: Витрина ходовых товаров + Разворачиваемый полный каталог */}
            <div className="npc-section-box tavern-menu-box" style={{ background: 'rgba(234, 179, 8, 0.03)', borderColor: 'rgba(234, 179, 8, 0.25)' }}>
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShoppingBag size={15} color="var(--accent-gold)" /> 
                  {isCatalogExpanded 
                    ? `Полный ассортимент лавки (${allGoodsList.length} поз.)`
                    : `Ходовые товары на витрине (${currentShop.wealth.name})`}
                </span>
                <button type="button" className="reroll-btn" onClick={() => handleRerollField('showcase')}>
                  <RotateCcw size={11} /> Другие ходовые
                </button>
              </div>

              {/* Список отображаемых товаров: 4 ходовых или весь расширенный каталог */}
              <div className="menu-items-list" style={{ marginTop: '4px' }}>
                {(isCatalogExpanded ? allGoodsList : currentShop.showcase).map((item, idx) => (
                  <div key={idx} className="menu-item-card">
                    <div className="menu-item-top">
                      <span className="menu-item-name">{item.name}</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '12.5px' }}>
                        {item.price}
                      </span>
                    </div>
                    <div className="menu-item-desc">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>

              {/* Кнопка развернуть / свернуть весь ассортимент */}
              {allGoodsList.length > (currentShop.showcase?.length || 0) && (
                <button 
                  type="button" 
                  className="catalog-toggle-btn"
                  onClick={() => setIsCatalogExpanded(!isCatalogExpanded)}
                >
                  {isCatalogExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  <span>
                    {isCatalogExpanded 
                      ? 'Свернуть до ходовых товаров витрины' 
                      : `Развернуть весь ассортимент лавки (${allGoodsList.length} позиций)`}
                  </span>
                </button>
              )}
            </div>

            {/* Блок 4: ⭐ Товар из-под прилавка */}
            {currentShop.secretLot && (
              <div className="npc-section-box" style={{ background: 'rgba(168, 85, 247, 0.04)', borderColor: 'rgba(168, 85, 247, 0.25)' }}>
                <div className="section-title-row">
                  <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc' }}>
                    <Sparkles size={15} color="#c084fc" /> Товар из-под прилавка (Особый лот)
                  </span>
                  <button type="button" className="reroll-btn" onClick={() => handleRerollField('secretLot')}>
                    <RotateCcw size={11} /> Другой секретный лот
                  </button>
                </div>

                <div className="menu-highlight-card exotic" style={{ margin: 0 }}>
                  <div className="menu-badge-label" style={{ color: '#c084fc' }}>
                    🌟 Редкий артефакт / Сомнительный товар
                  </div>
                  <div className="menu-highlight-title-row">
                    <span className="menu-highlight-title" style={{ color: '#f3e8ff' }}>
                      {currentShop.secretLot.name}
                    </span>
                    <span className="price-tag" style={{ background: 'rgba(168, 85, 247, 0.2)', borderColor: '#a855f7', color: '#f3e8ff' }}>
                      {currentShop.secretLot.price}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', marginTop: '6px', lineHeight: '1.45' }}>
                    <div>
                      <strong style={{ color: '#d8b4fe' }}>📜 Происхождение: </strong>
                      <span style={{ color: '#f3e8ff' }}>{currentShop.secretLot.history}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#d8b4fe' }}>✨ Особенность / Изюминка: </strong>
                      <span style={{ color: '#e9d5ff' }}>{currentShop.secretLot.quirk}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Блок 5: Охрана и защита от кражи (Для плутов) */}
            <div className="npc-section-box" style={{ background: 'rgba(239, 68, 68, 0.04)', borderColor: 'rgba(239, 68, 68, 0.25)' }}>
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171' }}>
                  <ShieldAlert size={15} color="#f87171" /> Охрана и защита от воровства
                </span>
                <button type="button" className="reroll-btn" onClick={() => handleRerollField('security')}>
                  <RotateCcw size={11} /> Другая охрана
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12.5px' }}>
                  <strong style={{ color: 'var(--text-title)' }}>
                    {currentShop.security.badge}
                  </strong>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {currentShop.security.desc}
                  </span>
                </div>

                <span className="npc-tag" style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', fontWeight: 700, fontSize: '12px', padding: '4px 10px' }}>
                  🎯 {currentShop.security.dc}
                </span>
              </div>
            </div>

            {/* Блок 6: Слух или забота торговца (Опционально) */}
            {currentShop.rumor && (
              <div className="npc-section-box" style={{ background: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.25)' }}>
                <div className="section-title-row">
                  <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                    <MessageSquare size={15} color="#38bdf8" /> Слух или забота лавочника (зацепка)
                  </span>
                  <button type="button" className="reroll-btn" onClick={() => handleRerollField('rumor')}>
                    <RotateCcw size={11} /> Другой слух
                  </button>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.45', fontStyle: 'italic' }}>
                  «{currentShop.rumor}»
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  💡 Зацепка для квеста: торговец может упомянуть это, если расспросить о новостях.
                </span>
              </div>
            )}

            {/* Нижняя панель быстрых микро-рероллов */}
            <div className="npc-micro-rerolls">
              <button type="button" className="micro-btn" onClick={() => handleRerollField('name')}>
                🔄 Название
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('merchant')}>
                👤 Торговец
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('showcase')}>
                📦 Ходовые
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('secretLot')}>
                ⭐ Секретный лот
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('security')}>
                🛡️ Охрана
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('rumor')}>
                💬 Слух
              </button>
            </div>

          </div>
        )}

        {/* Правая колонка: Записная книжка сохраненных лавок */}
        <div className="saved-npcs-sidebar">
          <div className="saved-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={16} color="var(--accent-gold)" />
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)' }}>
                Записная книжка ({savedShops.length})
              </h4>
            </div>
            {savedShops.length > 0 && (
              <button 
                type="button" 
                className="clean-btn" 
                onClick={() => setSavedShops([])}
                title="Очистить список"
              >
                Очистить
              </button>
            )}
          </div>

          <p style={{ margin: '4px 0 10px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            Сохраняйте лавки и купцов, с которыми торговала партия, чтобы быстро вспомнить ассортимент и охранников.
          </p>

          <div className="saved-list">
            {savedShops.length === 0 ? (
              <div className="saved-empty-state">
                <span>🏪</span>
                <p>Нажмите закладку на карточке лавки, чтобы сохранить её в кампанию.</p>
              </div>
            ) : (
              savedShops.map(item => (
                <div 
                  key={item.id} 
                  className={`saved-npc-item ${currentShop?.id === item.id ? 'active' : ''}`}
                  onClick={() => setCurrentShop(item)}
                >
                  <span className="item-icon">{item.type.icon}</span>
                  <div className="item-info">
                    <span className="item-name">«{item.name}»</span>
                    <span className="item-meta">{item.type.name} • {item.merchant.name}</span>
                  </div>
                  <button 
                    type="button" 
                    className="item-delete-btn" 
                    onClick={(e) => removeSavedShop(item.id, e)}
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
