import React, { useState, useEffect } from 'react';
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
  Trophy
} from 'lucide-react';
import { 
  LOOT_TIERS, 
  LOOT_TYPES, 
  generateRandomLoot 
} from '../data/lootData.js';

const currencyBadges = {
  cp: { bg: 'rgba(184, 115, 51, 0.15)', border: 'rgba(184, 115, 51, 0.4)', text: '#d97706', label: 'ММ' },
  sp: { bg: 'rgba(156, 163, 175, 0.15)', border: 'rgba(156, 163, 175, 0.4)', text: '#9ca3af', label: 'СМ' },
  ep: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#10b981', label: 'ЭМ' },
  gp: { bg: 'rgba(250, 204, 21, 0.15)', border: 'rgba(250, 204, 21, 0.4)', text: '#facc15', label: 'ЗМ' },
  pp: { bg: 'rgba(224, 231, 255, 0.15)', border: 'rgba(224, 231, 255, 0.4)', text: '#818cf8', label: 'ПМ' }
};

export default function LootGenerator() {
  const [selectedTier, setSelectedTier] = useState('tier1');
  const [selectedType, setSelectedType] = useState('hoard');
  const [partyCount, setPartyCount] = useState(4);

  const [currentLoot, setCurrentLoot] = useState(() => {
    try {
      const cached = localStorage.getItem('dnd_active_loot');
      return cached ? JSON.parse(cached) : generateRandomLoot();
    } catch {
      return generateRandomLoot();
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
      setCurrentLoot(generateRandomLoot('tier1', 'hoard'));
    } else {
      setCurrentLoot(generateRandomLoot(selectedTier, selectedType));
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

  const handleCopy = () => {
    if (!currentLoot) return;
    const coinsStr = ['pp', 'gp', 'ep', 'sp', 'cp']
      .filter(k => currentLoot.coins[k] > 0)
      .map(k => `${currentLoot.coins[k]} ${k.toUpperCase()}`)
      .join(', ') || '0 монет';

    const gemsStr = currentLoot.gemsAndArt.length > 0
      ? currentLoot.gemsAndArt.map(g => `• ${g.count}x ${g.name} (${g.value} зм/шт)`).join('\n')
      : 'Нет';

    const magicStr = currentLoot.magicItems.length > 0
      ? currentLoot.magicItems.map(m => `• [${m.rarity}] ${m.name} — ${m.desc}`).join('\n')
      : 'Нет';

    const text = `💰 СОКРОВИЩА: ${currentLoot.typeLabel} (${currentLoot.tierLabel})\n` +
      `🪙 Монеты: ${coinsStr} (Общая стоимость в золоте: ~${currentLoot.coinTotalGp} ЗМ)\n\n` +
      `💎 Самоцветы и драгоценности:\n${gemsStr}\n\n` +
      `✨ Магические предметы и свитки:\n${magicStr}\n\n` +
      `👑 ИТОГОВАЯ ЦЕННОСТЬ: ~${currentLoot.totalValueGp} ЗМ (доля каждого из ${partyCount} игр.: ~${perPlayerGp} ЗМ)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const perPlayerGp = currentLoot && partyCount > 0 
    ? (currentLoot.totalValueGp / partyCount).toFixed(1)
    : 0;

  return (
    <div>
      {/* Шапка подраздела */}
      <div className="generators-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Gem size={26} color="var(--accent-gold)" />
          <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-title)' }}>
            Генератор Сокровищ и Добычи
          </h2>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Сокровищницы боссов и карманная добыча по таблицам DMG 5e с самоцветами, магическими свитками и делителем на отряд.
        </p>
      </div>

      {/* Горизонтальная панель фильтров */}
      <div className="generators-toolbar">
        <div className="filters-group">
          <div className="filter-item">
            <label>Тип сокровищ:</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="curtain-select filter-select"
            >
              {LOOT_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Уровень опасности (CR):</label>
            <select 
              value={selectedTier} 
              onChange={(e) => setSelectedTier(e.target.value)}
              className="curtain-select filter-select"
            >
              {LOOT_TIERS.map(tier => (
                <option key={tier.id} value={tier.id}>{tier.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Игроков в отряде:</label>
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
            <Dices size={18} /> Сгенерировать лут
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={() => handleGenerate(true)}
            title="Сбросить фильтры"
          >
            <RotateCcw size={16} /> Рандом
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
                <h3 className="npc-name">{currentLoot.typeLabel}</h3>
                <div className="npc-meta-row">
                  <span className="npc-tag highlight">{currentLoot.tierLabel}</span>
                  <span className="npc-tag" style={{ color: 'var(--accent-gold)', borderColor: 'rgba(212, 175, 55, 0.3)' }}>
                    Доля на 1 игрока: ≈ {perPlayerGp} ЗМ
                  </span>
                </div>
              </div>

              <div className="npc-actions-box">
                <button 
                  type="button" 
                  className={`trials-btn secondary icon-btn ${isSaved ? 'active' : ''}`}
                  onClick={toggleSaveLoot}
                  title={isSaved ? 'Удалить из сохраненных' : 'Сохранить сокровища'}
                >
                  <Bookmark size={17} color={isSaved ? 'var(--accent-gold)' : 'currentColor'} />
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleCopy}
                  title="Скопировать сокровища"
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

            {/* Блок монет */}
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Coins size={16} /> Монеты
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Эквивалент: <strong style={{ color: 'var(--accent-gold)' }}>{currentLoot.coinTotalGp.toLocaleString()} ЗМ</strong>
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
                  Самоцветы и предметы искусства
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Сумма: <strong style={{ color: 'var(--text-title)' }}>{currentLoot.gemsTotalGp} ЗМ</strong>
                </span>
              </div>

              {currentLoot.gemsAndArt.length === 0 ? (
                <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px' }}>
                  В этой добыче нет драгоценных камней или предметов искусства.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentLoot.gemsAndArt.map((gem, idx) => (
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
                        <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                          {gem.count}×
                        </span>
                        <span style={{ color: 'var(--text-title)' }}>
                          {gem.name}
                        </span>
                      </div>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        backgroundColor: 'rgba(250, 204, 21, 0.1)', 
                        color: '#facc15',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}>
                        {gem.value * gem.count} ЗМ ({gem.value} зм/шт)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Блок магических предметов */}
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 10px 0', fontSize: '14px', color: 'var(--text-title)' }}>
                <Sparkles size={16} color="var(--accent-gold)" />
                Магические находки и свитки
              </h4>

              {currentLoot.magicItems.length === 0 ? (
                <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Магических предметов не обнаружено.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentLoot.magicItems.map((magic, idx) => (
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
                          {magic.name}
                        </span>
                        <span style={{ 
                          fontSize: '11px', 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          backgroundColor: magic.rarity === 'Редкий' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(250, 204, 21, 0.15)',
                          color: magic.rarity === 'Редкий' ? '#38bdf8' : '#facc15',
                          fontWeight: 'bold'
                        }}>
                          {magic.rarity}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {magic.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Правая панель: Сохраненный лут */}
        <div className="saved-npcs-sidebar">
          <div className="saved-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={16} color="var(--accent-gold)" />
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)' }}>
                Сундук трофеев ({savedLoots.length})
              </h4>
            </div>
            {savedLoots.length > 0 && (
              <button 
                type="button" 
                className="clean-btn" 
                onClick={() => setSavedLoots([])}
                title="Очистить список"
              >
                Очистить
              </button>
            )}
          </div>

          <p style={{ margin: '4px 0 10px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            Сохраняйте выпавшие сокровища для раздачи игрокам в конце сессии.
          </p>

          <div className="saved-list">
            {savedLoots.length === 0 ? (
              <div className="saved-empty-state">
                <span>💎</span>
                <p>Нажмите значок закладки, чтобы сохранить найденный клад.</p>
              </div>
            ) : (
              savedLoots.map(item => (
                <div 
                  key={item.id} 
                  className={`saved-npc-item ${currentLoot?.id === item.id ? 'active' : ''}`}
                  onClick={() => setCurrentLoot(item)}
                >
                  <span className="item-icon">💎</span>
                  <div className="item-info">
                    <span className="item-name">{item.typeLabel}</span>
                    <span className="item-meta">{item.tierLabel} • ~{item.totalValueGp} ЗМ</span>
                  </div>
                  <button 
                    type="button" 
                    className="item-delete-btn" 
                    onClick={(e) => removeSavedLoot(item.id, e)}
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
