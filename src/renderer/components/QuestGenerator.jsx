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
  Sparkles,
  ShieldAlert
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

  const handleGenerate = () => {
    setInvestigationRoll(null);
    setCurrentQuest(generateRandomQuest(selectedCategory));
  };

  const handleRollInvestigation = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    let hint = '';
    if (roll >= 15) {
      hint = 'Отличный результат! Игроки точно выясняют, где правда, а где выдумка.';
    } else if (roll >= 10) {
      hint = 'Успех: отряду удаётся отсеять самую дикую байку пьяницы.';
    } else {
      hint = 'Провал: отряд поверил в местную байку или слух воспринят превратно.';
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
    <div className="npc-generator-container">
      {/* ЛЕВАЯ ПАНЕЛЬ: Фильтры */}
      <div className="npc-controls-panel">
        <h3 className="controls-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scroll size={20} color="var(--accent-gold)" />
          Параметры заказа
        </h3>

        <div className="control-group">
          <label>Категория поручения</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {QUEST_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>

        <button 
          type="button" 
          className="generate-main-btn"
          onClick={handleGenerate}
        >
          <Dices size={18} /> Сгенерировать заказ
        </button>

        <div className="npc-card" style={{ marginTop: '20px', padding: '16px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--accent-gold)" /> Наведение справок
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: '1.4' }}>
            Бросьте d20 (Анализ / Проницательность), чтобы определить, насколько точно герои распознают слухи.
          </p>
          <button 
            type="button" 
            className="con-roll-btn"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleRollInvestigation}
          >
            <Dices size={14} /> Бросить проверку d20
          </button>

          {investigationRoll && (
            <div style={{ marginTop: '10px', padding: '8px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', fontSize: '12px' }}>
              <div style={{ fontWeight: 'bold', color: investigationRoll.roll >= 10 ? '#4ade80' : '#ef4444' }}>
                Результат d20: {investigationRoll.roll}
              </div>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                {investigationRoll.hint}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ЦЕНТРАЛЬНАЯ ПАНЕЛЬ: Карточка заказа */}
      <div className="npc-display-panel">
        {currentQuest && (
          <div className="npc-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Шапка карточки */}
            <div className="card-top-header">
              <div className="card-main-meta">
                <span className="card-race-icon">📜</span>
                <div>
                  <h2 className="card-character-name" style={{ fontSize: '20px' }}>
                    {currentQuest.title}
                  </h2>
                  <span className="card-character-sub">
                    Объявление на городской доске поручений
                  </span>
                </div>
              </div>

              <div className="card-action-btns">
                <button 
                  type="button" 
                  className={`card-tool-btn ${isSaved ? 'bookmarked' : ''}`}
                  onClick={toggleSaveQuest}
                  title={isSaved ? 'Удалить из сохраненных' : 'Сохранить квест'}
                >
                  <Bookmark size={18} />
                </button>
                <button 
                  type="button" 
                  className="card-tool-btn"
                  onClick={handleCopy}
                  title="Скопировать описание квеста"
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

            {/* Блок 1: Заказчик и Цель */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div style={{ backgroundColor: 'var(--bg-input)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  <User size={16} /> Заказчик
                </div>
                <div style={{ fontWeight: '600', color: 'var(--text-title)', marginBottom: '4px' }}>
                  {currentQuest.client}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {currentQuest.clientVibe}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-input)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  <MapPin size={16} /> Локация и Сроки
                </div>
                <div style={{ fontWeight: '500', color: 'var(--text-title)', marginBottom: '4px' }}>
                  {currentQuest.location}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {currentQuest.urgency}
                </div>
              </div>
            </div>

            {/* Блок 2: Задача */}
            <div style={{ backgroundColor: 'var(--bg-input)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 'bold' }}>
                Суть контракта:
              </div>
              <p style={{ margin: 0, color: 'var(--text-title)', fontSize: '15px', lineHeight: '1.5', fontWeight: '500' }}>
                {currentQuest.goal}
              </p>
            </div>

            {/* Блок 3: Подводный камень и Награда */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  <AlertTriangle size={16} /> Тайный твист / Осложнение
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                  {currentQuest.twist}
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  <Coins size={16} /> Обещанная награда
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-title)', fontWeight: 'bold', lineHeight: '1.4' }}>
                  {currentQuest.reward}
                </p>
              </div>
            </div>

            {/* Блок 4: Слухи в округе */}
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0 12px 0', fontSize: '15px', color: 'var(--text-title)' }}>
                <MessageSquare size={18} color="var(--accent-primary)" />
                Слухи и кривотолки в таверне
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentQuest.rumors.map((rumor, idx) => (
                  <div key={idx} style={{ 
                    padding: '12px 14px', 
                    borderRadius: '8px', 
                    backgroundColor: 'var(--bg-input)', 
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 'bold', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        backgroundColor: rumor.type === 'truth' ? 'rgba(34, 197, 94, 0.15)' : (rumor.type === 'halftruth' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)'),
                        color: rumor.type === 'truth' ? '#4ade80' : (rumor.type === 'halftruth' ? '#facc15' : '#f87171')
                      }}>
                        {rumor.label}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-title)', lineHeight: '1.4' }}>
                      «{rumor.text}»
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ: Сохраненные квесты */}
      <div className="npc-saved-panel">
        <h3 className="saved-title">
          <span>Сохранённые заказы</span>
          <span className="saved-count">{savedQuests.length}</span>
        </h3>

        <div className="saved-list">
          {savedQuests.length === 0 ? (
            <div className="saved-empty-state">
              <span>⭐</span>
              <p>Нажмите значок закладки, чтобы сохранить заказ на будущее.</p>
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
  );
}
