import React, { useState, useEffect } from 'react';
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
  const [selectedType, setSelectedType] = useState('any');
  const [selectedBiome, setSelectedBiome] = useState('any');
  const [partySize, setPartySize] = useState(4);
  const [partyLevel, setPartyLevel] = useState(3);

  const [currentEncounter, setCurrentEncounter] = useState(() => {
    try {
      const cached = localStorage.getItem('dnd_active_encounter');
      return cached ? JSON.parse(cached) : generateRandomEncounter();
    } catch {
      return generateRandomEncounter();
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
    setCurrentEncounter(generateRandomEncounter(type, biome, Number(partySize), Number(partyLevel)));
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

  const handleCopy = () => {
    if (!currentEncounter) return;

    let text = '';
    if (currentEncounter.type === 'hazard') {
      text = `⛰️ ПРИРОДНАЯ ОПАСНОСТЬ: ${currentEncounter.title}\n` +
        `📍 Биом: ${currentEncounter.biomeLabel} | Угроза: ${currentEncounter.hazardLevel} (Сл ${currentEncounter.dc})\n` +
        `⚡ Триггер: ${currentEncounter.trigger}\n\n` +
        `📖 Описание: ${currentEncounter.description}\n\n` +
        `🎲 ПРОВЕРКИ И СПАСБРОСКИ ДЛЯ ИГРОКОВ:\n` +
        currentEncounter.checks.map(c => `• ${c.skill} — ${c.effect}`).join('\n') + '\n\n' +
        `⚠️ Последствия провала: ${currentEncounter.consequences}\n` +
        `🛡️ Возможные контрмеры: ${currentEncounter.countermeasures}`;
    } else if (currentEncounter.type === 'event') {
      text = `🧭 ДОРОЖНОЕ СОБЫТИЕ: ${currentEncounter.title}\n` +
        `📍 Биом: ${currentEncounter.biomeLabel} | Характер: ${currentEncounter.vibe}\n\n` +
        `📖 Ситуация: ${currentEncounter.description}\n\n` +
        `⚖️ Дилемма: ${currentEncounter.dilemma}\n` +
        `🎁 Награда / Исход: ${currentEncounter.reward}`;
    } else {
      const rosterLines = (currentEncounter.roster || [])
        .map(r => `• ${r.count}x ${r.name} (CR ${r.cr}, КД ${r.ac}, ХП ${r.hp}, ${r.role})`)
        .join('\n');

      text = `⚔️ БОЕВОЕ СТОЛКНОВЕНИЕ: ${currentEncounter.title}\n` +
        `📍 Биом: ${currentEncounter.biomeLabel} | Отряд: ${currentEncounter.partySize} игр. (${currentEncounter.partyLevel} ур.)\n` +
        `🔥 Сложность: ${currentEncounter.difficulty} (Скорр. XP: ${currentEncounter.adjustedXP}, Базовый: ${currentEncounter.rawXP})\n\n` +
        `👹 ВРАГИ:\n${rosterLines}\n\n` +
        `⚡ ТАКТИЧЕСКОЕ ОСЛОЖНЕНИЕ:\n${currentEncounter.complication}\n\n` +
        `🧠 ТАКТИКА И ПОВЕДЕНИЕ:\n${currentEncounter.tactics}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendRosterToInitiative = () => {
    if (!currentEncounter || !currentEncounter.roster || !onSendToInitiative) return;
    onSendToInitiative(currentEncounter.roster, currentEncounter.title);
  };

  const handleSendEncounterToNotes = () => {
    if (!currentEncounter || !onSendToNotes) return;
    let text = '';
    if (currentEncounter.type === 'hazard') {
      text = `【 ⛰️ Природная Опасность: ${currentEncounter.title} 】\n` +
        `Биом: ${currentEncounter.biomeLabel} | Угроза: ${currentEncounter.hazardLevel} (Сл ${currentEncounter.dc})\n` +
        `Триггер: ${currentEncounter.trigger}\n\n` +
        `Описание: ${currentEncounter.description}\n\n` +
        `🎲 Спасброски и проверки:\n` +
        currentEncounter.checks.map(c => `• ${c.skill} — ${c.effect}`).join('\n') + '\n\n' +
        `⚠️ Последствия провала: ${currentEncounter.consequences}\n` +
        `🛡️ Контрмеры: ${currentEncounter.countermeasures}`;
    } else if (currentEncounter.type === 'event') {
      text = `【 🧭 Дорожное Событие: ${currentEncounter.title} 】\n` +
        `Биом: ${currentEncounter.biomeLabel} | Атмосфера: ${currentEncounter.vibe}\n\n` +
        `Ситуация: ${currentEncounter.description}\n\n` +
        `⚖️ Дилемма: ${currentEncounter.dilemma}\n` +
        `🎁 Возможный исход: ${currentEncounter.reward}`;
    } else {
      const rosterLines = (currentEncounter.roster || [])
        .map(r => `• ${r.count}× ${r.name} (КД ${r.ac}, HP ${r.hp}, CR ${r.cr}, ${r.role})`)
        .join('\n');

      text = `【 ⚔️ Боевое Столкновение: ${currentEncounter.title} 】\n` +
        `Биом: ${currentEncounter.biomeLabel} | Сложность: ${currentEncounter.difficulty} (${currentEncounter.rawXP} XP)\n\n` +
        `Враги:\n${rosterLines}\n\n` +
        `⚡ Осложнение боя: ${currentEncounter.complication}\n\n` +
        `🧠 Поведение врагов: ${currentEncounter.tactics}`;
    }
    onSendToNotes(text, currentEncounter.title);
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
          <Swords size={26} color="var(--accent-red)" />
          <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-title)' }}>
            Генератор Энкаунтеров и Событий
          </h2>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Боевые стычки с расчётом сложности по DMG 5e, природные опасности (камнепады, оползни, лавины) и дорожные происшествия.
        </p>
      </div>

      {/* Горизонтальная панель фильтров */}
      <div className="generators-toolbar">
        <div className="filters-group">
          {/* Тип энкаунтера */}
          <div className="filter-item">
            <label>Тип события:</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="curtain-select filter-select"
            >
              {ENCOUNTER_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Биом */}
          <div className="filter-item">
            <label>Окружение / Биом:</label>
            <select 
              value={selectedBiome} 
              onChange={(e) => setSelectedBiome(e.target.value)}
              className="curtain-select filter-select"
            >
              {BIOMES.map(b => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </div>

          {/* Параметры отряда (нужны для боев) */}
          {(selectedType === 'combat' || selectedType === 'any') && (
            <>
              <div className="filter-item">
                <label>Игроков:</label>
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
                <label>Уровень:</label>
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
            <Dices size={18} /> Сгенерировать событие
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={() => handleGenerate(true)}
            title="Полный рандом"
          >
            <RotateCcw size={16} /> Рандом
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
                <h3 className="npc-name">{currentEncounter.title}</h3>
                <div className="npc-meta-row">
                  <span className="npc-tag highlight">{currentEncounter.typeLabel}</span>
                  <span className="npc-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                    {currentEncounter.biomeLabel}
                  </span>
                  {currentEncounter.type === 'hazard' && (
                    <span className="npc-tag" style={{ color: '#f97316', borderColor: 'rgba(249, 115, 22, 0.3)' }}>
                      {currentEncounter.hazardLevel} (Сл {currentEncounter.dc})
                    </span>
                  )}
                  {currentEncounter.type === 'event' && (
                    <span className="npc-tag" style={{ color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
                      {currentEncounter.vibe}
                    </span>
                  )}
                  {currentEncounter.type === 'combat' && (
                    <span className="npc-tag" style={{ color: currentEncounter.badgeColor, borderColor: `${currentEncounter.badgeColor}50` }}>
                      {currentEncounter.difficulty} бой
                    </span>
                  )}
                </div>
              </div>

              <div className="npc-actions-box">
                <button 
                  type="button" 
                  className={`trials-btn secondary icon-btn ${isSaved ? 'active' : ''}`}
                  onClick={toggleSaveEncounter}
                  title={isSaved ? 'Удалить из сохраненных' : 'Сохранить энкаунтер'}
                >
                  <Bookmark size={17} color={isSaved ? 'var(--accent-gold)' : 'currentColor'} />
                </button>
                {currentEncounter.type === 'combat' && (
                  <button 
                    type="button" 
                    className="trials-btn secondary icon-btn"
                    onClick={handleSendRosterToInitiative}
                    title="Отправить врагов в трекер Инициативы на Стол"
                  >
                    <Swords size={17} color="var(--accent-red)" />
                  </button>
                )}
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleSendEncounterToNotes}
                  title="Отправить описание энкаунтера в Заметки на Стол"
                >
                  <FileText size={17} />
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleCopy}
                  title="Скопировать энкаунтер"
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

            {/* ВАРИАНТ 1: ПРИРОДНОЕ БЕДСТВИЕ (HAZARD) */}
            {currentEncounter.type === 'hazard' && (
              <>
                {/* Описание происшествия */}
                <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 'bold' }}>
                    ⚡ Внезапное происшествие:
                  </div>
                  <p style={{ margin: '0 0 10px 0', color: 'var(--text-title)', fontSize: '15px', lineHeight: '1.5' }}>
                    {currentEncounter.description}
                  </p>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    <strong>Причина / Триггер:</strong> {currentEncounter.trigger}
                  </div>
                </div>

                {/* Проверки и спасброски для игроков */}
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 10px 0', fontSize: '14px', color: 'var(--text-title)' }}>
                    <Dices size={16} color="var(--accent-gold)" />
                    Спасброски и проверки для игроков (бросают сами игроки за столом)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentEncounter.checks.map((chk, idx) => (
                      <div 
                        key={idx}
                        style={{ 
                          padding: '12px 14px', 
                          borderRadius: '8px', 
                          backgroundColor: 'rgba(212, 175, 55, 0.05)', 
                          border: '1px solid rgba(212, 175, 55, 0.25)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                          🎲 {chk.skill}
                        </span>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                          {chk.effect}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Последствия и Контрмеры */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                      <AlertTriangle size={16} /> Последствия провала
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                      {currentEncounter.consequences}
                    </p>
                  </div>

                  <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                      <Brain size={16} /> Варианты спасения и магия
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                      {currentEncounter.countermeasures}
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
                    Обстановка и встреча:
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-title)', fontSize: '15px', lineHeight: '1.5' }}>
                    {currentEncounter.description}
                  </p>
                </div>

                <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
                    <HelpCircle size={16} /> Развитие ситуации и выбор отряда
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)', lineHeight: '1.5' }}>
                    {currentEncounter.dilemma}
                  </p>
                </div>

                <div style={{ backgroundColor: 'rgba(74, 222, 128, 0.08)', padding: '14px 16px', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px' }}>
                    <Sparkles size={16} /> Возможная выгода / Награда
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                    {currentEncounter.reward}
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
                      {currentEncounter.difficulty} бой
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      пороги группы: Лёгкий {currentEncounter.partyThresholds?.easy} • Средний {currentEncounter.partyThresholds?.medium} • Опасный {currentEncounter.partyThresholds?.hard}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Скорр. опыт: </span>
                      <strong style={{ color: 'var(--text-title)' }}>{currentEncounter.adjustedXP} XP</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Награда: </span>
                      <strong style={{ color: 'var(--accent-gold)' }}>{currentEncounter.rawXP} XP</strong>
                    </div>
                  </div>
                </div>

                {/* Враги */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 12px 0', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '15px', color: 'var(--text-title)' }}>
                      <Swords size={17} color="var(--accent-red)" />
                      Состав противников
                    </h4>
                    <button 
                      type="button" 
                      className="trials-btn primary"
                      onClick={handleSendRosterToInitiative}
                      style={{ fontSize: '12px', padding: '5px 12px', gap: '6px' }}
                      title="Добавить всех врагов с КД и HP в трекер Инициативы на Столе"
                    >
                      <Swords size={14} /> Отправить в Инициативу
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentEncounter.roster?.map((m, idx) => (
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
                            color: 'var(--accent-gold)',
                            minWidth: '28px' 
                          }}>
                            {m.count}×
                          </span>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-title)' }}>
                              {m.name}
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {m.role} • Опасность (CR): {m.cr} ({m.xp} XP каждый)
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
                            <Shield size={14} /> КД {m.ac}
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
                            <Heart size={14} /> {m.hp} ХП
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Осложнения и тактика */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                      <AlertTriangle size={16} /> Тактическая особенность арены
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                      {currentEncounter.complication}
                    </p>
                  </div>

                  <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                      <Brain size={16} /> Поведение и тактика врагов
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                      {currentEncounter.tactics}
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
              <Bookmark size={16} color="var(--accent-gold)" />
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)' }}>
                Журнал событий ({savedEncounters.length})
              </h4>
            </div>
            {savedEncounters.length > 0 && (
              <button 
                type="button" 
                className="clean-btn" 
                onClick={() => setSavedEncounters([])}
                title="Очистить список"
              >
                Очистить
              </button>
            )}
          </div>

          <p style={{ margin: '4px 0 10px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            Сохраняйте заготовленные столкновения и неожиданные события перед сессией.
          </p>

          <div className="saved-list">
            {savedEncounters.length === 0 ? (
              <div className="saved-empty-state">
                <span>⚔️</span>
                <p>Нажмите значок закладки, чтобы сохранить энкаунтер.</p>
              </div>
            ) : (
              savedEncounters.map(item => (
                <div 
                  key={item.id} 
                  className={`saved-npc-item ${currentEncounter?.id === item.id ? 'active' : ''}`}
                  onClick={() => setCurrentEncounter(item)}
                >
                  <span className="item-icon">{getEmojiForType(item.type)}</span>
                  <div className="item-info">
                    <span className="item-name">{item.title}</span>
                    <span className="item-meta">{item.typeLabel} • {item.biomeLabel}</span>
                  </div>
                  <button 
                    type="button" 
                    className="item-delete-btn" 
                    onClick={(e) => removeSavedEncounter(item.id, e)}
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
