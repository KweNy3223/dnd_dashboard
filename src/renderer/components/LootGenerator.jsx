import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext.jsx';
import { 
  Coins, 
  Gem, 
  Sparkles, 
  Users, 
  Bookmark, 
  Copy, 
  Check, 
  Trash2, 
  RotateCcw,
  Dices,
  Trophy,
  FileText
} from 'lucide-react';
import { 
  LOOT_TIERS, 
  LOOT_TYPES, 
  generateRandomLoot 
} from '../data/lootData.js';

export default function LootGenerator({ onSendToNotes }) {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const currencyBadges = {
    cp: { bg: 'rgba(184, 115, 51, 0.15)', border: 'rgba(184, 115, 51, 0.4)', text: '#d97706', label: isEn ? 'CP' : 'ММ' },
    sp: { bg: 'rgba(156, 163, 175, 0.15)', border: 'rgba(156, 163, 175, 0.4)', text: '#9ca3af', label: isEn ? 'SP' : 'СМ' },
    ep: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#10b981', label: isEn ? 'EP' : 'ЭМ' },
    gp: { bg: 'rgba(250, 204, 21, 0.15)', border: 'rgba(250, 204, 21, 0.4)', text: '#facc15', label: isEn ? 'GP' : 'ЗМ' },
    pp: { bg: 'rgba(224, 231, 255, 0.15)', border: 'rgba(224, 231, 255, 0.4)', text: '#818cf8', label: isEn ? 'PP' : 'ПМ' }
  };

  const [selectedTier, setSelectedTier] = useState('tier1');
  const [selectedType, setSelectedType] = useState('hoard');
  const [partyCount, setPartyCount] = useState(4);

  const [currentLoot, setCurrentLoot] = useState(() => {
    try {
      const cached = localStorage.getItem('dnd_active_loot');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.tierLabel_en && parsed.typeLabel_en) {
          return parsed;
        }
      }
      return generateRandomLoot('tier1', 'hoard', { language });
    } catch {
      return generateRandomLoot('tier1', 'hoard', { language });
    }
  });

  const [savedLoots, setSavedLoots] = useState(() => {
    try {
      const saved = localStorage.getItem('dnd_saved_loots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copied, setCopied] = useState(false);

  // Обновление локализованных полей при смене языка
  useEffect(() => {
    if (!currentLoot || !currentLoot.tierLabel_en || !currentLoot.typeLabel_en) {
      setCurrentLoot(generateRandomLoot(selectedTier, selectedType, { language }));
    }
  }, [language]);

  useEffect(() => {
    if (currentLoot) {
      try {
        localStorage.setItem('dnd_active_loot', JSON.stringify(currentLoot));
      } catch (e) {
        console.warn('Не удалось закешировать активный лут', e);
      }
    }
  }, [currentLoot]);

  useEffect(() => {
    try {
      localStorage.setItem('dnd_saved_loots', JSON.stringify(savedLoots));
    } catch (e) {
      console.warn('Не удалось сохранить список лута', e);
    }
  }, [savedLoots]);

  const handleGenerate = (forceRandom = false) => {
    if (forceRandom) {
      setSelectedTier('tier1');
      setSelectedType('hoard');
      setCurrentLoot(generateRandomLoot('tier1', 'hoard', { language }));
    } else {
      setCurrentLoot(generateRandomLoot(selectedTier, selectedType, { language }));
    }
  };

  const isSaved = savedLoots.some(l => l.id === currentLoot?.id);

  const toggleSaveLoot = () => {
    if (!currentLoot) return;
    if (isSaved) {
      setSavedLoots(savedLoots.filter(l => l.id !== currentLoot.id));
    } else {
      setSavedLoots([currentLoot, ...savedLoots]);
    }
  };

  const removeSavedLoot = (id, e) => {
    e.stopPropagation();
    setSavedLoots(savedLoots.filter(l => l.id !== id));
  };

  const lootTypeLabel = isEn ? (currentLoot?.typeLabel_en || currentLoot?.typeLabel) : (currentLoot?.typeLabel_ru || currentLoot?.typeLabel);
  const lootTierLabel = isEn ? (currentLoot?.tierLabel_en || currentLoot?.tierLabel) : (currentLoot?.tierLabel_ru || currentLoot?.tierLabel);

  const perPlayerGp = currentLoot && partyCount > 0 
    ? (currentLoot.totalValueGp / partyCount).toFixed(1)
    : 0;

  const handleCopy = () => {
    if (!currentLoot) return;
    const coinsStr = ['pp', 'gp', 'ep', 'sp', 'cp']
      .filter(k => currentLoot.coins[k] > 0)
      .map(k => `${currentLoot.coins[k]} ${k.toUpperCase()}`)
      .join(', ') || (isEn ? '0 coins' : '0 монет');

    const gemsStr = currentLoot.gemsAndArt?.length > 0
      ? currentLoot.gemsAndArt.map(g => {
          const gName = isEn ? (g.name_en || g.name) : (g.name_ru || g.name);
          return isEn 
            ? `• ${g.count}x ${gName} (${g.value} GP each)` 
            : `• ${g.count}x ${gName} (${g.value} зм/шт)`;
        }).join('\n')
      : (isEn ? 'None' : 'Нет');

    const magicStr = currentLoot.magicItems?.length > 0
      ? currentLoot.magicItems.map(m => {
          const mName = isEn ? (m.name_en || m.name) : (m.name_ru || m.name);
          const mRarity = isEn ? (m.rarity_en || m.rarity) : (m.rarity_ru || m.rarity);
          const mDesc = isEn ? (m.desc_en || m.desc) : (m.desc_ru || m.desc);
          return `• [${mRarity}] ${mName} — ${mDesc}`;
        }).join('\n')
      : (isEn ? 'None' : 'Нет');

    const text = isEn ? [
      `💰 TREASURE: ${lootTypeLabel} (${lootTierLabel})`,
      `🪙 Coins: ${coinsStr} (Total currency value: ~${currentLoot.coinTotalGp} GP)`,
      '',
      `💎 Gemstones & Art Objects:`,
      gemsStr,
      '',
      `✨ Magic Items & Scrolls:`,
      magicStr,
      '',
      `👑 TOTAL VALUE: ~${currentLoot.totalValueGp} GP (each of ${partyCount} players: ~${perPlayerGp} GP)`
    ].join('\n') : [
      `💰 СОКРОВИЩА: ${lootTypeLabel} (${lootTierLabel})`,
      `🪙 Монеты: ${coinsStr} (Общая стоимость в золоте: ~${currentLoot.coinTotalGp} ЗМ)`,
      '',
      `💎 Самоцветы и драгоценности:`,
      gemsStr,
      '',
      `✨ Магические предметы и свитки:`,
      magicStr,
      '',
      `👑 ИТОГОВАЯ ЦЕННОСТЬ: ~${currentLoot.totalValueGp} ЗМ (доля каждого из ${partyCount} игр.: ~${perPlayerGp} ЗМ)`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendLootToNotes = () => {
    if (!currentLoot || !onSendToNotes) return;
    const coinsStr = Object.entries(currentLoot.coins || {})
      .filter(([_, v]) => v > 0)
      .map(([k, v]) => `${v.toLocaleString(isEn ? 'en-US' : 'ru-RU')} ${currencyBadges[k]?.label || k.toUpperCase()}`)
      .join(', ') || (isEn ? '0 coins' : '0 монет');

    const gemsStr = currentLoot.gemsAndArt?.length > 0
      ? currentLoot.gemsAndArt.map(g => {
          const gName = isEn ? (g.name_en || g.name) : (g.name_ru || g.name);
          return isEn 
            ? `• ${g.count}× ${gName} (${g.value * g.count} GP)` 
            : `• ${g.count}× ${gName} (${g.value * g.count} ЗМ)`;
        }).join('\n')
      : (isEn ? 'None' : 'Нет');

    const magicStr = currentLoot.magicItems?.length > 0
      ? currentLoot.magicItems.map(m => {
          const mName = isEn ? (m.name_en || m.name) : (m.name_ru || m.name);
          const mRarity = isEn ? (m.rarity_en || m.rarity) : (m.rarity_ru || m.rarity);
          const mDesc = isEn ? (m.desc_en || m.desc) : (m.desc_ru || m.desc);
          return `• [${mRarity}] ${mName} — ${mDesc}`;
        }).join('\n')
      : (isEn ? 'None' : 'Нет');

    const text = isEn ? [
      `【 💰 Treasure: ${lootTypeLabel} (${lootTierLabel}) 】`,
      `Coins: ${coinsStr} (~${currentLoot.coinTotalGp} GP)`,
      `Gemstones & Art Objects:`,
      gemsStr,
      `Magic Items:`,
      magicStr,
      `Total Value: ~${currentLoot.totalValueGp} GP (each of ${partyCount} players: ~${perPlayerGp} GP)`
    ].join('\n') : [
      `【 💰 Сокровища: ${lootTypeLabel} (${lootTierLabel}) 】`,
      `Монеты: ${coinsStr} (~${currentLoot.coinTotalGp} ЗМ)`,
      `Самоцветы:`,
      gemsStr,
      `Магические предметы:`,
      magicStr,
      `Итоговая ценность: ~${currentLoot.totalValueGp} ЗМ (доля каждого из ${partyCount} игр.: ~${perPlayerGp} ЗМ)`
    ].join('\n');

    onSendToNotes(text, isEn ? `Treasure (${currentLoot.totalValueGp} GP)` : `Сокровища (${currentLoot.totalValueGp} ЗМ)`);
  };

  return (
    <div>
      {/* Шапка подраздела */}
      <div className="generators-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Gem size={26} color="#f2f3f5" />
          <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-title)' }}>
            {t('generators.loot.title')}
          </h2>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          {t('generators.loot.desc')}
        </p>
      </div>

      {/* Горизонтальная панель фильтров */}
      <div className="generators-toolbar">
        <div className="filters-group">
          <div className="filter-item">
            <label>{t('generators.loot.type')}</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="curtain-select filter-select"
            >
              {LOOT_TYPES.map(tItem => (
                <option key={tItem.id} value={tItem.id}>
                  {isEn ? (tItem.label_en || tItem.label) : tItem.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>{t('generators.loot.tier')}</label>
            <select 
              value={selectedTier} 
              onChange={(e) => setSelectedTier(e.target.value)}
              className="curtain-select filter-select"
            >
              {LOOT_TIERS.map(tier => (
                <option key={tier.id} value={tier.id}>
                  {isEn ? (tier.label_en || tier.label) : tier.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>{t('generators.loot.party')}</label>
            <input 
              type="number" 
              min="1" 
              max="12" 
              value={partyCount} 
              onChange={(e) => setPartyCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="curtain-select filter-select"
              style={{ width: '80px', minWidth: '80px', textAlign: 'center' }}
            />
          </div>
        </div>

        <div className="gen-buttons-group">
          <button 
            type="button" 
            className="trials-btn primary gen-main-btn"
            onClick={() => handleGenerate(false)}
          >
            <Dices size={18} /> {t('generators.loot.generateBtn')}
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={() => handleGenerate(true)}
            title={isEn ? 'Reset filters' : 'Сбросить фильтры'}
          >
            <RotateCcw size={16} /> {t('generators.actions.fullRandom')}
          </button>
        </div>
      </div>

      {/* Основная сетка: Карточка лута слева (1fr) + Записная книжка справа (320px) */}
      <div className="generators-main-layout">
        
        {/* Карточка сокровищ */}
        {currentLoot && (
          <div className="npc-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Шапка карточки */}
            <div className="npc-card-header">
              <div className="npc-avatar-box">
                <span className="npc-race-emoji">💎</span>
              </div>
              <div className="npc-title-box">
                <h3 className="npc-name">{lootTypeLabel}</h3>
                <div className="npc-meta-row">
                  <span className="npc-tag highlight">{lootTierLabel}</span>
                  <span className="npc-tag highlight">
                    {isEn ? `Share per player: ~${perPlayerGp} GP` : `Доля на 1 игрока: ≈ ${perPlayerGp} ЗМ`}
                  </span>
                </div>
              </div>

              <div className="npc-actions-box">
                <button 
                  type="button" 
                  className={`trials-btn secondary icon-btn ${isSaved ? 'active' : ''}`}
                  onClick={toggleSaveLoot}
                  title={isSaved ? (isEn ? 'Remove from saved' : 'Удалить из сохраненных') : (isEn ? 'Bookmark loot' : 'Сохранить сокровища')}
                >
                  <Bookmark size={17} color={isSaved ? '#f2f3f5' : 'currentColor'} />
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleSendLootToNotes}
                  title={isEn ? 'Send treasure details to DM Notes' : 'Отправить сокровища в Заметки на Стол'}
                >
                  <FileText size={17} />
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleCopy}
                  title={isEn ? 'Copy treasure to clipboard' : 'Скопировать сокровища'}
                >
                  {copied ? <Check size={17} color="#22c55e" /> : <Copy size={17} />}
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={() => handleGenerate(false)}
                  title={isEn ? 'Reroll treasure' : 'Сгенерировать заново'}
                >
                  <RotateCcw size={17} />
                </button>
              </div>
            </div>

            {/* Блок монет */}
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Coins size={16} /> {t('generators.loot.coins')}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {isEn ? 'Total in Gold: ' : 'Эквивалент: '}
                  <strong style={{ color: 'var(--text-title)' }}>
                    {currentLoot.coinTotalGp.toLocaleString()} {isEn ? 'GP' : 'ЗМ'}
                  </strong>
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {['pp', 'gp', 'ep', 'sp', 'cp'].map(coin => {
                  const val = currentLoot.coins[coin];
                  const meta = currencyBadges[coin];
                  if (!val || val <= 0) return null;

                  return (
                    <div 
                      key={coin}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: meta.bg,
                        border: `1px solid ${meta.border}`,
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: meta.text
                      }}
                    >
                      <span>{val.toLocaleString()}</span>
                      <span style={{ fontSize: '11px', opacity: 0.8 }}>{meta.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Блок самоцветов и драгоценностей */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 10px 0' }}>
                <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Gem size={16} color="#38bdf8" />
                  {t('generators.loot.gems')}
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {isEn ? 'Total: ' : 'Сумма: '}
                  <strong style={{ color: 'var(--text-title)' }}>
                    {currentLoot.gemsTotalGp} {isEn ? 'GP' : 'ЗМ'}
                  </strong>
                </span>
              </div>

              {(!currentLoot.gemsAndArt || currentLoot.gemsAndArt.length === 0) ? (
                <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px' }}>
                  {isEn ? 'No gemstones or art objects in this cache.' : 'В этой добыче нет драгоценных камней или предметов искусства.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentLoot.gemsAndArt.map((gem, idx) => {
                    const gName = isEn ? (gem.name_en || gem.name) : (gem.name_ru || gem.name);
                    return (
                      <div 
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-app)',
                          border: '1px solid var(--border-color)',
                          fontSize: '13px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--text-title)' }}>
                            {gem.count}×
                          </span>
                          <span style={{ color: 'var(--text-title)' }}>
                            {gName}
                          </span>
                        </div>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.08)', 
                          color: 'var(--text-title)',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}>
                          {isEn ? `${gem.value * gem.count} GP (${gem.value} GP ea)` : `${gem.value * gem.count} ЗМ (${gem.value} зм/шт)`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Блок магических предметов */}
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 10px 0', fontSize: '14px', color: 'var(--text-title)' }}>
                <Sparkles size={16} color="#949ba4" />
                {t('generators.loot.magic')}
              </h4>

              {(!currentLoot.magicItems || currentLoot.magicItems.length === 0) ? (
                <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px' }}>
                  {isEn ? 'No magic items discovered.' : 'Магических предметов не обнаружено.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentLoot.magicItems.map((magic, idx) => {
                    const mName = isEn ? (magic.name_en || magic.name) : (magic.name_ru || magic.name);
                    const mRarity = isEn ? (magic.rarity_en || magic.rarity) : (magic.rarity_ru || magic.rarity);
                    const mDesc = isEn ? (magic.desc_en || magic.desc) : (magic.desc_ru || magic.desc);
                    return (
                      <div 
                        key={idx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(212, 175, 55, 0.06)',
                          border: '1px solid rgba(212, 175, 55, 0.25)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-title)' }}>
                            {mName}
                          </span>
                          <span style={{ 
                            fontSize: '11px', 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            backgroundColor: (mRarity === 'Rare' || mRarity === 'Редкий' || mRarity === 'Very Rare') ? 'rgba(56, 189, 248, 0.2)' : 'rgba(250, 204, 21, 0.15)',
                            color: (mRarity === 'Rare' || mRarity === 'Редкий' || mRarity === 'Very Rare') ? '#38bdf8' : '#facc15',
                            fontWeight: 'bold'
                          }}>
                            {mRarity}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          {mDesc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Правая панель: Сохраненный лут */}
        <div className="saved-npcs-sidebar">
          <div className="saved-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={16} color="#949ba4" />
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)' }}>
                {t('generators.loot.notepad', { count: savedLoots.length })}
              </h4>
            </div>
            {savedLoots.length > 0 && (
              <button 
                type="button" 
                className="clean-btn" 
                onClick={() => setSavedLoots([])}
                title={t('common.clear')}
              >
                {t('common.clear')}
              </button>
            )}
          </div>

          <p style={{ margin: '4px 0 10px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            {isEn 
              ? 'Save loot drops to distribute to players at the end of the session.'
              : 'Сохраняйте выпавшие сокровища для раздачи игрокам в конце сессии.'}
          </p>

          <div className="saved-list">
            {savedLoots.length === 0 ? (
              <div className="saved-empty-state">
                <span>💎</span>
                <p>{t('generators.loot.notepadEmpty')}</p>
              </div>
            ) : (
              savedLoots.map(item => {
                const sType = isEn ? (item.typeLabel_en || item.typeLabel) : (item.typeLabel_ru || item.typeLabel);
                const sTier = isEn ? (item.tierLabel_en || item.tierLabel) : (item.tierLabel_ru || item.tierLabel);
                return (
                  <div 
                    key={item.id} 
                    className={`saved-npc-item ${currentLoot?.id === item.id ? 'active' : ''}`}
                    onClick={() => setCurrentLoot(item)}
                  >
                    <span className="item-icon">💎</span>
                    <div className="item-info">
                      <span className="item-name">{sType}</span>
                      <span className="item-meta">{sTier} • ~{item.totalValueGp} {isEn ? 'GP' : 'ЗМ'}</span>
                    </div>
                    <button 
                      type="button" 
                      className="item-delete-btn" 
                      onClick={(e) => removeSavedLoot(item.id, e)}
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
