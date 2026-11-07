import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext.jsx';
import { 
  Swords, 
  Shield, 
  Heart, 
  MapPin, 
  AlertTriangle, 
  Brain, 
  Dices, 
  Bookmark, 
  Copy, 
  Check, 
  Trash2, 
  RotateCcw,
  Mountain,
  Compass,
  Award,
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';
import { 
  ENCOUNTER_TYPES,
  BIOMES, 
  generateRandomEncounter 
} from '../data/encounterData.js';

export default function EncounterGenerator({ onSendToInitiative, onSendToNotes }) {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const [selectedType, setSelectedType] = useState('any');
  const [selectedBiome, setSelectedBiome] = useState('any');
  const [partySize, setPartySize] = useState(4);
  const [partyLevel, setPartyLevel] = useState(3);

  const [currentEncounter, setCurrentEncounter] = useState(() => {
    try {
      const cached = localStorage.getItem('dnd_active_encounter');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.title_en && parsed.biomeLabel_en) {
          return parsed;
        }
      }
      return generateRandomEncounter('any', 'any', 4, 3, { language });
    } catch {
      return generateRandomEncounter('any', 'any', 4, 3, { language });
    }
  });

  const [savedEncounters, setSavedEncounters] = useState(() => {
    try {
      const saved = localStorage.getItem('dnd_saved_encounters');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copied, setCopied] = useState(false);

  // Обновление локализованных полей при смене языка
  useEffect(() => {
    if (!currentEncounter || !currentEncounter.title_en || !currentEncounter.biomeLabel_en) {
      setCurrentEncounter(generateRandomEncounter(
        selectedType, 
        selectedBiome, 
        Number(partySize), 
        Number(partyLevel), 
        { language }
      ));
    }
  }, [language]);

  useEffect(() => {
    if (currentEncounter) {
      try {
        localStorage.setItem('dnd_active_encounter', JSON.stringify(currentEncounter));
      } catch (e) {
        console.warn('Не удалось закешировать активный энкаунтер', e);
      }
    }
  }, [currentEncounter]);

  useEffect(() => {
    try {
      localStorage.setItem('dnd_saved_encounters', JSON.stringify(savedEncounters));
    } catch (e) {
      console.warn('Не удалось сохранить список энкаунтеров', e);
    }
  }, [savedEncounters]);

  const handleGenerate = (forceRandom = false) => {
    const type = forceRandom ? 'any' : selectedType;
    const biome = forceRandom ? 'any' : selectedBiome;
    if (forceRandom) {
      setSelectedType('any');
      setSelectedBiome('any');
    }
    setCurrentEncounter(generateRandomEncounter(type, biome, Number(partySize), Number(partyLevel), { language }));
  };

  const isSaved = savedEncounters.some(e => e.id === currentEncounter?.id);

  const toggleSaveEncounter = () => {
    if (!currentEncounter) return;
    if (isSaved) {
      setSavedEncounters(savedEncounters.filter(e => e.id !== currentEncounter.id));
    } else {
      setSavedEncounters([currentEncounter, ...savedEncounters]);
    }
  };

  const removeSavedEncounter = (id, e) => {
    e.stopPropagation();
    setSavedEncounters(savedEncounters.filter(enc => enc.id !== id));
  };

  // Локализованные поля текущего энкаунтера
  const encTitle = isEn ? (currentEncounter?.title_en || currentEncounter?.title) : (currentEncounter?.title_ru || currentEncounter?.title);
  const encTypeLabel = isEn ? (currentEncounter?.typeLabel_en || currentEncounter?.typeLabel) : (currentEncounter?.typeLabel_ru || currentEncounter?.typeLabel);
  const encBiomeLabel = isEn ? (currentEncounter?.biomeLabel_en || currentEncounter?.biomeLabel) : (currentEncounter?.biomeLabel_ru || currentEncounter?.biomeLabel);
  const encHazardLevel = isEn ? (currentEncounter?.hazardLevel_en || currentEncounter?.hazardLevel) : (currentEncounter?.hazardLevel_ru || currentEncounter?.hazardLevel);
  const encTrigger = isEn ? (currentEncounter?.trigger_en || currentEncounter?.trigger) : (currentEncounter?.trigger_ru || currentEncounter?.trigger);
  const encDescription = isEn ? (currentEncounter?.description_en || currentEncounter?.description) : (currentEncounter?.description_ru || currentEncounter?.description);
  const encConsequences = isEn ? (currentEncounter?.consequences_en || currentEncounter?.consequences) : (currentEncounter?.consequences_ru || currentEncounter?.consequences);
  const encCountermeasures = isEn ? (currentEncounter?.countermeasures_en || currentEncounter?.countermeasures) : (currentEncounter?.countermeasures_ru || currentEncounter?.countermeasures);
  const encVibe = isEn ? (currentEncounter?.vibe_en || currentEncounter?.vibe) : (currentEncounter?.vibe_ru || currentEncounter?.vibe);
  const encDilemma = isEn ? (currentEncounter?.dilemma_en || currentEncounter?.dilemma) : (currentEncounter?.dilemma_ru || currentEncounter?.dilemma);
  const encReward = isEn ? (currentEncounter?.reward_en || currentEncounter?.reward) : (currentEncounter?.reward_ru || currentEncounter?.reward);
  const encDifficulty = isEn ? (currentEncounter?.difficulty_en || currentEncounter?.difficulty) : (currentEncounter?.difficulty_ru || currentEncounter?.difficulty);
  const encComplication = isEn ? (currentEncounter?.complication_en || currentEncounter?.complication) : (currentEncounter?.complication_ru || currentEncounter?.complication);
  const encTactics = isEn ? (currentEncounter?.tactics_en || currentEncounter?.tactics) : (currentEncounter?.tactics_ru || currentEncounter?.tactics);

  const handleCopy = () => {
    if (!currentEncounter) return;

    let text = '';
    if (currentEncounter.type === 'hazard') {
      const checkLines = (currentEncounter.checks || []).map(c => {
        const s = isEn ? (c.skill_en || c.skill) : (c.skill_ru || c.skill);
        const e = isEn ? (c.effect_en || c.effect) : (c.effect_ru || c.effect);
        return `• ${s} — ${e}`;
      }).join('\n');

      text = isEn ? [
        `⛰️ ENVIRONMENTAL HAZARD: ${encTitle}`,
        `📍 Biome: ${encBiomeLabel} | Threat: ${encHazardLevel} (DC ${currentEncounter.dc})`,
        `⚡ Trigger: ${encTrigger}`,
        '',
        `📖 Description: ${encDescription}`,
        '',
        `🎲 CHECKS & SAVING THROWS:`,
        checkLines,
        '',
        `⚠️ Consequences of Failure: ${encConsequences}`,
        `🛡️ Countermeasures: ${encCountermeasures}`
      ].join('\n') : [
        `⛰️ ПРИРОДНАЯ ОПАСНОСТЬ: ${encTitle}`,
        `📍 Биом: ${encBiomeLabel} | Угроза: ${encHazardLevel} (Сл ${currentEncounter.dc})`,
        `⚡ Триггер: ${encTrigger}`,
        '',
        `📖 Описание: ${encDescription}`,
        '',
        `🎲 ПРОВЕРКИ И СПАСБРОСКИ ДЛЯ ИГРОКОВ:`,
        checkLines,
        '',
        `⚠️ Последствия провала: ${encConsequences}`,
        `🛡️ Возможные контрмеры: ${encCountermeasures}`
      ].join('\n');
    } else if (currentEncounter.type === 'event') {
      text = isEn ? [
        `🧭 TRAVEL EVENT: ${encTitle}`,
        `📍 Biome: ${encBiomeLabel} | Vibe: ${encVibe}`,
        '',
        `📖 Situation: ${encDescription}`,
        '',
        `⚖️ Dilemma: ${encDilemma}`,
        `🎁 Outcome / Reward: ${encReward}`
      ].join('\n') : [
        `🧭 ДОРОЖНОЕ СОБЫТИЕ: ${encTitle}`,
        `📍 Биом: ${encBiomeLabel} | Характер: ${encVibe}`,
        '',
        `📖 Ситуация: ${encDescription}`,
        '',
        `⚖️ Дилемма: ${encDilemma}`,
        `🎁 Награда / Исход: ${encReward}`
      ].join('\n');
    } else {
      const rosterLines = (currentEncounter.roster || []).map(r => {
        const rName = isEn ? (r.name_en || r.name) : (r.name_ru || r.name);
        const rRole = isEn ? (r.role_en || r.role) : (r.role_ru || r.role);
        return isEn
          ? `• ${r.count}x ${rName} (CR ${r.cr}, AC ${r.ac}, HP ${r.hp}, ${rRole})`
          : `• ${r.count}x ${rName} (CR ${r.cr}, КД ${r.ac}, ХП ${r.hp}, ${rRole})`;
      }).join('\n');

      text = isEn ? [
        `⚔️ COMBAT AMBUSH: ${encTitle}`,
        `📍 Biome: ${encBiomeLabel} | Party: ${currentEncounter.partySize} players (LvL ${currentEncounter.partyLevel})`,
        `🔥 Difficulty: ${encDifficulty} (Adj. XP: ${currentEncounter.adjustedXP}, Raw: ${currentEncounter.rawXP})`,
        '',
        `👹 ENEMY ROSTER:`,
        rosterLines,
        '',
        `⚡ TACTICAL COMPLICATION:`,
        encComplication,
        '',
        `🧠 TACTICS & BEHAVIOR:`,
        encTactics
      ].join('\n') : [
        `⚔️ БОЕВОЕ СТОЛКНОВЕНИЕ: ${encTitle}`,
        `📍 Биом: ${encBiomeLabel} | Отряд: ${currentEncounter.partySize} игр. (${currentEncounter.partyLevel} ур.)`,
        `🔥 Сложность: ${encDifficulty} (Скорр. XP: ${currentEncounter.adjustedXP}, Базовый: ${currentEncounter.rawXP})`,
        '',
        `👹 ВРАГИ:`,
        rosterLines,
        '',
        `⚡ ТАКТИЧЕСКОЕ ОСЛОЖНЕНИЕ:`,
        encComplication,
        '',
        `🧠 ТАКТИКА И ПОВЕДЕНИЕ:`,
        encTactics
      ].join('\n');
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendRosterToInitiative = () => {
    if (!currentEncounter || !currentEncounter.roster || !onSendToInitiative) return;
    const localizedRoster = currentEncounter.roster.map(r => ({
      ...r,
      name: isEn ? (r.name_en || r.name) : (r.name_ru || r.name)
    }));
    onSendToInitiative(localizedRoster, encTitle);
  };

  const handleSendEncounterToNotes = () => {
    if (!currentEncounter || !onSendToNotes) return;
    let text = '';
    if (currentEncounter.type === 'hazard') {
      const checkLines = (currentEncounter.checks || []).map(c => {
        const s = isEn ? (c.skill_en || c.skill) : (c.skill_ru || c.skill);
        const e = isEn ? (c.effect_en || c.effect) : (c.effect_ru || c.effect);
        return `• ${s} — ${e}`;
      }).join('\n');

      text = isEn ? [
        `【 ⛰️ Environmental Hazard: ${encTitle} 】`,
        `Biome: ${encBiomeLabel} | Threat: ${encHazardLevel} (DC ${currentEncounter.dc})`,
        `Trigger: ${encTrigger}`,
        '',
        `Description: ${encDescription}`,
        '',
        `🎲 Saving Throws & Checks:`,
        checkLines,
        '',
        `⚠️ Consequences: ${encConsequences}`,
        `🛡️ Countermeasures: ${encCountermeasures}`
      ].join('\n') : [
        `【 ⛰️ Природная Опасность: ${encTitle} 】`,
        `Биом: ${encBiomeLabel} | Угроза: ${encHazardLevel} (Сл ${currentEncounter.dc})`,
        `Триггер: ${encTrigger}`,
        '',
        `Описание: ${encDescription}`,
        '',
        `🎲 Спасброски и проверки:`,
        checkLines,
        '',
        `⚠️ Последствия провала: ${encConsequences}`,
        `🛡️ Контрмеры: ${encCountermeasures}`
      ].join('\n');
    } else if (currentEncounter.type === 'event') {
      text = isEn ? [
        `【 🧭 Travel Event: ${encTitle} 】`,
        `Biome: ${encBiomeLabel} | Vibe: ${encVibe}`,
        '',
        `Situation: ${encDescription}`,
        '',
        `⚖️ Dilemma: ${encDilemma}`,
        `🎁 Potential Outcome: ${encReward}`
      ].join('\n') : [
        `【 🧭 Дорожное Событие: ${encTitle} 】`,
        `Биом: ${encBiomeLabel} | Атмосфера: ${encVibe}`,
        '',
        `Ситуация: ${encDescription}`,
        '',
        `⚖️ Дилемма: ${encDilemma}`,
        `🎁 Возможный исход: ${encReward}`
      ].join('\n');
    } else {
      const rosterLines = (currentEncounter.roster || []).map(r => {
        const rName = isEn ? (r.name_en || r.name) : (r.name_ru || r.name);
        const rRole = isEn ? (r.role_en || r.role) : (r.role_ru || r.role);
        return isEn
          ? `• ${r.count}× ${rName} (AC ${r.ac}, HP ${r.hp}, CR ${r.cr}, ${rRole})`
          : `• ${r.count}× ${rName} (КД ${r.ac}, HP ${r.hp}, CR ${r.cr}, ${rRole})`;
      }).join('\n');

      text = isEn ? [
        `【 ⚔️ Combat Encounter: ${encTitle} 】`,
        `Biome: ${encBiomeLabel} | Difficulty: ${encDifficulty} (${currentEncounter.rawXP} XP)`,
        '',
        `Enemies:`,
        rosterLines,
        '',
        `⚡ Complication: ${encComplication}`,
        '',
        `🧠 Enemy Tactics: ${encTactics}`
      ].join('\n') : [
        `【 ⚔️ Боевое Столкновение: ${encTitle} 】`,
        `Биом: ${encBiomeLabel} | Сложность: ${encDifficulty} (${currentEncounter.rawXP} XP)`,
        '',
        `Враги:`,
        rosterLines,
        '',
        `⚡ Осложнение боя: ${encComplication}`,
        '',
        `🧠 Поведение врагов: ${encTactics}`
      ].join('\n');
    }
    onSendToNotes(text, encTitle);
  };

  const getEmojiForType = (type) => {
    if (type === 'hazard') return '⛰️';
    if (type === 'event') return '🧭';
    return '⚔️';
  };

  return (
    <div>
      {/* Шапка подраздела */}
      <div className="generators-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Swords size={26} color="#f2f3f5" />
          <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-title)' }}>
            {t('generators.encounters.title')}
          </h2>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          {t('generators.encounters.desc')}
        </p>
      </div>

      {/* Горизонтальная панель фильтров */}
      <div className="generators-toolbar">
        <div className="filters-group">
          {/* Тип энкаунтера */}
          <div className="filter-item">
            <label>{t('generators.encounters.type')}</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="curtain-select filter-select"
            >
              {ENCOUNTER_TYPES.map(tItem => (
                <option key={tItem.id} value={tItem.id}>
                  {isEn ? (tItem.label_en || tItem.label) : tItem.label}
                </option>
              ))}
            </select>
          </div>

          {/* Биом */}
          <div className="filter-item">
            <label>{t('generators.encounters.biome')}</label>
            <select 
              value={selectedBiome} 
              onChange={(e) => setSelectedBiome(e.target.value)}
              className="curtain-select filter-select"
            >
              {BIOMES.map(b => (
                <option key={b.id} value={b.id}>
                  {isEn ? (b.label_en || b.label) : b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Параметры отряда (нужны для боев) */}
          {(selectedType === 'combat' || selectedType === 'any') && (
            <>
              <div className="filter-item">
                <label>{t('generators.encounters.players')}</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={partySize} 
                  onChange={(e) => setPartySize(Math.max(1, parseInt(e.target.value) || 1))}
                  className="curtain-select filter-select"
                  style={{ width: '65px', minWidth: '65px', textAlign: 'center' }}
                />
              </div>

              <div className="filter-item">
                <label>{t('generators.encounters.level')}</label>
                <input 
                  type="number" 
                  min="1" 
                  max="20" 
                  value={partyLevel} 
                  onChange={(e) => setPartyLevel(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="curtain-select filter-select"
                  style={{ width: '65px', minWidth: '65px', textAlign: 'center' }}
                />
              </div>
            </>
          )}
        </div>

        <div className="gen-buttons-group">
          <button 
            type="button" 
            className="trials-btn primary gen-main-btn"
            onClick={() => handleGenerate(false)}
          >
            <Dices size={18} /> {t('generators.encounters.generateBtn')}
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={() => handleGenerate(true)}
            title={isEn ? 'Full random encounter' : 'Полный рандом'}
          >
            <RotateCcw size={16} /> {t('generators.actions.fullRandom')}
          </button>
        </div>
      </div>

      {/* Основная сетка */}
      <div className="generators-main-layout">
        
        {/* Карточка энкаунтера */}
        {currentEncounter && (
          <div className="npc-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Шапка карточки */}
            <div className="npc-card-header">
              <div className="npc-avatar-box">
                <span className="npc-race-emoji">{getEmojiForType(currentEncounter.type)}</span>
              </div>
              <div className="npc-title-box">
                <h3 className="npc-name">{encTitle}</h3>
                <div className="npc-meta-row">
                  <span className="npc-tag highlight">{encTypeLabel}</span>
                  <span className="npc-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                    {encBiomeLabel}
                  </span>
                  {currentEncounter.type === 'hazard' && (
                    <span className="npc-tag" style={{ color: '#f97316', borderColor: 'rgba(249, 115, 22, 0.3)' }}>
                      {encHazardLevel} ({isEn ? `DC ${currentEncounter.dc}` : `Сл ${currentEncounter.dc}`})
                    </span>
                  )}
                  {currentEncounter.type === 'event' && (
                    <span className="npc-tag" style={{ color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
                      {encVibe}
                    </span>
                  )}
                  {currentEncounter.type === 'combat' && (
                    <span className="npc-tag" style={{ color: currentEncounter.badgeColor, borderColor: `${currentEncounter.badgeColor}50` }}>
                      {encDifficulty} {isEn ? 'encounter' : 'бой'}
                    </span>
                  )}
                </div>
              </div>

              <div className="npc-actions-box">
                <button 
                  type="button" 
                  className={`trials-btn secondary icon-btn ${isSaved ? 'active' : ''}`}
                  onClick={toggleSaveEncounter}
                  title={isSaved ? (isEn ? 'Remove from saved' : 'Удалить из сохраненных') : (isEn ? 'Bookmark encounter' : 'Сохранить энкаунтер')}
                >
                  <Bookmark size={17} color={isSaved ? '#f2f3f5' : 'currentColor'} />
                </button>
                {currentEncounter.type === 'combat' && (
                  <button 
                    type="button" 
                    className="trials-btn secondary icon-btn"
                    onClick={handleSendRosterToInitiative}
                    title={isEn ? 'Send enemy roster to Table Initiative' : 'Отправить врагов в трекер Инициативы на Стол'}
                  >
                    <Swords size={17} color="var(--accent-red)" />
                  </button>
                )}
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleSendEncounterToNotes}
                  title={isEn ? 'Send encounter description to DM Notes' : 'Отправить описание энкаунтера в Заметки на Стол'}
                >
                  <FileText size={17} />
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleCopy}
                  title={isEn ? 'Copy encounter to clipboard' : 'Скопировать энкаунтер'}
                >
                  {copied ? <Check size={17} color="#22c55e" /> : <Copy size={17} />}
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={() => handleGenerate(false)}
                  title={isEn ? 'Reroll encounter' : 'Сгенерировать заново'}
                >
                  <RotateCcw size={17} />
                </button>
              </div>
            </div>

            {/* ВАРИАНТ 1: ПРИРОДНОЕ БЕДСТВИЕ (HAZARD) */}
            {currentEncounter.type === 'hazard' && (
              <>
                {/* Описание происшествия */}
                <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-title)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 'bold' }}>
                    ⚡ {isEn ? 'Sudden Calamity:' : 'Внезапное происшествие:'}
                  </div>
                  <p style={{ margin: '0 0 10px 0', color: 'var(--text-title)', fontSize: '15px', lineHeight: '1.5' }}>
                    {encDescription}
                  </p>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    <strong>{t('generators.encounters.trigger')}</strong> {encTrigger}
                  </div>
                </div>

                {/* Проверки и спасброски для игроков */}
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 10px 0', fontSize: '14px', color: 'var(--text-title)' }}>
                    <Dices size={16} color="#949ba4" />
                    {t('generators.encounters.checks')}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(currentEncounter.checks || []).map((chk, idx) => {
                      const s = isEn ? (chk.skill_en || chk.skill) : (chk.skill_ru || chk.skill);
                      const e = isEn ? (chk.effect_en || chk.effect) : (chk.effect_ru || chk.effect);
                      return (
                        <div 
                          key={idx}
                          style={{ 
                            padding: '12px 14px', 
                            borderRadius: '8px', 
                            backgroundColor: 'var(--bg-app)', 
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-title)' }}>
                            🎲 {s}
                          </span>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                            {e}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Последствия и Контрмеры */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                      <AlertTriangle size={16} /> {t('generators.encounters.consequences')}
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                      {encConsequences}
                    </p>
                  </div>

                  <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                      <Brain size={16} /> {t('generators.encounters.countermeasures')}
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                      {encCountermeasures}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* ВАРИАНТ 2: ДОРОЖНОЕ ПРОИСШЕСТВИЕ (EVENT) */}
            {currentEncounter.type === 'event' && (
              <>
                <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 'bold' }}>
                    {isEn ? 'Setting & Situation:' : 'Обстановка и встреча:'}
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-title)', fontSize: '15px', lineHeight: '1.5' }}>
                    {encDescription}
                  </p>
                </div>

                <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
                    <HelpCircle size={16} /> {t('generators.encounters.dilemma')}
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)', lineHeight: '1.5' }}>
                    {encDilemma}
                  </p>
                </div>

                <div style={{ backgroundColor: 'rgba(74, 222, 128, 0.08)', padding: '14px 16px', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px' }}>
                    <Sparkles size={16} /> {t('generators.encounters.rewardOutcome')}
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                    {encReward}
                  </p>
                </div>
              </>
            )}

            {/* ВАРИАНТ 3: БОЕВАЯ СТЫЧКА (COMBAT) */}
            {currentEncounter.type === 'combat' && (
              <>
                {/* Оценка сложности */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '14px 18px', 
                  borderRadius: '8px', 
                  backgroundColor: 'var(--bg-app)', 
                  border: '1px solid var(--border-color)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      backgroundColor: `${currentEncounter.badgeColor}25`, 
                      color: currentEncounter.badgeColor, 
                      fontWeight: 'bold', 
                      fontSize: '14px',
                      border: `1px solid ${currentEncounter.badgeColor}60`
                    }}>
                      {encDifficulty} {isEn ? 'encounter' : 'бой'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {isEn 
                        ? `Thresholds: Easy ${currentEncounter.partyThresholds?.easy} • Med ${currentEncounter.partyThresholds?.medium} • Hard ${currentEncounter.partyThresholds?.hard}`
                        : `пороги группы: Лёгкий ${currentEncounter.partyThresholds?.easy} • Средний ${currentEncounter.partyThresholds?.medium} • Опасный ${currentEncounter.partyThresholds?.hard}`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{isEn ? 'Adjusted XP: ' : 'Скорр. опыт: '}</span>
                      <strong style={{ color: 'var(--text-title)' }}>{currentEncounter.adjustedXP} XP</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{isEn ? 'Reward XP: ' : 'Награда: '}</span>
                      <strong style={{ color: 'var(--text-title)' }}>{currentEncounter.rawXP} XP</strong>
                    </div>
                  </div>
                </div>

                {/* Враги */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 12px 0', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '15px', color: 'var(--text-title)' }}>
                      <Swords size={17} color="var(--accent-red)" />
                      {t('generators.encounters.enemies')}
                    </h4>
                    <button 
                      type="button" 
                      className="trials-btn primary"
                      onClick={handleSendRosterToInitiative}
                      style={{ fontSize: '12px', padding: '5px 12px', gap: '6px' }}
                      title={isEn ? 'Send enemy roster to Table Initiative tracker' : 'Добавить всех врагов с КД и HP в трекер Инициативы на Столе'}
                    >
                      <Swords size={14} /> {t('generators.encounters.sendInitiative')}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentEncounter.roster?.map((m, idx) => {
                      const mName = isEn ? (m.name_en || m.name) : (m.name_ru || m.name);
                      const mRole = isEn ? (m.role_en || m.role) : (m.role_ru || m.role);
                      return (
                        <div key={idx} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          padding: '12px 16px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bg-app)',
                          border: '1px solid var(--border-color)',
                          flexWrap: 'wrap',
                          gap: '10px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ 
                              fontSize: '16px', 
                              fontWeight: 'bold', 
                              color: 'var(--text-title)',
                              minWidth: '28px' 
                            }}>
                              {m.count}×
                            </span>
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-title)' }}>
                                {mName}
                              </div>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {mRole} • {isEn ? `CR: ${m.cr} (${m.xp} XP each)` : `Опасность (CR): ${m.cr} (${m.xp} XP каждый)`}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              padding: '3px 8px', 
                              borderRadius: '4px',
                              backgroundColor: 'rgba(56, 189, 248, 0.1)',
                              color: '#38bdf8',
                              fontSize: '13px',
                              fontWeight: 'bold'
                            }}>
                              <Shield size={14} /> {isEn ? `AC ${m.ac}` : `КД ${m.ac}`}
                            </span>
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              padding: '3px 8px', 
                              borderRadius: '4px',
                              backgroundColor: 'rgba(74, 222, 128, 0.1)',
                              color: '#4ade80',
                              fontSize: '13px',
                              fontWeight: 'bold'
                            }}>
                              <Heart size={14} /> {isEn ? `${m.hp} HP` : `${m.hp} ХП`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Осложнения и тактика */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div style={{ backgroundColor: 'var(--bg-app)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-title)', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                      <AlertTriangle size={16} /> {t('generators.encounters.complication')}
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                      {encComplication}
                    </p>
                  </div>

                  <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                      <Brain size={16} /> {t('generators.encounters.tactics')}
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                      {encTactics}
                    </p>
                  </div>
                </div>
              </>
            )}

          </div>
        )}

        {/* Правая панель: Сохраненные энкаунтеры */}
        <div className="saved-npcs-sidebar">
          <div className="saved-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={16} color="#949ba4" />
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)' }}>
                {t('generators.encounters.notepad', { count: savedEncounters.length })}
              </h4>
            </div>
            {savedEncounters.length > 0 && (
              <button 
                type="button" 
                className="clean-btn" 
                onClick={() => setSavedEncounters([])}
                title={t('common.clear')}
              >
                {t('common.clear')}
              </button>
            )}
          </div>

          <p style={{ margin: '4px 0 10px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            {isEn 
              ? 'Save prepared encounters and unexpected events for your campaign.'
              : 'Сохраняйте заготовленные столкновения и неожиданные события перед сессией.'}
          </p>

          <div className="saved-list">
            {savedEncounters.length === 0 ? (
              <div className="saved-empty-state">
                <span>⚔️</span>
                <p>{t('generators.encounters.notepadEmpty')}</p>
              </div>
            ) : (
              savedEncounters.map(item => {
                const sTitle = isEn ? (item.title_en || item.title) : (item.title_ru || item.title);
                const sType = isEn ? (item.typeLabel_en || item.typeLabel) : (item.typeLabel_ru || item.typeLabel);
                const sBiome = isEn ? (item.biomeLabel_en || item.biomeLabel) : (item.biomeLabel_ru || item.biomeLabel);
                return (
                  <div 
                    key={item.id} 
                    className={`saved-npc-item ${currentEncounter?.id === item.id ? 'active' : ''}`}
                    onClick={() => setCurrentEncounter(item)}
                  >
                    <span className="item-icon">{getEmojiForType(item.type)}</span>
                    <div className="item-info">
                      <span className="item-name">{sTitle}</span>
                      <span className="item-meta">{sType} • {sBiome}</span>
                    </div>
                    <button 
                      type="button" 
                      className="item-delete-btn" 
                      onClick={(e) => removeSavedEncounter(item.id, e)}
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
