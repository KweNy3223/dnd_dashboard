import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext.jsx';
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
  ChevronUp,
  Search
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
import {
  MERCHANTS_EN,
  ATMOSPHERES_EN,
  SECURITY_EN,
  SHOP_RUMORS_EN,
  SECRET_LOTS_EN
} from '../data/shopDataEn.js';

export default function ShopGenerator({ onOpenInNpc }) {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const [selectedType, setSelectedType] = useState('any');
  const [selectedWealth, setSelectedWealth] = useState('medium');
  const [isCatalogExpanded, setIsCatalogExpanded] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [copied, setCopied] = useState(false);

  // Активная лавка
  const [currentShop, setCurrentShop] = useState(() => {
    try {
      const cached = localStorage.getItem('dnd_active_shop');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.name_en && parsed.merchant_en && parsed.secretLot_en) {
          return parsed;
        }
      }
      return generateRandomShop({ wealthId: 'medium', language });
    } catch {
      return generateRandomShop({ wealthId: 'medium', language });
    }
  });

  // Обновление локализованных полей при смене языка
  useEffect(() => {
    if (!currentShop || !currentShop.name_en || !currentShop.merchant_en || !currentShop.secretLot_en) {
      const updated = generateRandomShop({
        typeId: currentShop?.type?.id || selectedType,
        wealthId: currentShop?.wealth?.id || selectedWealth,
        language
      });
      setCurrentShop(updated);
    }
  }, [language]);

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

  // Генерация лавки по фильтрам
  const handleGenerate = (forceRandom = false) => {
    const typeId = forceRandom ? 'any' : selectedType;
    const wealthId = forceRandom ? 'any' : (selectedWealth || 'medium');
    if (forceRandom) {
      setSelectedType('any');
      setSelectedWealth('medium');
    }
    const shop = generateRandomShop({ typeId, wealthId, forceRandom, language });
    setCurrentShop(shop);
    setIsCatalogExpanded(false);
    setSearchFilter('');
  };

  // Микро-перегенерация отдельных полей
  const handleRerollField = (field) => {
    if (!currentShop) return;
    if (field === 'name') {
      const nameRu = generateShopName(currentShop.type.id, false);
      const nameEn = generateShopName(currentShop.type.id, true);
      setCurrentShop({
        ...currentShop,
        name: isEn ? nameEn : nameRu,
        name_ru: nameRu,
        name_en: nameEn
      });
    } else if (field === 'merchant') {
      const mIdx = Math.floor(Math.random() * MERCHANTS_POOL.length);
      const mRu = MERCHANTS_POOL[mIdx];
      const mEn = MERCHANTS_EN[mIdx] || mRu;
      setCurrentShop({
        ...currentShop,
        mIdx,
        merchant: isEn ? mEn : mRu,
        merchant_ru: mRu,
        merchant_en: mEn
      });
    } else if (field === 'showcase') {
      const list = currentShop.allGoods || [];
      const shuffled = [...list].sort(() => 0.5 - Math.random());
      setCurrentShop({ ...currentShop, showcase: shuffled.slice(0, Math.min(4, shuffled.length)) });
    } else if (field === 'secretLot') {
      const secretsRu = SECRET_LOTS[currentShop.type.id] || SECRET_LOTS.armory || [];
      const secretsEn = SECRET_LOTS_EN[currentShop.type.id] || SECRET_LOTS_EN.armory || secretsRu;
      const sIdx = Math.floor(Math.random() * secretsRu.length);
      const sRu = secretsRu[sIdx] || {};
      const sEn = secretsEn[sIdx] || sRu;
      setCurrentShop({
        ...currentShop,
        sIdx,
        secretLot: isEn ? sEn : sRu,
        secretLot_ru: sRu,
        secretLot_en: sEn
      });
    } else if (field === 'security') {
      const secIdx = Math.floor(Math.random() * SECURITY_OPTIONS.length);
      const secRu = SECURITY_OPTIONS[secIdx] || {};
      const secEn = SECURITY_EN[secIdx] || secRu;
      setCurrentShop({
        ...currentShop,
        secIdx,
        security: isEn ? secEn : secRu,
        security_ru: secRu,
        security_en: secEn
      });
    } else if (field === 'rumor') {
      const rIdx = Math.floor(Math.random() * SHOP_RUMORS.length);
      const rRu = SHOP_RUMORS[rIdx] || '';
      const rEn = SHOP_RUMORS_EN[rIdx] || rRu;
      setCurrentShop({
        ...currentShop,
        rIdx,
        rumor: isEn ? rEn : rRu,
        rumor_ru: rRu,
        rumor_en: rEn
      });
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

  // Получение актуальных локализованных полей
  const shopName = isEn ? (currentShop?.name_en || currentShop?.name) : (currentShop?.name_ru || currentShop?.name);
  const shopTypeName = isEn ? (currentShop?.type?.name_en || currentShop?.type?.name) : (currentShop?.type?.name_ru || currentShop?.type?.name);
  const shopWealthName = isEn ? (currentShop?.wealth?.name_en || currentShop?.wealth?.name) : (currentShop?.wealth?.name_ru || currentShop?.wealth?.name);
  const shopMerchant = isEn ? (currentShop?.merchant_en || currentShop?.merchant) : (currentShop?.merchant_ru || currentShop?.merchant);
  const shopAtmosphere = isEn ? (currentShop?.atmosphere_en || currentShop?.atmosphere) : (currentShop?.atmosphere_ru || currentShop?.atmosphere);
  const shopSecretLot = isEn ? (currentShop?.secretLot_en || currentShop?.secretLot) : (currentShop?.secretLot_ru || currentShop?.secretLot);
  const shopSecurity = isEn ? (currentShop?.security_en || currentShop?.security) : (currentShop?.security_ru || currentShop?.security);
  const shopRumor = isEn ? (currentShop?.rumor_en || currentShop?.rumor) : (currentShop?.rumor_ru || currentShop?.rumor);

  const allGoodsList = (currentShop?.allGoods || []).map(item => ({
    ...item,
    name: isEn ? (item.name_en || item.name) : (item.name_ru || item.name),
    desc: isEn ? (item.desc_en || item.desc) : (item.desc_ru || item.desc)
  }));

  const showcaseItems = (currentShop?.showcase || []).map(item => ({
    ...item,
    name: isEn ? (item.name_en || item.name) : (item.name_ru || item.name),
    desc: isEn ? (item.desc_en || item.desc) : (item.desc_ru || item.desc)
  }));

  // Копирование информации о лавке в буфер обмена
  const handleCopy = () => {
    if (!currentShop) return;
    const itemsToCopy = isCatalogExpanded ? allGoodsList : showcaseItems;

    const text = isEn ? [
      `🏪 Shop: "${shopName}" (${shopTypeName})`,
      `📍 District: ${shopWealthName}`,
      `👤 Shopkeeper: ${shopMerchant?.name} (${shopMerchant?.race}, ${shopMerchant?.gender}) — ${shopMerchant?.occupation}`,
      `🕯️ Atmosphere: ${shopAtmosphere?.visual}`,
      `   Scent: ${shopAtmosphere?.smell} | Sounds: ${shopAtmosphere?.sound}`,
      ``,
      `📦 ${isCatalogExpanded ? 'COMPLETE INVENTORY' : 'FEATURED SHOWCASE ITEMS'}:`,
      ...itemsToCopy.map(item => `• ${item.name} (${item.price})${item.isHandbook ? ' [Handbook]' : ''} — ${item.desc}`),
      ``,
      `⭐ UNDER-THE-COUNTER SECRET LOT:`,
      `   ${shopSecretLot?.name} (${shopSecretLot?.price})`,
      `   Origin: ${shopSecretLot?.lore || shopSecretLot?.history}`,
      `   Quirk: ${shopSecretLot?.desc || shopSecretLot?.quirk}`,
      ``,
      `🛡️ SECURITY & ANTI-THEFT:`,
      `   ${shopSecurity?.badge}: ${shopSecurity?.desc} [${shopSecurity?.dc}]`,
      shopRumor ? `\n💬 Merchant Concern: "${shopRumor}"` : ''
    ].filter(Boolean).join('\n') : [
      `🏪 Лавка: «${shopName}» (${shopTypeName})`,
      `📍 Район: ${shopWealthName}`,
      `👤 Владелец: ${shopMerchant?.name} (${shopMerchant?.race}, ${shopMerchant?.gender}) — ${shopMerchant?.occupation}`,
      `🕯️ Обстановка: ${shopAtmosphere?.visual}`,
      `   Запах: ${shopAtmosphere?.smell} | Звуки: ${shopAtmosphere?.sound}`,
      ``,
      `📦 ${isCatalogExpanded ? 'ПОЛНЫЙ АССОРТИМЕНТ ТОВАРОВ' : 'ХОДОВЫЕ ТОВАРЫ НА ВИТРИНЕ'}:`,
      ...itemsToCopy.map(item => `• ${item.name} (${item.price})${item.isHandbook ? ' [Справочник]' : ''} — ${item.desc}`),
      ``,
      `⭐ ТОВАР ИЗ-ПОД ПРИЛАВКА:`,
      `   ${shopSecretLot?.name} (${shopSecretLot?.price})`,
      `   История: ${shopSecretLot?.lore || shopSecretLot?.history}`,
      `   Особенность: ${shopSecretLot?.desc || shopSecretLot?.quirk}`,
      ``,
      `🛡️ ОХРАНА И ЗАЩИТА ОТ КРАЖИ:`,
      `   ${shopSecurity?.badge}: ${shopSecurity?.desc} [${shopSecurity?.dc}]`,
      shopRumor ? `\n💬 Забота / Слух: "${shopRumor}"` : ''
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const displayedItems = isCatalogExpanded
    ? (searchFilter ? allGoodsList.filter(item => item.name.toLowerCase().includes(searchFilter.toLowerCase())) : allGoodsList)
    : showcaseItems;

  return (
    <div>
      {/* Шапка подраздела */}
      <div className="generators-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Store size={26} color="#f2f3f5" />
          <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-title)' }}>
            {t('generators.shops.title')}
          </h2>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          {t('generators.shops.desc')}
        </p>
      </div>

      {/* Панель фильтров и генерации */}
      <div className="generators-toolbar">
        <div className="filters-group">
          {/* Тип заведения */}
          <div className="filter-item">
            <label>{t('generators.shops.type')}</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="curtain-select filter-select"
              style={{ minWidth: '220px' }}
            >
              <option value="any">🎲 {t('generators.shops.anyType')}</option>
              {SHOP_TYPES.map(typ => (
                <option key={typ.id} value={typ.id}>{typ.icon} {isEn ? (typ.name_en || typ.name) : typ.name}</option>
              ))}
            </select>
          </div>

          {/* Достаток / Квартал */}
          <div className="filter-item">
            <label>{t('generators.shops.wealth')}</label>
            <select 
              value={selectedWealth} 
              onChange={(e) => setSelectedWealth(e.target.value)}
              className="curtain-select filter-select"
              style={{ minWidth: '230px' }}
            >
              <option value="medium">🏪 {isEn ? 'Merchant Quarter (Default)' : 'Торговый квартал (по умолчанию)'}</option>
              <option value="poor">🏚️ {isEn ? 'Village / Slums Outskirts' : 'Деревня / Трущобы'}</option>
              <option value="wealthy">🏛️ {isEn ? 'Capital Noble Plaza' : 'Богатый квартал столицы'}</option>
              <option value="any">🎲 {isEn ? 'Random District' : 'Случайный район'}</option>
            </select>
          </div>
        </div>

        <div className="gen-buttons-group">
          <button 
            type="button" 
            className="trials-btn primary gen-main-btn"
            onClick={() => handleGenerate(false)}
          >
            <Store size={18} /> {t('generators.shops.generateBtn')}
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={() => handleGenerate(true)}
            title={isEn ? "Reset filters and generate completely random shop" : "Сбросить фильтры и сгенерировать полностью случайную лавку"}
          >
            <RotateCcw size={16} /> {t('generators.actions.fullRandom')}
          </button>
        </div>
      </div>

      {/* Основная сетка: Карточка лавки слева + Записная книжка справа */}
      <div className="generators-main-layout">
        
        {currentShop && (
          <div className="npc-card tavern-card">
            
            {/* Шапка карточки */}
            <div className="npc-card-header">
              <div className="npc-avatar-box tavern-avatar-box">
                <span style={{ fontSize: '28px' }}>{currentShop.type.icon}</span>
              </div>

              <div className="npc-title-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 className="npc-name">«{shopName}»</h3>
                  <button 
                    type="button" 
                    className="reroll-btn" 
                    onClick={() => handleRerollField('name')} 
                    title={t('generators.actions.anotherName')}
                  >
                    <RotateCcw size={11} /> {t('generators.actions.anotherName')}
                  </button>
                </div>
                
                {/* Мета-теги лавки */}
                <div className="npc-meta-row">
                  <span className="npc-tag highlight">{shopTypeName}</span>
                  <span className="npc-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                    {currentShop.wealth.icon} {shopWealthName}
                  </span>
                </div>
              </div>

              {/* Кнопки сохранения и копирования */}
              <div className="npc-actions-box">
                <button 
                  type="button" 
                  className={`trials-btn secondary icon-btn ${isCurrentSaved ? 'active' : ''}`}
                  onClick={toggleSaveCurrent}
                  title={isCurrentSaved ? (isEn ? 'Remove from saved' : 'Удалить из сохранённых') : (isEn ? 'Save shop' : 'Сохранить лавку')}
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

            {/* Блок 1: Владелец лавки */}
            <div className="npc-section-box">
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Store size={15} color="#949ba4" /> {t('generators.shops.merchant')}
                </span>
                <button type="button" className="reroll-btn" onClick={() => handleRerollField('merchant')}>
                  <RotateCcw size={11} /> {t('generators.actions.anotherKeeper')}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong style={{ color: 'var(--text-title)', fontSize: '14.5px' }}>
                    {shopMerchant?.name}
                  </strong>
                  <span className="npc-tag">{shopMerchant?.race}</span>
                  <span className="npc-tag">{shopMerchant?.gender}</span>
                  <span className="npc-tag highlight">💼 {shopMerchant?.occupation}</span>
                </div>

                {onOpenInNpc && (
                  <button 
                    type="button" 
                    className="trials-btn secondary"
                    onClick={() => onOpenInNpc(currentShop.merchant)}
                    title={isEn ? "Open in NPC Generator to detail voice and personality" : "Перейти в Генератор NPC и детально проработать голос и характер торговца"}
                    style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <User size={13} />
                    <span>{isEn ? 'Open in NPC' : 'Открыть в NPC'}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
              {shopMerchant?.bargain && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderLeft: '2px solid rgba(255, 255, 255, 0.25)', paddingLeft: '8px', marginTop: '6px' }}>
                  💡 <strong>{t('generators.shops.bargain')}</strong> {shopMerchant.bargain}
                </div>
              )}
            </div>

            {/* Блок 2: Атмосфера и интерьер */}
            <div className="npc-section-box">
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={15} color="#f97316" /> {t('generators.taverns.atmosphere')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', lineHeight: '1.45' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>🕯️ {t('generators.taverns.sight')} </span>
                  <span style={{ color: 'var(--text-primary)' }}>{shopAtmosphere?.visual}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>💨 {t('generators.taverns.smell')} </span>
                  <span style={{ color: 'var(--text-primary)' }}>{shopAtmosphere?.smell}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>🎶 {t('generators.taverns.sounds')} </span>
                  <span style={{ color: 'var(--text-primary)' }}>{shopAtmosphere?.sound}</span>
                </div>
              </div>
            </div>

            {/* Блок 3: Витрина ходовых товаров + Разворачиваемый полный каталог */}
            <div className="npc-section-box tavern-menu-box">
              <div className="section-title-row">
                <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShoppingBag size={15} color="#949ba4" /> 
                  {isCatalogExpanded 
                    ? (isEn ? `Complete Shop Inventory (${allGoodsList.length} items)` : `Полный ассортимент лавки (${allGoodsList.length} позиций)`)
                    : (isEn ? `Showcase & Popular Items (${shopWealthName})` : `Ходовые товары на витрине (${shopWealthName})`)}
                </span>
                <button type="button" className="reroll-btn" onClick={() => handleRerollField('showcase')}>
                  <RotateCcw size={11} /> {isEn ? 'Other Showcase' : 'Другие ходовые'}
                </button>
              </div>

              {/* Поле быстрого поиска */}
              {isCatalogExpanded && (
                <div style={{ position: 'relative', marginTop: '6px', marginBottom: '6px' }}>
                  <input 
                    type="text" 
                    value={searchFilter} 
                    onChange={(e) => setSearchFilter(e.target.value)} 
                    placeholder={isEn ? "🔍 Quick search by name..." : "🔍 Быстрый поиск по названию..."} 
                    className="curtain-select filter-select"
                    style={{ width: '100%', boxSizing: 'border-box', fontSize: '12px', padding: '6px 12px' }}
                  />
                </div>
              )}

              {/* Список отображаемых товаров */}
              <div className="menu-items-list" style={{ marginTop: '4px' }}>
                {displayedItems.length === 0 ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    {isEn ? `No items found matching "${searchFilter}"` : `Ничего не найдено по запросу «${searchFilter}»`}
                  </div>
                ) : (
                  displayedItems.map((item, idx) => (
                    <div key={idx} className="menu-item-card">
                      <div className="menu-item-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span className="menu-item-name">{item.name}</span>
                          {item.isHandbook ? (
                            <span style={{ fontSize: '10px', color: '#94a3b8', background: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.25)', borderRadius: '3px', padding: '1px 5px' }}>
                              📖 {isEn ? 'Handbook' : 'Справочник цен'}
                            </span>
                          ) : (
                            <span style={{ fontSize: '10px', color: 'var(--text-title)', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '3px', padding: '1px 5px' }}>
                              ✨ {isEn ? 'Specialty' : 'Новинка'}
                            </span>
                          )}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--text-title)', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                          {item.price}
                        </span>
                      </div>
                      <div className="menu-item-desc">
                        {item.desc}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Кнопка развернуть / свернуть весь ассортимент */}
              {allGoodsList.length > (showcaseItems?.length || 0) && (
                <button 
                  type="button" 
                  className="catalog-toggle-btn"
                  onClick={() => {
                    setIsCatalogExpanded(!isCatalogExpanded);
                    if (isCatalogExpanded) setSearchFilter('');
                  }}
                >
                  {isCatalogExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  <span>
                    {isCatalogExpanded 
                      ? (isEn ? 'Collapse to showcase items' : 'Свернуть до ходовых товаров витрины')
                      : (isEn ? `Expand complete inventory (${allGoodsList.length} items)` : `Развернуть весь ассортимент лавки (${allGoodsList.length} позиций)`)}
                  </span>
                </button>
              )}
            </div>

            {/* Блок 4: ⭐ Товар из-под прилавка */}
            {shopSecretLot && (
              <div className="npc-section-box" style={{ background: 'rgba(168, 85, 247, 0.04)', borderColor: 'rgba(168, 85, 247, 0.25)' }}>
                <div className="section-title-row">
                  <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc' }}>
                    <Sparkles size={15} color="#c084fc" /> {t('generators.shops.secretLot')}
                  </span>
                  <button type="button" className="reroll-btn" onClick={() => handleRerollField('secretLot')}>
                    <RotateCcw size={11} /> {isEn ? 'Other Secret Lot' : 'Другой секретный лот'}
                  </button>
                </div>

                <div className="menu-highlight-card exotic" style={{ margin: 0 }}>
                  <div className="menu-badge-label" style={{ color: '#c084fc' }}>
                    🌟 {isEn ? 'Rare Relic / Questionable Contraband' : 'Редкий артефакт / Сомнительный товар'}
                  </div>
                  <div className="menu-highlight-title-row">
                    <span className="menu-highlight-title" style={{ color: '#f3e8ff' }}>
                      {shopSecretLot.name}
                    </span>
                    <span className="price-tag" style={{ background: 'rgba(168, 85, 247, 0.2)', borderColor: '#a855f7', color: '#f3e8ff' }}>
                      {shopSecretLot.price}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', marginTop: '6px', lineHeight: '1.45' }}>
                    <div>
                      <strong style={{ color: '#d8b4fe' }}>📜 {isEn ? 'Origin / Lore: ' : 'Происхождение: '}</strong>
                      <span style={{ color: '#f3e8ff' }}>{shopSecretLot.lore || shopSecretLot.history}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#d8b4fe' }}>✨ {isEn ? 'Quirk / Effect: ' : 'Особенность: '}</strong>
                      <span style={{ color: '#e9d5ff' }}>{shopSecretLot.desc || shopSecretLot.quirk}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Блок 5: Охрана и защита от кражи */}
            {shopSecurity && (
              <div className="npc-section-box" style={{ background: 'rgba(239, 68, 68, 0.04)', borderColor: 'rgba(239, 68, 68, 0.25)' }}>
                <div className="section-title-row">
                  <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171' }}>
                    <ShieldAlert size={15} color="#f87171" /> {t('generators.shops.security')}
                  </span>
                  <button type="button" className="reroll-btn" onClick={() => handleRerollField('security')}>
                    <RotateCcw size={11} /> {isEn ? 'Other Security' : 'Другая охрана'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12.5px' }}>
                    <strong style={{ color: 'var(--text-title)' }}>
                      {shopSecurity.badge}
                    </strong>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {shopSecurity.desc}
                    </span>
                  </div>

                  <span className="npc-tag" style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', fontWeight: 700, fontSize: '12px', padding: '4px 10px' }}>
                    🎯 {shopSecurity.dc}
                  </span>
                </div>
              </div>
            )}

            {/* Блок 6: Слух или забота торговца */}
            {shopRumor && (
              <div className="npc-section-box" style={{ background: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.25)' }}>
                <div className="section-title-row">
                  <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                    <MessageSquare size={15} color="#38bdf8" /> {t('generators.shops.rumor')}
                  </span>
                  <button type="button" className="reroll-btn" onClick={() => handleRerollField('rumor')}>
                    <RotateCcw size={11} /> {t('generators.actions.anotherRumor')}
                  </button>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.45', fontStyle: 'italic' }}>
                  «{shopRumor}»
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  💡 {isEn ? "Quest hook: merchant might mention this if asked about local affairs." : "Зацепка для квеста: торговец может упомянуть это, если расспросить о новостях."}
                </span>
              </div>
            )}

            {/* Нижняя панель быстрых микро-рероллов */}
            <div className="npc-micro-rerolls">
              <button type="button" className="micro-btn" onClick={() => handleRerollField('name')}>
                🔄 {t('generators.taverns.microName')}
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('merchant')}>
                👤 {t('generators.shops.merchant')}
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('showcase')}>
                📦 {isEn ? 'Showcase' : 'Ходовые'}
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('secretLot')}>
                ⭐ {isEn ? 'Secret Lot' : 'Секретный лот'}
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('security')}>
                🛡️ {isEn ? 'Security' : 'Охрана'}
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('rumor')}>
                💬 {t('generators.taverns.microRumor')}
              </button>
            </div>

          </div>
        )}

        {/* Правая колонка: Записная книжка сохраненных лавок */}
        <div className="saved-npcs-sidebar">
          <div className="saved-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={16} color="#949ba4" />
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)' }}>
                {t('generators.shops.notepad', { count: savedShops.length })}
              </h4>
            </div>
            {savedShops.length > 0 && (
              <button 
                type="button" 
                className="clean-btn" 
                onClick={() => setSavedShops([])}
                title={t('generators.actions.clear')}
              >
                {t('generators.actions.clear')}
              </button>
            )}
          </div>

          <p style={{ margin: '4px 0 10px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            {t('generators.shops.notepadDesc')}
          </p>

          <div className="saved-list">
            {savedShops.length === 0 ? (
              <div className="saved-empty-state">
                <span>🏪</span>
                <p>{t('generators.shops.notepadEmpty')}</p>
              </div>
            ) : (
              savedShops.map(item => {
                const sName = isEn ? (item.name_en || item.name) : (item.name_ru || item.name);
                const sType = isEn ? (item.type?.name_en || item.type?.name) : (item.type?.name_ru || item.type?.name);
                const sMerchant = isEn ? (item.merchant?.name_en || item.merchant?.name) : (item.merchant?.name_ru || item.merchant?.name);
                return (
                  <div 
                    key={item.id} 
                    className={`saved-npc-item ${currentShop?.id === item.id ? 'active' : ''}`}
                    onClick={() => setCurrentShop(item)}
                  >
                    <span className="item-icon">{item.type.icon}</span>
                    <div className="item-info">
                      <span className="item-name">«{sName}»</span>
                      <span className="item-meta">{sType} • {sMerchant}</span>
                    </div>
                    <button 
                      type="button" 
                      className="item-delete-btn" 
                      onClick={(e) => removeSavedShop(item.id, e)}
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
