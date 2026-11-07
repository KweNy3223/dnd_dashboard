import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext.jsx';
import { rulesDataRu, rulesDataEn } from '../data/rulesData.js';
import { 
  BookOpen, Skull, Swords, ShieldHalf, AlertTriangle, 
  Eye, Tent, Footprints, Brain, ArrowDownToLine, 
  HeartPulse, Waves, Zap, Pickaxe, Search, X 
} from 'lucide-react';

const categories = [
  { id: 'conditions', label: 'Состояния', icon: Skull },
  { id: 'combat', label: 'Действия в бою', icon: Swords },
  { id: 'cover', label: 'Укрытия', icon: ShieldHalf },
  { id: 'exhaustion', label: 'Истощение', icon: AlertTriangle },
  { id: 'vision', label: 'Зрение и Свет', icon: Eye },
  { id: 'rest', label: 'Отдых', icon: Tent },
  { id: 'movement', label: 'Прыжки и Движение', icon: Footprints },
  { id: 'concentration', label: 'Концентрация', icon: Brain },
  { id: 'falling', label: 'Урон от падения', icon: ArrowDownToLine },
  { id: 'deathSaves', label: 'Спасброски от смерти', icon: HeartPulse },
  { id: 'underwater', label: 'Подводный бой', icon: Waves },
  { id: 'twoWeapon', label: 'Бой двумя оружиями', icon: Zap },
  { id: 'objects', label: 'Прочность предметов', icon: Pickaxe }
];

export default function RulesTab() {
  const { t, language } = useTranslation();
  const rulesData = language === 'en' ? rulesDataEn : rulesDataRu;
  const [activeCategory, setActiveCategory] = useState('conditions');
  const [searchQuery, setSearchQuery] = useState('');

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  // Поиск по всем правилам во всех категориях
  const searchResults = isSearching
    ? categories.flatMap(cat => {
        const list = rulesData[cat.id] || [];
        return list
          .filter(rule => {
            const inName = rule.name.toLowerCase().includes(trimmedQuery);
            const inPoints = rule.points.some(p => p.toLowerCase().includes(trimmedQuery));
            return inName || inPoints;
          })
          .map(rule => ({
            ...rule,
            categoryLabel: t(`rules.categories.${cat.id}`) || cat.label,
            categoryId: cat.id,
            categoryIcon: cat.icon
          }));
      })
    : [];

  const currentRules = isSearching ? searchResults : (rulesData[activeCategory] || []);

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'var(--text-title)', borderRadius: '3px', padding: '0 3px', fontWeight: 'bold' }}>
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div style={{ padding: '20px', color: 'var(--text-title)', maxWidth: '1100px', margin: '0 auto', height: 'calc(100vh - 40px)', overflowY: 'auto', boxSizing: 'border-box' }}>
      
      {/* Шапка: Заголовок + Строка живого поиска */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '24px' }}>
          <BookOpen size={26} color="var(--text-title)" />
          {t('rules.title')}
        </h2>

        {/* Поле поиска */}
        <div style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('rules.searchPlaceholder')}
            style={{
              width: '100%',
              padding: '10px 38px 10px 40px',
              backgroundColor: 'var(--bg-module)',
              border: `1px solid ${isSearching ? 'rgba(255, 255, 255, 0.35)' : 'var(--border-color)'}`,
              borderRadius: '8px',
              color: 'var(--text-title)',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              title="Очистить поиск"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Индикатор результатов поиска */}
      {isSearching && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '10px 16px', 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '8px', 
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <div>
            {t('rules.foundMatches', { count: searchResults.length, query: searchQuery })}
          </div>
          <button 
            type="button" 
            onClick={() => setSearchQuery('')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-primary)', 
              cursor: 'pointer', 
              fontSize: '13px', 
              textDecoration: 'underline' 
            }}
          >
            {t('rules.resetSearch')}
          </button>
        </div>
      )}

      {/* ГЛАВНЫЙ КОНТЕЙНЕР (Сайдбар + Карточки) */}
      <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
        
        {/* ЛЕВОЕ МЕНЮ (Сайдбар) */}
        <div style={{ 
          display: 'flex', flexDirection: 'column', gap: '8px', 
          minWidth: '240px', flexShrink: 0 
        }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = !isSearching && activeCategory === cat.id;
            const categoryTitle = t(`rules.categories.${cat.id}`) || cat.label;
            
            // Если включен поиск, подсчитаем количество совпадений в этой категории
            let matchCountInCat = 0;
            if (isSearching) {
              const list = rulesData[cat.id] || [];
              matchCountInCat = list.filter(r => 
                r.name.toLowerCase().includes(trimmedQuery) || 
                r.points.some(p => p.toLowerCase().includes(trimmedQuery))
              ).length;
            }

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  if (isSearching) setSearchQuery('');
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px',
                  backgroundColor: isSelected ? 'var(--bg-card)' : 'transparent',
                  color: isSelected ? '#ffffff' : (matchCountInCat > 0 ? 'var(--text-title)' : 'var(--text-muted)'),
                  border: `1px solid ${isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--border-color)'}`,
                  borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                  fontSize: '15px', fontWeight: isSelected || matchCountInCat > 0 ? '600' : 'normal',
                  transition: 'all 0.2s', boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                  opacity: isSearching && matchCountInCat === 0 ? 0.45 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} color={isSelected ? '#ffffff' : 'currentColor'} />
                  {categoryTitle}
                </div>
                {isSearching && matchCountInCat > 0 && (
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '2px 7px', 
                    borderRadius: '10px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                    color: '#ffffff', 
                    fontWeight: 'bold' 
                  }}>
                    {matchCountInCat}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ПРАВАЯ ЧАСТЬ (Список карточек) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {currentRules.length === 0 ? (
            <div style={{ 
              backgroundColor: 'var(--bg-module)', 
              borderRadius: '8px', 
              border: '1px dashed var(--border-color)', 
              padding: '40px 20px', 
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <BookOpen size={40} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
              <p style={{ margin: '0 0 6px 0', fontSize: '16px', color: 'var(--text-title)', fontWeight: 'bold' }}>
                {t('rules.nothingFound', { query: searchQuery })}
              </p>
              <p style={{ margin: 0, fontSize: '13px' }}>
                {t('rules.tryOtherWords')}
              </p>
            </div>
          ) : (
            currentRules.map((rule, index) => {
              const CategoryIcon = rule.categoryIcon;
              return (
                <div 
                  key={index} 
                  style={{ 
                    backgroundColor: 'var(--bg-input)', borderRadius: '8px', 
                    border: '1px solid var(--border-color)', padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 10px 0', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-title)', fontSize: '18px', fontWeight: '600' }}>
                      {highlightMatch(rule.name, trimmedQuery)}
                    </h3>
                    {isSearching && rule.categoryLabel && (
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontSize: '12px', 
                        padding: '3px 10px', 
                        borderRadius: '12px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.08)', 
                        color: 'var(--text-primary)', 
                        border: '1px solid var(--border-color)',
                        fontWeight: '600'
                      }}>
                        {CategoryIcon && <CategoryIcon size={13} />}
                        {rule.categoryLabel}
                      </span>
                    )}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-title)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {rule.points.map((point, i) => (
                      <li key={i} style={{ lineHeight: '1.5', fontSize: '14px' }}>
                        {highlightMatch(point, trimmedQuery)}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}