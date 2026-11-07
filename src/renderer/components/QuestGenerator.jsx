import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext.jsx';
import { 
  Scroll, 
  User, 
  MapPin, 
  Clock, 
  Coins, 
  AlertTriangle, 
  MessageSquare, 
  Dices, 
  Bookmark, 
  Copy, 
  Check, 
  Trash2, 
  RotateCcw,
  Sparkles,
  FileText
} from 'lucide-react';
import { 
  QUEST_CATEGORIES, 
  generateRandomQuest 
} from '../data/questData.js';

export default function QuestGenerator({ onSendToNotes }) {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const [selectedCategory, setSelectedCategory] = useState('any');
  const [currentQuest, setCurrentQuest] = useState(() => {
    try {
      const cached = localStorage.getItem('dnd_active_quest');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.title_en && parsed.client_en) {
          return parsed;
        }
      }
      return generateRandomQuest('any', { language });
    } catch {
      return generateRandomQuest('any', { language });
    }
  });

  const [savedQuests, setSavedQuests] = useState(() => {
    try {
      const saved = localStorage.getItem('dnd_saved_quests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copied, setCopied] = useState(false);
  const [investigationRoll, setInvestigationRoll] = useState(null);

  // Обновление локализованных полей при смене языка
  useEffect(() => {
    if (!currentQuest || !currentQuest.title_en || !currentQuest.client_en) {
      setCurrentQuest(generateRandomQuest(selectedCategory, { language }));
    }
  }, [language]);

  useEffect(() => {
    if (currentQuest) {
      try {
        localStorage.setItem('dnd_active_quest', JSON.stringify(currentQuest));
      } catch (e) {
        console.warn('Не удалось закешировать активный квест', e);
      }
    }
  }, [currentQuest]);

  useEffect(() => {
    try {
      localStorage.setItem('dnd_saved_quests', JSON.stringify(savedQuests));
    } catch (e) {
      console.warn('Не удалось сохранить список квестов', e);
    }
  }, [savedQuests]);

  const handleGenerate = (forceRandom = false) => {
    setInvestigationRoll(null);
    const cat = forceRandom ? 'any' : selectedCategory;
    if (forceRandom) setSelectedCategory('any');
    setCurrentQuest(generateRandomQuest(cat, { language }));
  };

  const handleRollInvestigation = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    let hint = '';
    if (roll >= 15) {
      hint = isEn
        ? 'Outstanding result (15+)! The party effortlessly weeds out truth from tall tales.'
        : 'Отличный результат (15+)! Игроки безошибочно распознают правду и вымысел.';
    } else if (roll >= 10) {
      hint = isEn
        ? 'Success (10+): The party discards wild tavern rumors.'
        : 'Успех (10+): отряду удаётся отсеять самую дикую байку пьяницы.';
    } else {
      hint = isEn
        ? 'Failure (<10): The party takes tavern tall tales at face value.'
        : 'Провал (<10): отряд поверил в байку или слух воспринят превратно.';
    }
    setInvestigationRoll({ roll, hint });
  };

  const isSaved = savedQuests.some(q => q.id === currentQuest?.id);

  const toggleSaveQuest = () => {
    if (!currentQuest) return;
    if (isSaved) {
      setSavedQuests(savedQuests.filter(q => q.id !== currentQuest.id));
    } else {
      setSavedQuests([currentQuest, ...savedQuests]);
    }
  };

  const removeSavedQuest = (id, e) => {
    e.stopPropagation();
    setSavedQuests(savedQuests.filter(q => q.id !== id));
  };

  // Локализованные поля текущего квеста
  const questTitle = isEn ? (currentQuest?.title_en || currentQuest?.title) : (currentQuest?.title_ru || currentQuest?.title);
  const questClient = isEn ? (currentQuest?.client_en || currentQuest?.client) : (currentQuest?.client_ru || currentQuest?.client);
  const questClientVibe = isEn ? (currentQuest?.clientVibe_en || currentQuest?.clientVibe) : (currentQuest?.clientVibe_ru || currentQuest?.clientVibe);
  const questGoal = isEn ? (currentQuest?.goal_en || currentQuest?.goal) : (currentQuest?.goal_ru || currentQuest?.goal);
  const questTwist = isEn ? (currentQuest?.twist_en || currentQuest?.twist) : (currentQuest?.twist_ru || currentQuest?.twist);
  const questLocation = isEn ? (currentQuest?.location_en || currentQuest?.location) : (currentQuest?.location_ru || currentQuest?.location);
  const questUrgency = isEn ? (currentQuest?.urgency_en || currentQuest?.urgency) : (currentQuest?.urgency_ru || currentQuest?.urgency);
  const questReward = isEn ? (currentQuest?.reward_en || currentQuest?.reward) : (currentQuest?.reward_ru || currentQuest?.reward);

  const handleCopy = () => {
    if (!currentQuest) return;
    const rumorsList = (currentQuest.rumors || []).map(r => {
      const rLabel = isEn 
        ? (r.type === 'truth' ? 'Verified Fact' : (r.type === 'halftruth' ? 'Exaggerated Gossip' : 'Tavern Tall Tale'))
        : (r.type === 'truth' ? 'Достоверный слух' : (r.type === 'halftruth' ? 'Приукрашенная молва' : 'Пьяная байка'));
      const rText = isEn ? (r.text_en || r.text) : (r.text_ru || r.text);
      return `• [${rLabel}] ${rText}`;
    }).join('\n');

    const text = isEn ? [
      `📜 QUEST: ${questTitle}`,
      `👤 Client: ${questClient} (${questClientVibe})`,
      `🎯 Objective: ${questGoal}`,
      `⚠️ Plot Twist: ${questTwist}`,
      `📍 Location: ${questLocation}`,
      `⏳ Deadline: ${questUrgency}`,
      `💰 Reward: ${questReward}`,
      '',
      `🗣️ RUMORS & GOSSIP:`,
      rumorsList
    ].join('\n') : [
      `📜 ЗАКАЗ: ${questTitle}`,
      `👤 Заказчик: ${questClient} (${questClientVibe})`,
      `🎯 Цель: ${questGoal}`,
      `⚠️ Подводный камень: ${questTwist}`,
      `📍 Место: ${questLocation}`,
      `⏳ Сроки: ${questUrgency}`,
      `💰 Награда: ${questReward}`,
      '',
      `🗣️ СЛУХИ И ТОЛКИ:`,
      rumorsList
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendQuestToNotes = () => {
    if (!currentQuest || !onSendToNotes) return;
    const text = isEn ? [
      `【 📜 Contract: ${questTitle} 】`,
      `⏳ Deadline: ${questUrgency}`,
      `👤 Client: ${questClient} (${questClientVibe})`,
      `📍 Location: ${questLocation}`,
      `🎯 Objective: ${questGoal}`,
      `⚠️ Plot Twist: ${questTwist}`,
      `💰 Reward: ${questReward}`
    ].join('\n') : [
      `【 📜 Заказ: ${questTitle} 】`,
      `⏳ Сроки: ${questUrgency}`,
      `👤 Заказчик: ${questClient} (${questClientVibe})`,
      `📍 Место действия: ${questLocation}`,
      `🎯 Суть задачи: ${questGoal}`,
      `⚠️ Подводный камень: ${questTwist}`,
      `💰 Награда: ${questReward}`
    ].join('\n');
    onSendToNotes(text, questTitle);
  };

  return (
    <div>
      {/* Шапка подраздела */}
      <div className="generators-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scroll size={26} color="#f2f3f5" />
          <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-title)' }}>
            {t('generators.quests.title')}
          </h2>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          {t('generators.quests.desc')}
        </p>
      </div>

      {/* Горизонтальная панель фильтров */}
      <div className="generators-toolbar">
        <div className="filters-group">
          <div className="filter-item">
            <label>{t('generators.quests.category')}</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="curtain-select filter-select"
            >
              {QUEST_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {isEn ? (cat.label_en || cat.label) : cat.label}
                </option>
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
            <Dices size={18} /> {t('generators.quests.generateBtn')}
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={() => handleGenerate(true)}
            title={isEn ? 'Random category' : 'Случайная категория'}
          >
            <RotateCcw size={16} /> {t('generators.actions.fullRandom')}
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={handleRollInvestigation}
            title={isEn ? 'Roll d20 Investigation / Insight' : 'Бросок проверки наведения справок'}
          >
            <Sparkles size={16} /> {t('generators.quests.investigationBtn')}
          </button>
        </div>
      </div>

      {/* Результат броска d20 (если сделан) */}
      {investigationRoll && (
        <div style={{ 
          marginTop: '14px', 
          padding: '10px 16px', 
          borderRadius: '8px', 
          backgroundColor: 'var(--bg-module)', 
          border: '1px solid var(--border-color)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 'bold', color: investigationRoll.roll >= 10 ? '#4ade80' : '#ef4444' }}>
              🎲 {isEn ? 'd20 Inquiry / Insight' : 'd20 Анализ / Проницательность'} = {investigationRoll.roll}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>— {investigationRoll.hint}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setInvestigationRoll(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}
          >
            {isEn ? 'Hide' : 'Скрыть'}
          </button>
        </div>
      )}

      {/* Основная сетка: Карточка заказа слева (1fr) + Записная книжка справа (320px) */}
      <div className="generators-main-layout">
        
        {/* Карточка заказа */}
        {currentQuest && (
          <div className="npc-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Шапка карточки */}
            <div className="npc-card-header">
              <div className="npc-avatar-box">
                <span className="npc-race-emoji">📜</span>
              </div>
              <div className="npc-title-box">
                <h3 className="npc-name">{questTitle}</h3>
                <div className="npc-meta-row">
                  <span className="npc-tag highlight">
                    {isEn ? 'Notice Board Contract' : 'Заказ на доске объявлений'}
                  </span>
                  <span className="npc-tag" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                    {isEn ? `Deadline: ${questUrgency}` : `Сроки: ${questUrgency}`}
                  </span>
                </div>
              </div>

              <div className="npc-actions-box">
                <button 
                  type="button" 
                  className={`trials-btn secondary icon-btn ${isSaved ? 'active' : ''}`}
                  onClick={toggleSaveQuest}
                  title={isSaved ? (isEn ? 'Remove from saved' : 'Удалить из сохраненных') : (isEn ? 'Bookmark quest' : 'Сохранить квест')}
                >
                  <Bookmark size={17} color={isSaved ? '#f2f3f5' : 'currentColor'} />
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleSendQuestToNotes}
                  title={isEn ? 'Send contract details to DM Notes' : 'Отправить детали заказа в Заметки на Стол'}
                >
                  <FileText size={17} />
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleCopy}
                  title={isEn ? 'Copy contract to clipboard' : 'Скопировать заказ'}
                >
                  {copied ? <Check size={17} color="#22c55e" /> : <Copy size={17} />}
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={() => handleGenerate(false)}
                  title={isEn ? 'Reroll contract' : 'Сгенерировать заново'}
                >
                  <RotateCcw size={17} />
                </button>
              </div>
            </div>

            {/* Заказчик и Место */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-title)', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  <User size={16} /> {t('generators.quests.client')}
                </div>
                <div style={{ fontWeight: '600', color: 'var(--text-title)', marginBottom: '4px', fontSize: '14px' }}>
                  {questClient}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {questClientVibe}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-app)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  <MapPin size={16} /> {isEn ? 'Location & Deadline' : 'Локация и Сроки'}
                </div>
                <div style={{ fontWeight: '500', color: 'var(--text-title)', marginBottom: '4px', fontSize: '14px' }}>
                  {questLocation}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {questUrgency}
                </div>
              </div>
            </div>

            {/* Суть поручения */}
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 'bold' }}>
                {t('generators.quests.goal')}:
              </div>
              <p style={{ margin: 0, color: 'var(--text-title)', fontSize: '15px', lineHeight: '1.5', fontWeight: '500' }}>
                {questGoal}
              </p>
            </div>

            {/* Подводный камень и Награда */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  <AlertTriangle size={16} /> {t('generators.quests.twist')}
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                  {questTwist}
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-app)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-title)', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  <Coins size={16} /> {t('generators.quests.reward')}
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)', fontWeight: 'bold', lineHeight: '1.4' }}>
                  {questReward}
                </p>
              </div>
            </div>

            {/* Слухи */}
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0 10px 0', fontSize: '15px', color: 'var(--text-title)' }}>
                <MessageSquare size={17} color="var(--accent-primary)" />
                {t('generators.quests.rumorsTitle')}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(currentQuest.rumors || []).map((rumor, idx) => {
                  const rLabel = isEn
                    ? (rumor.type === 'truth' ? 'Verified Fact' : (rumor.type === 'halftruth' ? 'Exaggerated Gossip' : 'Tavern Tall Tale'))
                    : (rumor.type === 'truth' ? 'Достоверный слух' : (rumor.type === 'halftruth' ? 'Приукрашенная молва' : 'Пьяная байка'));
                  const rText = isEn ? (rumor.text_en || rumor.text) : (rumor.text_ru || rumor.text);
                  return (
                    <div key={idx} style={{ 
                      padding: '10px 14px', 
                      borderRadius: '8px', 
                      backgroundColor: 'var(--bg-app)', 
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 'bold', 
                        padding: '1px 7px', 
                        borderRadius: '4px',
                        alignSelf: 'flex-start',
                        backgroundColor: rumor.type === 'truth' ? 'rgba(34, 197, 94, 0.15)' : (rumor.type === 'halftruth' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)'),
                        color: rumor.type === 'truth' ? '#4ade80' : (rumor.type === 'halftruth' ? '#facc15' : '#f87171')
                      }}>
                        {rLabel}
                      </span>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                        {isEn ? `"${rText}"` : `«${rText}»`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Правая панель: Сохраненные заказы */}
        <div className="saved-npcs-sidebar">
          <div className="saved-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={16} color="#949ba4" />
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)' }}>
                {t('generators.quests.notepad', { count: savedQuests.length })}
              </h4>
            </div>
            {savedQuests.length > 0 && (
              <button 
                type="button" 
                className="clean-btn" 
                onClick={() => setSavedQuests([])}
                title={t('common.clear')}
              >
                {t('common.clear')}
              </button>
            )}
          </div>

          <p style={{ margin: '4px 0 10px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            {isEn 
              ? 'Save contracts taken by the party to quickly review quest details and rewards.'
              : 'Сохраняйте заказы, взятые партией, чтобы быстро освежить в памяти детали контракта.'}
          </p>

          <div className="saved-list">
            {savedQuests.length === 0 ? (
              <div className="saved-empty-state">
                <span>📜</span>
                <p>{t('generators.quests.notepadEmpty')}</p>
              </div>
            ) : (
              savedQuests.map(item => {
                const sTitle = isEn ? (item.title_en || item.title) : (item.title_ru || item.title);
                const sClient = isEn ? (item.client_en || item.client) : (item.client_ru || item.client);
                const sReward = isEn ? (item.reward_en || item.reward) : (item.reward_ru || item.reward);
                return (
                  <div 
                    key={item.id} 
                    className={`saved-npc-item ${currentQuest?.id === item.id ? 'active' : ''}`}
                    onClick={() => setCurrentQuest(item)}
                  >
                    <span className="item-icon">📜</span>
                    <div className="item-info">
                      <span className="item-name">{sTitle}</span>
                      <span className="item-meta">{sClient} • {sReward?.split(',')[0]}</span>
                    </div>
                    <button 
                      type="button" 
                      className="item-delete-btn" 
                      onClick={(e) => removeSavedQuest(item.id, e)}
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
