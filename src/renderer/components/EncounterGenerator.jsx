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
  Users,
  Award
} from 'lucide-react';
import { 
  BIOMES, 
  generateRandomEncounter 
} from '../data/encounterData.js';

export default function EncounterGenerator() {
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

  const handleGenerate = () => {
    setCurrentEncounter(generateRandomEncounter(selectedBiome, Number(partySize), Number(partyLevel)));
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
    const rosterLines = currentEncounter.roster
      .map(r => `• ${r.count}x ${r.name} (CR ${r.cr}, КД ${r.ac}, ХП ${r.hp}, ${r.role})`)
      .join('\n');

    const text = `⚔️ БОЕВОЕ СТОЛКНОВЕНИЕ: ${currentEncounter.title}\n` +
      `📍 Биом: ${currentEncounter.biomeLabel} | Отряд: ${currentEncounter.partySize} игр. (${currentEncounter.partyLevel} ур.)\n` +
      `🔥 Сложность: ${currentEncounter.difficulty} (Скорр. XP: ${currentEncounter.adjustedXP}, Базовый: ${currentEncounter.rawXP})\n\n` +
      `👹 ВРАГИ:\n${rosterLines}\n\n` +
      `⚡ ТАКТИЧЕСКОЕ ОСЛОЖНЕНИЕ:\n${currentEncounter.complication}\n\n` +
      `🧠 ТАКТИКА И ПОВЕДЕНИЕ:\n${currentEncounter.tactics}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="npc-generator-container">
      {/* ЛЕВАЯ ПАНЕЛЬ: Фильтры */}
      <div className="npc-controls-panel">
        <h3 className="controls-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Swords size={20} color="var(--accent-red)" />
          Параметры отряда
        </h3>

        <div className="control-group">
          <label>Окружение / Биом</label>
          <select 
            value={selectedBiome} 
            onChange={(e) => setSelectedBiome(e.target.value)}
          >
            {BIOMES.map(b => (
              <option key={b.id} value={b.id}>{b.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="control-group">
            <label>Игроков</label>
            <input 
              type="number" 
              min="1" 
              max="10" 
              value={partySize} 
              onChange={(e) => setPartySize(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-title)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div className="control-group">
            <label>Уровень отряда</label>
            <input 
              type="number" 
              min="1" 
              max="20" 
              value={partyLevel} 
              onChange={(e) => setPartyLevel(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-title)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <button 
          type="button" 
          className="generate-main-btn"
          onClick={handleGenerate}
        >
          <Dices size={18} /> Сгенерировать бой
        </button>

        {currentEncounter && (
          <div className="npc-card" style={{ marginTop: '20px', padding: '14px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={15} color="var(--accent-gold)" /> Пороги опыта отряда
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#22c55e' }}>
                <span>Легко:</span> <strong>{currentEncounter.partyThresholds?.easy} XP</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#eab308' }}>
                <span>Средне:</span> <strong>{currentEncounter.partyThresholds?.medium} XP</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f97316' }}>
                <span>Опасно:</span> <strong>{currentEncounter.partyThresholds?.hard} XP</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                <span>Смертельно:</span> <strong>{currentEncounter.partyThresholds?.deadly} XP</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ЦЕНТРАЛЬНАЯ ПАНЕЛЬ: Карточка столкновения */}
      <div className="npc-display-panel">
        {currentEncounter && (
          <div className="npc-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Шапка карточки */}
            <div className="card-top-header">
              <div className="card-main-meta">
                <span className="card-race-icon">⚔️</span>
                <div>
                  <h2 className="card-character-name" style={{ fontSize: '20px' }}>
                    {currentEncounter.title}
                  </h2>
                  <span className="card-character-sub">
                    {currentEncounter.biomeLabel} • Отряд: {currentEncounter.partySize} персонажей ({currentEncounter.partyLevel} ур.)
                  </span>
                </div>
              </div>

              <div className="card-action-btns">
                <button 
                  type="button" 
                  className={`card-tool-btn ${isSaved ? 'bookmarked' : ''}`}
                  onClick={toggleSaveEncounter}
                  title={isSaved ? 'Удалить из сохраненных' : 'Сохранить энкаунтер'}
                >
                  <Bookmark size={18} />
                </button>
                <button 
                  type="button" 
                  className="card-tool-btn"
                  onClick={handleCopy}
                  title="Скопировать энкаунтер"
                >
                  {copied ? <Check size={18} color="#22c55e" /> : <Copy size={18} />}
                </button>
                <button 
                  type="button" 
                  className="card-tool-btn"
                  onClick={handleGenerate}
                  title="Сгенерировать заново"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            {/* Блок оценки сложности и XP */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              flexWrap: 'wrap',
              gap: '12px',
              padding: '14px 18px', 
              borderRadius: '8px', 
              backgroundColor: 'var(--bg-input)', 
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
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  по шкале Dungeon Master's Guide 5e
                </span>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Скорр. опыт: </span>
                  <strong style={{ color: 'var(--text-title)' }}>{currentEncounter.adjustedXP} XP</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Базовый опыт: </span>
                  <strong style={{ color: 'var(--accent-gold)' }}>{currentEncounter.rawXP} XP</strong>
                </div>
              </div>
            </div>

            {/* Состав врагов */}
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0', fontSize: '15px', color: 'var(--text-title)' }}>
                <Swords size={18} color="var(--accent-red)" />
                Состав противников
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentEncounter.roster.map((m, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-input)',
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

                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
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

            {/* Блок осложнений и тактики */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
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

          </div>
        )}
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ: Сохраненные бои */}
      <div className="npc-saved-panel">
        <h3 className="saved-title">
          <span>Сохранённые бои</span>
          <span className="saved-count">{savedEncounters.length}</span>
        </h3>

        <div className="saved-list">
          {savedEncounters.length === 0 ? (
            <div className="saved-empty-state">
              <span>⭐</span>
              <p>Нажмите значок закладки, чтобы сохранить энкаунтер на сессию.</p>
            </div>
          ) : (
            savedEncounters.map(item => (
              <div 
                key={item.id} 
                className={`saved-npc-item ${currentEncounter?.id === item.id ? 'active' : ''}`}
                onClick={() => setCurrentEncounter(item)}
              >
                <span className="item-icon">⚔️</span>
                <div className="item-info">
                  <span className="item-name">{item.title}</span>
                  <span className="item-meta">{item.difficulty} • {item.adjustedXP} XP</span>
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
  );
}
