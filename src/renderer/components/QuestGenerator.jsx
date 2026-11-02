import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { 
  QUEST_CATEGORIES, 
  generateRandomQuest 
} from '../data/questData.js';

export default function QuestGenerator() {
  const [selectedCategory, setSelectedCategory] = useState('any');
  const [currentQuest, setCurrentQuest] = useState(() => {
    try {
      const cached = localStorage.getItem('dnd_active_quest');
      return cached ? JSON.parse(cached) : generateRandomQuest();
    } catch {
      return generateRandomQuest();
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
    setCurrentQuest(generateRandomQuest(cat));
  };

  const handleRollInvestigation = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    let hint = '';
    if (roll >= 15) {
      hint = 'Отличный результат (15+)! Игроки безошибочно распознают правду и вымысел.';
    } else if (roll >= 10) {
      hint = 'Успех (10+): отряду удаётся отсеять самую дикую байку пьяницы.';
    } else {
      hint = 'Провал (<10): отряд поверил в байку или слух воспринят превратно.';
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

  const handleCopy = () => {
    if (!currentQuest) return;
    const text = `📜 ЗАКАЗ: ${currentQuest.title}\n` +
      `👤 Заказчик: ${currentQuest.client} (${currentQuest.clientVibe})\n` +
      `🎯 Цель: ${currentQuest.goal}\n` +
      `⚠️ Подводный камень: ${currentQuest.twist}\n` +
      `📍 Место: ${currentQuest.location}\n` +
      `⏳ Сроки: ${currentQuest.urgency}\n` +
      `💰 Награда: ${currentQuest.reward}\n\n` +
      `🗣️ СЛУХИ И ТОЛКИ:\n` +
      currentQuest.rumors.map(r => `• [${r.label}] ${r.text}`).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Шапка подраздела */}
      <div className="generators-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scroll size={26} color="var(--accent-gold)" />
          <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--text-title)' }}>
            Генератор Заказов и Слухов
          </h2>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Доска объявлений таверны или гильдии: контракты с заказчиками, сюжетными твистами и городскими сплетнями.
        </p>
      </div>

      {/* Горизонтальная панель фильтров */}
      <div className="generators-toolbar">
        <div className="filters-group">
          <div className="filter-item">
            <label>Категория поручения:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="curtain-select filter-select"
            >
              {QUEST_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
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
            <Dices size={18} /> Сгенерировать заказ
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={() => handleGenerate(true)}
            title="Случайная категория"
          >
            <RotateCcw size={16} /> Рандом
          </button>
          <button 
            type="button" 
            className="trials-btn secondary"
            onClick={handleRollInvestigation}
            title="Бросок проверки наведения справок"
          >
            <Sparkles size={16} /> Справка d20
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
              🎲 d20 Анализ / Проницательность = {investigationRoll.roll}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>— {investigationRoll.hint}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setInvestigationRoll(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}
          >
            Скрыть
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
                <h3 className="npc-name">{currentQuest.title}</h3>
                <div className="npc-meta-row">
                  <span className="npc-tag highlight">Заказ на доске объявлений</span>
                  <span className="npc-tag" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                    Сроки: {currentQuest.urgency}
                  </span>
                </div>
              </div>

              <div className="npc-actions-box">
                <button 
                  type="button" 
                  className={`trials-btn secondary icon-btn ${isSaved ? 'active' : ''}`}
                  onClick={toggleSaveQuest}
                  title={isSaved ? 'Удалить из сохраненных' : 'Сохранить квест'}
                >
                  <Bookmark size={17} color={isSaved ? 'var(--accent-gold)' : 'currentColor'} />
                </button>
                <button 
                  type="button" 
                  className="trials-btn secondary icon-btn"
                  onClick={handleCopy}
                  title="Скопировать заказ"
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

            {/* Заказчик и Место */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  <User size={16} /> Заказчик
                </div>
                <div style={{ fontWeight: '600', color: 'var(--text-title)', marginBottom: '4px', fontSize: '14px' }}>
                  {currentQuest.client}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {currentQuest.clientVibe}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-app)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  <MapPin size={16} /> Локация и Сроки
                </div>
                <div style={{ fontWeight: '500', color: 'var(--text-title)', marginBottom: '4px', fontSize: '14px' }}>
                  {currentQuest.location}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {currentQuest.urgency}
                </div>
              </div>
            </div>

            {/* Суть поручения */}
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 'bold' }}>
                Суть задачи:
              </div>
              <p style={{ margin: 0, color: 'var(--text-title)', fontSize: '15px', lineHeight: '1.5', fontWeight: '500' }}>
                {currentQuest.goal}
              </p>
            </div>

            {/* Подводный камень и Награда */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  <AlertTriangle size={16} /> Скрытый сюжетный твист
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                  {currentQuest.twist}
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  <Coins size={16} /> Награда за выполнение
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)', fontWeight: 'bold', lineHeight: '1.4' }}>
                  {currentQuest.reward}
                </p>
              </div>
            </div>

            {/* Слухи */}
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0 10px 0', fontSize: '15px', color: 'var(--text-title)' }}>
                <MessageSquare size={17} color="var(--accent-primary)" />
                Слухи и кривотолки в таверне
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentQuest.rumors.map((rumor, idx) => (
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
                      {rumor.label}
                    </span>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                      «{rumor.text}»
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Правая панель: Сохраненные заказы */}
        <div className="saved-npcs-sidebar">
          <div className="saved-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={16} color="var(--accent-gold)" />
              <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)' }}>
                Книга заказов ({savedQuests.length})
              </h4>
            </div>
            {savedQuests.length > 0 && (
              <button 
                type="button" 
                className="clean-btn" 
                onClick={() => setSavedQuests([])}
                title="Очистить список"
              >
                Очистить
              </button>
            )}
          </div>

          <p style={{ margin: '4px 0 10px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.35' }}>
            Сохраняйте заказы, взятые партией, чтобы быстро освежить в памяти детали контракта.
          </p>

          <div className="saved-list">
            {savedQuests.length === 0 ? (
              <div className="saved-empty-state">
                <span>📜</span>
                <p>Нажмите закладку на карточке заказа, чтобы сохранить его.</p>
              </div>
            ) : (
              savedQuests.map(item => (
                <div 
                  key={item.id} 
                  className={`saved-npc-item ${currentQuest?.id === item.id ? 'active' : ''}`}
                  onClick={() => setCurrentQuest(item)}
                >
                  <span className="item-icon">📜</span>
                  <div className="item-info">
                    <span className="item-name">{item.title}</span>
                    <span className="item-meta">{item.client} • {item.reward.split(',')[0]}</span>
                  </div>
                  <button 
                    type="button" 
                    className="item-delete-btn" 
                    onClick={(e) => removeSavedQuest(item.id, e)}
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
