import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext.jsx';
import { 
  Sparkles, 
  Dices, 
  User, 
  Beer, 
  Store, 
  Scroll, 
  Swords, 
  Compass, 
  Gem,
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
  ShieldAlert,
  FileText
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
import { 
  VOICES_EN, 
  APPEARANCES_EN, 
  PERSONALITY_TRAITS_EN, 
  SECRETS_EN,
  RACES_EN
} from '../data/npcDataEn.js';
import TavernGenerator from './TavernGenerator.jsx';
import ShopGenerator from './ShopGenerator.jsx';
import QuestGenerator from './QuestGenerator.jsx';
import EncounterGenerator from './EncounterGenerator.jsx';
import DungeonGenerator from './DungeonGenerator.jsx';
import LootGenerator from './LootGenerator.jsx';

export default function GeneratorsTab({ onSendToInitiative, onSendToNotes }) {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const location = useLocation();
  const navigate = useNavigate();
  // Тип генератора определяется по подмаршруту
  let activeGenerator = 'npc';
  if (location.pathname.endsWith('/tavern')) activeGenerator = 'tavern';
  else if (location.pathname.endsWith('/shops')) activeGenerator = 'shops';
  else if (location.pathname.endsWith('/quests')) activeGenerator = 'quests';
  else if (location.pathname.endsWith('/encounters')) activeGenerator = 'encounters';
  else if (location.pathname.endsWith('/dungeon')) activeGenerator = 'dungeon';
  else if (location.pathname.endsWith('/loot')) activeGenerator = 'loot';

  // Фильтры NPC
  const [selectedRace, setSelectedRace] = useState('any');
  const [selectedGender, setSelectedGender] = useState('any');
  const [selectedOccupation, setSelectedOccupation] = useState('any');

  // Текущий NPC (сохраняется в памяти)
  const [currentNPC, setCurrentNPC] = useState(() => {
    try {
      const cached = localStorage.getItem('dnd_active_npc');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.fullName_en && parsed.voice?.pitch_en && parsed.secret_en) {
          return parsed;
        }
      }
      return generateRandomNPC({ language });
    } catch {
      return generateRandomNPC({ language });
    }
  });

  // Если у закэшированного NPC отсутствуют локализованные поля, обновляем их
  useEffect(() => {
    if (!currentNPC || !currentNPC.fullName_en || !currentNPC.voice?.pitch_en || !currentNPC.secret_en) {
      const updated = generateRandomNPC({
        race: currentNPC?.raceId || selectedRace,
        gender: currentNPC?.genderKey || selectedGender,
        occupation: selectedOccupation,
        language
      });
      setCurrentNPC(updated);
    }
  }, [language]);

  useEffect(() => {
    if (currentNPC) {
      try {
        localStorage.setItem('dnd_active_npc', JSON.stringify(currentNPC));
      } catch (e) {
        console.warn('Не удалось закешировать активного NPC', e);
      }
    }
  }, [currentNPC]);

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
    const options = forceRandom ? { language } : {
      race: selectedRace,
      gender: selectedGender,
      occupation: selectedOccupation,
      language
    };
    if (forceRandom) {
      setSelectedRace('any');
      setSelectedGender('any');
      setSelectedOccupation('any');
    }
    const npc = generateRandomNPC(options);
    setCurrentNPC(npc);
  };

  // Быстрый перенос торговца из генератора лавок в генератор NPC
  const handleOpenMerchantInNpc = (merchant) => {
    if (!merchant) return;
    const foundRaceEntry = Object.entries(RACES_DATA).find(([key, r]) => 
      r.name.toLowerCase() === merchant.race.toLowerCase() ||
      (r.name_en && r.name_en.toLowerCase() === merchant.race.toLowerCase())
    );
    const raceKey = foundRaceEntry ? foundRaceEntry[0] : 'any';
    const genderKey = (merchant.gender === 'Мужчина' || merchant.gender === 'Male') ? 'male' : 'female';
    const foundOcc = OCCUPATIONS.find(o => 
      o.name.toLowerCase() === merchant.occupation.toLowerCase() ||
      (o.name_en && o.name_en.toLowerCase() === merchant.occupation.toLowerCase())
    );
    const occName = foundOcc ? (isEn ? foundOcc.name_en : foundOcc.name) : 'any';

    const npc = generateRandomNPC({
      race: raceKey,
      gender: genderKey,
      occupation: occName,
      language
    });
    npc.fullName = merchant.name;
    npc.occupation = merchant.occupation;

    setSelectedRace(raceKey);
    setSelectedGender(genderKey);
    setSelectedOccupation(occName);
    setCurrentNPC(npc);

    navigate('/generators/npc');
  };

  // Перегенерация отдельных параметров
  const handleRerollField = (field) => {
    if (!currentNPC) return;
    if (field === 'name') {
      const race = RACES_DATA[currentNPC.raceId] || RACES_DATA.human;
      const raceEn = RACES_EN[currentNPC.raceId] || RACES_EN.human;
      const isMale = currentNPC.genderKey === 'male' || currentNPC.gender === 'Мужчина' || currentNPC.gender === 'Male';
      
      const poolRu = isMale ? race.maleNames : race.femaleNames;
      const poolEn = isMale ? (race.maleNames_en || raceEn.maleNames) : (race.femaleNames_en || raceEn.femaleNames);

      const firstNameRu = poolRu && poolRu.length > 0 ? poolRu[Math.floor(Math.random() * poolRu.length)] : 'Безымянный';
      const firstNameEn = poolEn && poolEn.length > 0 ? poolEn[Math.floor(Math.random() * poolEn.length)] : firstNameRu;

      let surnameRu = currentNPC.surname_ru || currentNPC.surname;
      let surnameEn = currentNPC.surname_en || currentNPC.surname;
      if (race.clans && race.clans.length > 0) {
        const cIdx = Math.floor(Math.random() * race.clans.length);
        surnameRu = race.clans[cIdx];
        surnameEn = (race.clans_en && race.clans_en[cIdx]) ? race.clans_en[cIdx] : (raceEn.clans ? raceEn.clans[cIdx % raceEn.clans.length] : surnameRu);
      }

      let epithetRu = currentNPC.epithet_ru || currentNPC.epithet;
      let epithetEn = currentNPC.epithet_en || currentNPC.epithet;
      if (race.epithets && race.epithets.length > 0 && Math.random() < 0.75) {
        const epIdx = Math.floor(Math.random() * race.epithets.length);
        epithetRu = race.epithets[epIdx];
        epithetEn = (race.epithets_en && race.epithets_en[epIdx]) ? race.epithets_en[epIdx] : (raceEn.epithets ? raceEn.epithets[epIdx % raceEn.epithets.length] : epithetRu);
      }

      const style = race.namingStyle || 'clan-quote';
      let fullNameRu = firstNameRu;
      let fullNameEn = firstNameEn;

      if (style === 'epithet-suffix') {
        fullNameRu = epithetRu ? `${firstNameRu} ${epithetRu}` : firstNameRu;
        fullNameEn = epithetEn ? `${firstNameEn} ${epithetEn}` : firstNameEn;
      } else if (style === 'tabaxi') {
        const nickRu = epithetRu || firstNameRu.split(' ')[0];
        const nickEn = epithetEn || firstNameEn.split(' ')[0];
        fullNameRu = surnameRu ? `${firstNameRu} («${nickRu}») из Клана ${surnameRu}` : `${firstNameRu} («${nickRu}»)`;
        fullNameEn = surnameEn ? `${firstNameEn} ("${nickEn}") of Clan ${surnameEn}` : `${firstNameEn} ("${nickEn}")`;
      } else if (style === 'kenku') {
        fullNameRu = epithetRu ? `${firstNameRu} («${epithetRu}»)` : firstNameRu;
        fullNameEn = epithetEn ? `${firstNameEn} ("${epithetEn}")` : firstNameEn;
      } else if (style === 'title') {
        fullNameRu = epithetRu ? `${firstNameRu} «${epithetRu}»` : firstNameRu;
        fullNameEn = epithetEn ? `${firstNameEn} "${epithetEn}"` : firstNameEn;
      } else {
        if (epithetRu && surnameRu) {
          fullNameRu = `${firstNameRu} «${epithetRu}» ${surnameRu}`;
        } else if (surnameRu) {
          fullNameRu = `${firstNameRu} ${surnameRu}`;
        } else if (epithetRu) {
          fullNameRu = `${firstNameRu} «${epithetRu}»`;
        }

        if (epithetEn && surnameEn) {
          fullNameEn = `${firstNameEn} "${epithetEn}" ${surnameEn}`;
        } else if (surnameEn) {
          fullNameEn = `${firstNameEn} ${surnameEn}`;
        } else if (epithetEn) {
          fullNameEn = `${firstNameEn} "${epithetEn}"`;
        }
      }

      setCurrentNPC({ 
        ...currentNPC, 
        firstName: isEn ? firstNameEn : firstNameRu, 
        firstName_ru: firstNameRu,
        firstName_en: firstNameEn,
        surname: isEn ? surnameEn : surnameRu,
        surname_ru: surnameRu,
        surname_en: surnameEn,
        epithet: isEn ? epithetEn : epithetRu,
        epithet_ru: epithetRu,
        epithet_en: epithetEn,
        fullName: isEn ? fullNameEn : fullNameRu,
        fullName_ru: fullNameRu,
        fullName_en: fullNameEn
      });
    } else if (field === 'voice') {
      const vIdx = Math.floor(Math.random() * VOICE_DATA.length);
      const vRu = VOICE_DATA[vIdx];
      const vEn = VOICES_EN[vIdx] || vRu;
      const qIdx = Math.floor(Math.random() * vRu.quotes.length);
      const quoteRu = vRu.quotes[qIdx];
      const quoteEn = (vEn.quotes && vEn.quotes[qIdx]) ? vEn.quotes[qIdx] : (vEn.quotes ? vEn.quotes[0] : quoteRu);

      setCurrentNPC({
        ...currentNPC,
        voiceIdx: vIdx,
        quoteIdx: qIdx,
        voice: { 
          pitch: isEn ? vEn.pitch : vRu.pitch, 
          pitch_ru: vRu.pitch,
          pitch_en: vEn.pitch,
          manner: isEn ? vEn.manner : vRu.manner, 
          manner_ru: vRu.manner,
          manner_en: vEn.manner,
          actingTip: isEn ? vEn.actingTip : vRu.actingTip, 
          actingTip_ru: vRu.actingTip,
          actingTip_en: vEn.actingTip,
          quote: isEn ? quoteEn : quoteRu,
          quote_ru: quoteRu,
          quote_en: quoteEn
        }
      });
    } else if (field === 'appearance') {
      const aIdx = Math.floor(Math.random() * APPEARANCE_FEATURES.length);
      const aRu = APPEARANCE_FEATURES[aIdx];
      const aEn = APPEARANCES_EN[aIdx] || aRu;
      setCurrentNPC({ 
        ...currentNPC, 
        appIdx: aIdx,
        appearance: isEn ? aEn : aRu,
        appearance_ru: aRu,
        appearance_en: aEn
      });
    } else if (field === 'personality') {
      const pIdx = Math.floor(Math.random() * PERSONALITY_TRAITS.length);
      const sIdx = Math.floor(Math.random() * SECRETS_MOTIVATIONS.length);
      const pRu = PERSONALITY_TRAITS[pIdx];
      const pEn = PERSONALITY_TRAITS_EN[pIdx] || pRu;
      const sRu = SECRETS_MOTIVATIONS[sIdx];
      const sEn = SECRETS_EN[sIdx] || sRu;

      setCurrentNPC({ 
        ...currentNPC, 
        traitIdx: pIdx,
        secretIdx: sIdx,
        personality: isEn ? pEn : pRu, 
        personality_ru: pRu,
        personality_en: pEn,
        secret: isEn ? sEn : sRu,
        secret_ru: sRu,
        secret_en: sEn
      });
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

  // Получить актуальные локализованные поля текущего NPC
  const npcName = isEn ? (currentNPC?.fullName_en || currentNPC?.fullName) : (currentNPC?.fullName_ru || currentNPC?.fullName);
  const npcEpithet = isEn ? (currentNPC?.epithet_en || currentNPC?.epithet) : (currentNPC?.epithet_ru || currentNPC?.epithet);
  const npcRace = isEn ? (currentNPC?.raceName_en || currentNPC?.raceName) : (currentNPC?.raceName_ru || currentNPC?.raceName);
  const npcGender = isEn 
    ? (currentNPC?.gender_en || (currentNPC?.genderKey === 'male' || currentNPC?.gender === 'Мужчина' ? 'Male' : 'Female'))
    : (currentNPC?.gender_ru || (currentNPC?.genderKey === 'male' || currentNPC?.gender === 'Male' ? 'Мужчина' : 'Женщина'));
  const npcOccupation = isEn ? (currentNPC?.occupation_en || currentNPC?.occupation) : (currentNPC?.occupation_ru || currentNPC?.occupation);
  const npcAlignment = isEn ? (currentNPC?.alignment_en || currentNPC?.alignment) : (currentNPC?.alignment_ru || currentNPC?.alignment);
  const npcVoicePitch = isEn ? (currentNPC?.voice?.pitch_en || currentNPC?.voice?.pitch) : (currentNPC?.voice?.pitch_ru || currentNPC?.voice?.pitch);
  const npcVoiceManner = isEn ? (currentNPC?.voice?.manner_en || currentNPC?.voice?.manner) : (currentNPC?.voice?.manner_ru || currentNPC?.voice?.manner);
  const npcActingTip = isEn ? (currentNPC?.voice?.actingTip_en || currentNPC?.voice?.actingTip) : (currentNPC?.voice?.actingTip_ru || currentNPC?.voice?.actingTip);
  const npcVoiceQuote = isEn ? (currentNPC?.voice?.quote_en || currentNPC?.voice?.quote) : (currentNPC?.voice?.quote_ru || currentNPC?.voice?.quote);
  const npcAppearance = isEn ? (currentNPC?.appearance_en || currentNPC?.appearance) : (currentNPC?.appearance_ru || currentNPC?.appearance);
  const npcPersonality = isEn ? (currentNPC?.personality_en || currentNPC?.personality) : (currentNPC?.personality_ru || currentNPC?.personality);
  const npcSecret = isEn ? (currentNPC?.secret_en || currentNPC?.secret) : (currentNPC?.secret_ru || currentNPC?.secret);

  // Копирование в буфер
  const handleCopy = () => {
    if (!currentNPC) return;
    const text = isEn ? [
      `👤 ${npcName} (${npcRace}, ${npcGender})`,
      `💼 Profession: ${npcOccupation} | Alignment: ${npcAlignment}`,
      `🎭 Voice: ${npcVoicePitch}`,
      `🗣️ Speech manner: ${npcVoiceManner}`,
      `💬 Quote: "${npcVoiceQuote}"`,
      `👁️ Appearance: ${npcAppearance}`,
      `🧠 Personality: ${npcPersonality}`,
      `🤫 Secret: ${npcSecret}`
    ].join('\n') : [
      `👤 ${npcName} (${npcRace}, ${npcGender})`,
      `💼 Профессия: ${npcOccupation} | Мировоззрение: ${npcAlignment}`,
      `🎭 Голос: ${npcVoicePitch}`,
      `🗣️ Манера речи: ${npcVoiceManner}`,
      `💬 Фраза: "${npcVoiceQuote}"`,
      `👁️ Внешность: ${npcAppearance}`,
      `🧠 Характер: ${npcPersonality}`,
      `🤫 Тайна: ${npcSecret}`
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const handleSendNpcToNotes = () => {
    if (!currentNPC || !onSendToNotes) return;
    const note = isEn ? [
      `【 ${npcName} — ${npcRace}, ${npcOccupation} 】`,
      `Alignment: ${npcAlignment}`,
      `🎭 Voice: ${npcVoicePitch}`,
      `🗣️ Speech manner: ${npcVoiceManner}`,
      `💬 Signature quote: "${npcVoiceQuote}"`,
      `👁️ Appearance: ${npcAppearance}`,
      `🧠 Personality: ${npcPersonality}`,
      `🤫 Secret / Motive: ${npcSecret}`
    ].join('\n') : [
      `【 ${npcName} — ${npcRace}, ${npcOccupation} 】`,
      `Мировоззрение: ${npcAlignment}`,
      `🎭 Голос: ${npcVoicePitch}`,
      `🗣️ Манера речи: ${npcVoiceManner}`,
      `💬 Коронная фраза: «${npcVoiceQuote}»`,
      `👁️ Внешность: ${npcAppearance}`,
      `🧠 Характер: ${npcPersonality}`,
      `🤫 Тайна / Мотив: ${npcSecret}`
    ].join('\n');
    onSendToNotes(note, npcName);
  };

  return (
    <div className="generators-container">
      <div style={{ display: activeGenerator === 'npc' ? 'block' : 'none' }}>
        {/* Шапка раздела */}
        <div className="generators-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={26} color="#f2f3f5" />
              <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-title)' }}>{t('generators.npc.title')}</h2>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              {t('generators.npc.desc')}
            </p>
          </div>

      {/* Панель фильтров и генерации */}
      <div className="generators-toolbar">
        <div className="filters-group">
          {/* Раса */}
          <div className="filter-item">
            <label>{t('generators.npc.race')}</label>
            <select 
              value={selectedRace} 
              onChange={(e) => setSelectedRace(e.target.value)}
              className="curtain-select filter-select"
            >
              <option value="any">🎲 {t('generators.npc.anyRace')}</option>
              {Object.values(RACES_DATA).map(r => (
                <option key={r.id} value={r.id}>{r.icon} {isEn ? (r.name_en || r.name) : r.name}</option>
              ))}
            </select>
          </div>

          {/* Пол */}
          <div className="filter-item">
            <label>{t('generators.npc.gender')}</label>
            <select 
              value={selectedGender} 
              onChange={(e) => setSelectedGender(e.target.value)}
              className="curtain-select filter-select"
            >
              <option value="any">🎲 {t('generators.npc.anyGender')}</option>
              <option value="male">{isEn ? 'Male' : 'Мужчина'}</option>
              <option value="female">{isEn ? 'Female' : 'Женщина'}</option>
            </select>
          </div>

          {/* Профессия */}
          <div className="filter-item">
            <label>{t('generators.npc.job')}</label>
            <select 
              value={selectedOccupation} 
              onChange={(e) => setSelectedOccupation(e.target.value)}
              className="curtain-select filter-select"
            >
              <option value="any">🎲 {t('generators.npc.anyJob')}</option>
              {OCCUPATIONS.map(occ => (
                <option key={occ.name} value={occ.name}>{isEn ? (occ.name_en || occ.name) : occ.name}</option>
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
            <Dices size={18} /> {t('generators.actions.generateNpc')}
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={() => handleGenerate(true)}
            title={isEn ? "Reset filters and generate completely random NPC" : "Сбросить фильтры и выдать полностью случайного персонажа"}
          >
            <RotateCcw size={16} /> {t('generators.actions.fullRandom')}
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
                  <h3 className="npc-name">{npcName}</h3>
                  {npcEpithet && (
                    <span className="npc-epithet-badge" title={isEn ? "Epithet or title of merit" : "Прозвище или титул за заслуги"}>
                      ✨ {npcEpithet}
                    </span>
                  )}
                </div>
                <div className="npc-meta-row">
                  <span className="npc-tag">{npcRace}</span>
                  <span className="npc-tag">{npcGender}</span>
                  <span className="npc-tag highlight">{npcOccupation}</span>
                  <span className="npc-tag subtle">{npcAlignment}</span>
                </div>
              </div>

              {/* Действия карточки */}
              <div className="npc-actions-box">
                <button 
                  type="button" 
                  className={`trials-btn icon-btn ${isCurrentSaved ? 'active' : ''}`}
                  onClick={toggleSaveCurrent}
                  title={isCurrentSaved ? (isEn ? 'Remove from saved' : 'Удалить из сохраненных') : (isEn ? 'Bookmark NPC' : 'Сохранить NPC в список сессии')}
                >
                  {isCurrentSaved ? <BookmarkCheck size={18} color="#f2f3f5" /> : <Bookmark size={18} />}
                </button>
                <button 
                  type="button" 
                  className="trials-btn icon-btn"
                  onClick={handleSendNpcToNotes}
                  title={isEn ? 'Send NPC to DM Notes' : 'Отправить описание NPC в Заметки на Стол Мастера'}
                >
                  <FileText size={18} />
                </button>
                <button 
                  type="button" 
                  className="trials-btn icon-btn"
                  onClick={handleCopy}
                  title={isEn ? 'Copy description to clipboard' : 'Скопировать описание в буфер обмена'}
                >
                  {copied ? <Check size={18} color="#22c55e" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {/* БЛОК 1: ГОЛОС И ОТЫГРЫШ (ГЛАВНАЯ ФИШКА) */}
            <div className="npc-section-box voice-box">
              <div className="section-title-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Volume2 size={18} color="#f2f3f5" />
                  <span className="section-title">{t('generators.npc.voiceSection')}</span>
                </div>
                <button 
                  type="button" 
                  className="reroll-btn" 
                  onClick={() => handleRerollField('voice')}
                  title={t('generators.actions.anotherVoice')}
                >
                  <RotateCcw size={13} /> {t('generators.actions.anotherVoice')}
                </button>
              </div>

              <div className="voice-details-grid">
                <div className="voice-row">
                  <span className="voice-label">{t('generators.npc.pitchAndTempo')}</span>
                  <span className="voice-text">{npcVoicePitch}</span>
                </div>
                <div className="voice-row">
                  <span className="voice-label">{t('generators.npc.manner')}</span>
                  <span className="voice-text">{npcVoiceManner}</span>
                </div>
                <div className="voice-row acting-tip-row">
                  <span className="voice-label">{t('generators.npc.actingTip')}</span>
                  <span className="acting-tip-text">{npcActingTip}</span>
                </div>
              </div>

              {/* Пример вступительной фразы */}
              <div className="npc-quote-card">
                <MessageSquareQuote size={18} className="quote-icon" />
                <p className="quote-text">{isEn ? `"${npcVoiceQuote}"` : `«${npcVoiceQuote}»`}</p>
              </div>
            </div>

            {/* БЛОК 2: ВНЕШНОСТЬ И ПРИМЕТА */}
            <div className="npc-section-box">
              <div className="section-title-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={17} color="#38bdf8" />
                  <span className="section-title">{t('generators.npc.appearanceSection')}</span>
                </div>
                <button 
                  type="button" 
                  className="reroll-btn" 
                  onClick={() => handleRerollField('appearance')}
                  title={t('generators.actions.anotherAppearance')}
                >
                  <RotateCcw size={13} /> {t('generators.actions.anotherAppearance')}
                </button>
              </div>
              <p className="section-content-text">{npcAppearance}</p>
            </div>

            {/* БЛОК 3: ХАРАКТЕР И ТАЙНЫЙ МОТИВ */}
            <div className="npc-section-box">
              <div className="section-title-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Brain size={17} color="#c084fc" />
                  <span className="section-title">{t('generators.npc.motiveSection')}</span>
                </div>
                <button 
                  type="button" 
                  className="reroll-btn" 
                  onClick={() => handleRerollField('personality')}
                  title={t('generators.actions.anotherMotive')}
                >
                  <RotateCcw size={13} /> {t('generators.actions.anotherMotive')}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>{t('generators.npc.trait')} </span>
                  <span className="section-content-text">{npcPersonality}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#f87171', textTransform: 'uppercase', fontWeight: 'bold' }}>{t('generators.npc.secret')} </span>
                  <span className="section-content-text">{npcSecret}</span>
                </div>
              </div>
            </div>

            {/* Быстрые микро-кнопки перегенерации */}
            <div className="npc-micro-rerolls">
              <button type="button" className="micro-btn" onClick={() => handleRerollField('name')}>
                🔄 {t('generators.actions.anotherName')}
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('voice')}>
                🎙️ {t('generators.actions.anotherVoice')}
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('appearance')}>
                👁️ {t('generators.actions.anotherAppearance')}
              </button>
              <button type="button" className="micro-btn" onClick={() => handleRerollField('personality')}>
                🤫 {t('generators.actions.anotherMotive')}
              </button>
            </div>
          </div>
        )}

        {/* Правая панель: Сохраненные за сессию NPC */}
        <div className="saved-npcs-sidebar">
          <div className="saved-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={16} color="#f2f3f5" />
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)' }}>
                {t('generators.npc.notepad', { count: savedNPCs.length })}
              </h4>
            </div>
            {savedNPCs.length > 0 && (
              <button 
                type="button" 
                className="clean-btn" 
                onClick={() => setSavedNPCs([])}
                title={t('common.clear')}
              >
                {t('common.clear')}
              </button>
            )}
          </div>

          <p style={{ margin: '4px 0 10px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            {t('generators.npc.desc')}
          </p>

          <div className="saved-list">
            {savedNPCs.length === 0 ? (
              <div className="saved-empty-state">
                <span>⭐</span>
                <p>{t('generators.npc.notepadEmpty')}</p>
              </div>
            ) : (
              savedNPCs.map(item => {
                const sName = isEn ? (item.fullName_en || item.fullName) : (item.fullName_ru || item.fullName);
                const sRace = isEn ? (item.raceName_en || item.raceName) : (item.raceName_ru || item.raceName);
                const sOcc = isEn ? (item.occupation_en || item.occupation) : (item.occupation_ru || item.occupation);
                return (
                  <div 
                    key={item.id} 
                    className={`saved-npc-item ${currentNPC?.id === item.id ? 'active' : ''}`}
                    onClick={() => setCurrentNPC(item)}
                  >
                    <span className="item-icon">{item.raceIcon}</span>
                    <div className="item-info">
                      <span className="item-name">{sName}</span>
                      <span className="item-meta">{sRace} • {sOcc}</span>
                    </div>
                    <button 
                      type="button" 
                      className="item-delete-btn" 
                      onClick={(e) => removeSavedNPC(item.id, e)}
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

      <div style={{ display: activeGenerator === 'tavern' ? 'block' : 'none' }}>
        <TavernGenerator />
      </div>

      <div style={{ display: activeGenerator === 'shops' ? 'block' : 'none' }}>
        <ShopGenerator onOpenInNpc={handleOpenMerchantInNpc} />
      </div>

      <div style={{ display: activeGenerator === 'quests' ? 'block' : 'none' }}>
        <QuestGenerator onSendToNotes={onSendToNotes} />
      </div>

      <div style={{ display: activeGenerator === 'encounters' ? 'block' : 'none' }}>
        <EncounterGenerator onSendToInitiative={onSendToInitiative} onSendToNotes={onSendToNotes} />
      </div>

      <div style={{ display: activeGenerator === 'dungeon' ? 'block' : 'none' }}>
        <DungeonGenerator onSendToNotes={onSendToNotes} />
      </div>

      <div style={{ display: activeGenerator === 'loot' ? 'block' : 'none' }}>
        <LootGenerator onSendToNotes={onSendToNotes} />
      </div>
    </div>
  );
}
