import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Dices, 
  User, 
  Volume2, 
  Eye, 
  Brain, 
  Bookmark, 
  BookmarkCheck, 
  Copy, 
  Check, 
  Trash2, 
  RotateCcw,
  MessageSquareQuote,
  ShieldAlert
} from 'lucide-react';
import { 
  RACES_DATA, 
  OCCUPATIONS, 
  VOICE_DATA, 
  APPEARANCE_FEATURES, 
  PERSONALITY_TRAITS, 
  SECRETS_MOTIVATIONS, 
  generateRandomNPC 
} from '../data/npcData.js';

export default function GeneratorsTab() {
  // Фильтры
  const [selectedRace, setSelectedRace] = useState('any');
  const [selectedGender, setSelectedGender] = useState('any');
  const [selectedOccupation, setSelectedOccupation] = useState('any');

  // Текущий NPC
  const [currentNPC, setCurrentNPC] = useState(() => generateRandomNPC());

  // Сохраненные NPC (из localStorage)
  const [savedNPCs, setSavedNPCs] = useState(() => {
    try {
      const saved = localStorage.getItem('dnd_saved_npcs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copied, setCopied] = useState(false);

  // Синхронизация сохраненных с localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dnd_saved_npcs', JSON.stringify(savedNPCs));
    } catch (e) {
      console.warn('Не удалось сохранить NPC в localStorage', e);
    }
  }, [savedNPCs]);

  // Генерация нового NPC с учётом фильтров
  const handleGenerate = (forceRandom = false) => {
    const options = forceRandom ? {} : {
      race: selectedRace,
      gender: selectedGender,
      occupation: selectedOccupation
    };
    if (forceRandom) {
      setSelectedRace('any');
      setSelectedGender('any');
      setSelectedOccupation('any');
    }
    const npc = generateRandomNPC(options);
    setCurrentNPC(npc);
  };

  // Перегенерация отдельных параметров
  const handleRerollField = (field) => {
    if (!currentNPC) return;
    if (field === 'name') {
      const race = RACES_DATA[currentNPC.raceId] || RACES_DATA.human;
      const isMale = currentNPC.gender === 'Мужчина';
      const pool = isMale ? race.maleNames : race.femaleNames;
      const firstName = pool[Math.floor(Math.random() * pool.length)];
      let surname = currentNPC.surname;
      if (race.clans && race.clans.length > 0) {
        surname = race.clans[Math.floor(Math.random() * race.clans.length)];
      }
      let epithet = currentNPC.epithet;
      if (race.epithets && race.epithets.length > 0 && Math.random() < 0.75) {
        epithet = race.epithets[Math.floor(Math.random() * race.epithets.length)];
      }
      let fullName = '';
      if (currentNPC.raceId === 'orc') {
        fullName = epithet ? `${firstName} ${epithet}` : firstName;
      } else if (currentNPC.raceId === 'tiefling') {
        fullName = epithet ? `${firstName} «${epithet}»` : firstName;
      } else {
        fullName = epithet ? `${firstName} «${epithet}» ${surname}`.trim() : `${firstName} ${surname}`.trim();
      }
      setCurrentNPC({ ...currentNPC, firstName, surname, epithet, fullName });
    } else if (field === 'voice') {
      const v = VOICE_DATA[Math.floor(Math.random() * VOICE_DATA.length)];
      const q = v.quotes[Math.floor(Math.random() * v.quotes.length)];
      setCurrentNPC({
        ...currentNPC,
        voice: { pitch: v.pitch, manner: v.manner, actingTip: v.actingTip, quote: q }
      });
    } else if (field === 'appearance') {
      const a = APPEARANCE_FEATURES[Math.floor(Math.random() * APPEARANCE_FEATURES.length)];
      setCurrentNPC({ ...currentNPC, appearance: a });
    } else if (field === 'personality') {
      const p = PERSONALITY_TRAITS[Math.floor(Math.random() * PERSONALITY_TRAITS.length)];
      const s = SECRETS_MOTIVATIONS[Math.floor(Math.random() * SECRETS_MOTIVATIONS.length)];
      setCurrentNPC({ ...currentNPC, personality: p, secret: s });
    }
  };

  // Сохранить / удалить из сохраненных
  const isCurrentSaved = savedNPCs.some(n => n.id === currentNPC?.id);

  const toggleSaveCurrent = () => {
    if (!currentNPC) return;
    if (isCurrentSaved) {
      setSavedNPCs(savedNPCs.filter(n => n.id !== currentNPC.id));
    } else {
      setSavedNPCs([currentNPC, ...savedNPCs]);
    }
  };

  const removeSavedNPC = (id, e) => {
    e.stopPropagation();
    setSavedNPCs(savedNPCs.filter(n => n.id !== id));
  };

  // Копирование в буфер
  const handleCopy = () => {
    if (!currentNPC) return;
    const text = [
      `👤 ${currentNPC.fullName} (${currentNPC.raceName}, ${currentNPC.gender})`,
      `💼 Профессия: ${currentNPC.occupation} | Мировоззрение: ${currentNPC.alignment}`,
      `🎭 Голос: ${currentNPC.voice.pitch}`,
      `🗣️ Манера речи: ${currentNPC.voice.manner}`,
      `💬 Фраза: "${currentNPC.voice.quote}"`,
      `👁️ Внешность: ${currentNPC.appearance}`,
      `🧠 Характер: ${currentNPC.personality}`,
      `🤫 Тайна: ${currentNPC.secret}`
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="generators-container">
      {/* Шапка раздела */}
      <div className="generators-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={26} color="var(--accent-gold)" />
          <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-title)' }}>Генератор NPC</h2>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Мгновенное создание персонажей с аутентичными именами, прозвищами и подсказками для отыгрыша голосом.
        </p>
      </div>

      {/* Панель фильтров и генерации */}
      <div className="generators-toolbar">
        <div className="filters-group">
          {/* Раса */}
          <div className="filter-item">
            <label>Раса:</label>
            <select 
              value={selectedRace} 
              onChange={(e) => setSelectedRace(e.target.value)}
              className="curtain-select filter-select"
            >
              <option value="any">🎲 Любая раса</option>
              {Object.values(RACES_DATA).map(r => (
                <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
              ))}
            </select>
          </div>

          {/* Пол */}
          <div className="filter-item">
            <label>Пол:</label>
            <select 
              value={selectedGender} 
              onChange={(e) => setSelectedGender(e.target.value)}
              className="curtain-select filter-select"
            >
              <option value="any">🎲 Любой пол</option>
              <option value="male">Мужчина</option>
              <option value="female">Женщина</option>
            </select>
          </div>

          {/* Профессия */}
          <div className="filter-item">
            <label>Занятие / Роль:</label>
            <select 
              value={selectedOccupation} 
              onChange={(e) => setSelectedOccupation(e.target.value)}
              className="curtain-select filter-select"
            >
              <option value="any">🎲 Любое занятие</option>
              {OCCUPATIONS.map(occ => (
                <option key={occ.name} value={occ.name}>{occ.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Кнопки генерации */}
        <div className="gen-buttons-group">
          <button 
            type="button" 
            className="trials-btn primary gen-main-btn"
            onClick={() => handleGenerate(false)}
          >
            <Dices size={18} /> Сгенерировать NPC
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={() => handleGenerate(true)}
            title="Сбросить фильтры и выдать полностью случайного персонажа"
          >
            <RotateCcw size={16} /> Полный рандом
          </button>
        </div>
      </div>

      {/* Основная сетка: Карточка персонажа + Список сохраненных */}
      <div className="generators-main-layout">
        
        {/* Карточка текущего NPC */}
        {currentNPC && (
          <div className="npc-card">
            {/* Шапка карточки */}
            <div className="npc-card-header">
              <div className="npc-avatar-box">
                <span className="npc-race-emoji">{currentNPC.raceIcon}</span>
              </div>

              <div className="npc-title-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 className="npc-name">{currentNPC.fullName}</h3>
                  {currentNPC.epithet && (
                    <span className="npc-epithet-badge" title="Прозвище или титул за заслуги">
                      ✨ {currentNPC.epithet}
                    </span>
                  )}
                </div>
                <div className="npc-meta-row">
                  <span className="npc-tag">{currentNPC.raceName}</span>
                  <span className="npc-tag">{currentNPC.gender}</span>
                  <span className="npc-tag highlight">{currentNPC.occupation}</span>
                  <span className="npc-tag subtle">{currentNPC.alignment}</span>
                </div>
              </div>

              {/* Действия карточки */}
              <div className="npc-actions-box">
                <button 
                  type="button" 
                  className={`trials-btn icon-btn ${isCurrentSaved ? 'active' : ''}`}
                  onClick={toggleSaveCurrent}
                  title={isCurrentSaved ? 'Удалить из сохраненных' : 'Сохранить NPC в список сессии'}
                >
                  {isCurrentSaved ? <BookmarkCheck size={18} color="var(--accent-gold)" /> : <Bookmark size={18} />}
                </button>
                <button 
                  type="button" 
                  className="trials-btn icon-btn"
                  onClick={handleCopy}
                  title="Скопировать описание в буфер обмена"
                >
                  {copied ? <Check size={18} color="#22c55e" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {/* БЛОК 1: ГОЛОС И ОТЫГРЫШ (ГЛАВНАЯ ФИШКА) */}
            <div className="npc-section-box voice-box">
              <div className="section-title-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Volume2 size={18} color="#f59e0b" />
                  <span className="section-title">Голос и отыгрыш для Мастера</span>
                </div>
                <button 
                  type="button" 
                  className="reroll-btn" 
                  onClick={() => handleRerollField('voice')}
                  title="Подобрать другой голос"
                >
                  <RotateCcw size={13} /> Другой голос
                </button>
              </div>

              <div className="voice-details-grid">
                <div className="voice-row">
                  <span className="voice-label">Тембр и темп:</span>
                  <span className="voice-text">{currentNPC.voice.pitch}</span>
                </div>
                <div className="voice-row">
                  <span className="voice-label">Манера речи:</span>
                  <span className="voice-text">{currentNPC.voice.manner}</span>
                </div>
                <div className="voice-row acting-tip-row">
                  <span className="voice-label">🎭 Совет к отыгрышу:</span>
                  <span className="acting-tip-text">{currentNPC.voice.actingTip}</span>
                </div>
              </div>

              {/* Пример вступительной фразы */}
              <div className="npc-quote-card">
                <MessageSquareQuote size={18} className="quote-icon" />
                <p className="quote-text">«{currentNPC.voice.quote}»</p>
              </div>
            </div>

            {/* БЛОК 2: ВНЕШНОСТЬ И ПРИМЕТА */}
            <div className="npc-section-box">
              <div className="section-title-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={17} color="#38bdf8" />
                  <span className="section-title">Внешность и заметная примета</span>
                </div>
                <button 
                  type="button" 
                  className="reroll-btn" 
                  onClick={() => handleRerollField('appearance')}
                  title="Подобрать другую внешность"
                >
                  <RotateCcw size={13} /> Другая примета
                </button>
              </div>
              <p className="section-content-text">{currentNPC.appearance}</p>
            </div>

            {/* БЛОК 3: ХАРАКТЕР И ТАЙНЫЙ МОТИВ */}
            <div className="npc-section-box">
              <div className="section-title-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Brain size={17} color="#c084fc" />
                  <span className="section-title">Характер и тайный мотив</span>
                </div>
                <button 
                  type="button" 
                  className="reroll-btn" 
                  onClick={() => handleRerollField('personality')}
                  title="Подобрать другой характер"
                >
                  <RotateCcw size={13} /> Другой мотив
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Черта: </span>
                  <span className="section-content-text">{currentNPC.personality}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#f87171', textTransform: 'uppercase', fontWeight: 'bold' }}>Тайна / Цель: </span>
                  <span className="section-content-text">{currentNPC.secret}</span>
                </div>
              </div>
            </div>

            {/* Быстрые микро-кнопки перегенерации */}
            <div className="npc-micro-rerolls">
              <button type="button" className="micro-btn" onClick={() => handleRerollField('name')}>
                🔄 Другое имя
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('voice')}>
                🎙️ Другой голос
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('appearance')}>
                👁️ Другая внешность
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('personality')}>
                🤫 Другая тайна
              </button>
            </div>
          </div>
        )}

        {/* Правая панель: Сохраненные за сессию NPC */}
        <div className="saved-npcs-sidebar">
          <div className="saved-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={16} color="var(--accent-gold)" />
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)' }}>
                Записная книжка ({savedNPCs.length})
              </h4>
            </div>
            {savedNPCs.length > 0 && (
              <button 
                type="button" 
                className="clean-btn" 
                onClick={() => setSavedNPCs([])}
                title="Очистить список"
              >
                Очистить
              </button>
            )}
          </div>

          <p style={{ margin: '4px 0 10px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            Сохраняйте персонажей, которых встретила партия, чтобы в любой момент вернуться к их голосу и описанию.
          </p>

          <div className="saved-list">
            {savedNPCs.length === 0 ? (
              <div className="saved-empty-state">
                <span>⭐</span>
                <p>Нажмите значок закладки на карточке, чтобы сохранить персонажа.</p>
              </div>
            ) : (
              savedNPCs.map(item => (
                <div 
                  key={item.id} 
                  className={`saved-npc-item ${currentNPC?.id === item.id ? 'active' : ''}`}
                  onClick={() => setCurrentNPC(item)}
                >
                  <span className="item-icon">{item.raceIcon}</span>
                  <div className="item-info">
                    <span className="item-name">{item.fullName}</span>
                    <span className="item-meta">{item.raceName} • {item.occupation}</span>
                  </div>
                  <button 
                    type="button" 
                    className="item-delete-btn" 
                    onClick={(e) => removeSavedNPC(item.id, e)}
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
