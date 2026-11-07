import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/LanguageContext.jsx';
import { 
  Store, 
  Beer, 
  Backpack, 
  Sword, 
  Shield, 
  Hammer, 
  Map, 
  Package, 
  Handshake, 
  Search, 
  X, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import pricesData from '../../prices.json';

const categories = [
  { id: 'all', label: 'Все товары', icon: Sparkles },
  { id: 'tavernAndFood', label: 'Таверна и еда', icon: Beer },
  { id: 'adventuringGear', label: 'Снаряжение', icon: Backpack },
  { id: 'weapons', label: 'Оружие', icon: Sword },
  { id: 'armor', label: 'Броня', icon: Shield },
  { id: 'tools', label: 'Инструменты', icon: Hammer },
  { id: 'mounts', label: 'Транспорт', icon: Map },
  { id: 'tradeGoods', label: 'Торговые товары', icon: Package },
  { id: 'services', label: 'Услуги', icon: Handshake }
];

const currencyColors = {
  cp: { bg: 'rgba(184, 115, 51, 0.1)', border: 'rgba(184, 115, 51, 0.4)', text: '#d97706' }, 
  sp: { bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.4)', text: '#9ca3af' }, 
  ep: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.4)', text: '#10b981' }, 
  gp: { bg: 'rgba(250, 204, 21, 0.1)', border: 'rgba(250, 204, 21, 0.4)', text: '#facc15' }, 
  pp: { bg: 'rgba(224, 231, 255, 0.1)', border: 'rgba(224, 231, 255, 0.4)', text: '#818cf8' }  
};

export default function PricesTab() {
  const { t, language } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('weapons');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState('all'); // 'all' | 'category'

  // Плоский список всех предметов с привязкой к категориям
  const allItems = useMemo(() => {
    return categories
      .filter((cat) => cat.id !== 'all')
      .flatMap((cat) =>
        (pricesData[cat.id] || []).map((item) => ({
          ...item,
          categoryId: cat.id,
          categoryLabel: cat.label
        }))
      );
  }, []);

  const query = searchQuery.trim().toLowerCase();

  // Подсчёт количества товаров в каждой категории (с учётом поиска)
  const categoryCounts = useMemo(() => {
    const counts = {};
    let totalAll = 0;

    categories.forEach((cat) => {
      if (cat.id === 'all') return;
      const rawList = pricesData[cat.id] || [];
      const filtered = query
        ? rawList.filter((item) => {
            const nameRu = (item.name || '').toLowerCase();
            const nameEn = (item.name_en || '').toLowerCase();
            return nameRu.includes(query) || nameEn.includes(query);
          })
        : rawList;
      counts[cat.id] = filtered.length;
      totalAll += filtered.length;
    });

    counts.all = totalAll;
    return counts;
  }, [query]);

  // Фильтрация товаров для таблицы
  const displayedItems = useMemo(() => {
    let source = [];

    // Если активна вкладка "Все товары" или выбран глобальный поиск
    if (activeCategory === 'all' || (query && searchScope === 'all')) {
      source = allItems;
    } else {
      source = (pricesData[activeCategory] || []).map((item) => {
        const cat = categories.find((c) => c.id === activeCategory);
        return {
          ...item,
          categoryId: activeCategory,
          categoryLabel: cat ? cat.label : ''
        };
      });
    }

    if (!query) {
      return source;
    }

    return source.filter((item) => {
      const nameRu = (item.name || '').toLowerCase();
      const nameEn = (item.name_en || '').toLowerCase();
      return nameRu.includes(query) || nameEn.includes(query);
    });
  }, [activeCategory, query, searchScope, allItems]);

  const activeCategoryObj = categories.find((c) => c.id === activeCategory);

  return (
    <div style={{ padding: '20px', color: 'var(--text-title)', maxWidth: '1100px', margin: '0 auto', height: 'calc(100vh - 40px)', overflowY: 'auto', boxSizing: 'border-box' }}>
      
      {/* Заголовок со строкой поиска в шапке */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <Store size={28} color="var(--accent-primary)" />
          {t('prices.title')}
        </h2>

        {/* Быстрый бейдж общего количества */}
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {query ? t('prices.foundCount', { count: displayedItems.length }) : t('prices.totalHandbook', { count: allItems.length })}
        </span>
      </div>

      {/* --- ГЛАВНЫЙ КОНТЕЙНЕР (Сайдбар + Таблица) --- */}
      <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
        
        {/* ЛЕВОЕ МЕНЮ (Сайдбар) */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          minWidth: '230px', 
          flexShrink: 0 
        }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = categoryCounts[cat.id] ?? 0;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  if (cat.id === 'all') {
                    setSearchScope('all');
                  }
                }}
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: isActive ? 'var(--bg-module)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : (query && count === 0 ? 'rgba(255,255,255,0.25)' : 'var(--text-muted)'),
                  border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : 'normal',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={17} />
                  <span>{t(`prices.categories.${cat.id}`) || cat.label}</span>
                </div>
                <span style={{ 
                  fontSize: '11px', 
                  padding: '2px 7px', 
                  borderRadius: '10px', 
                  backgroundColor: isActive ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontWeight: '600'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ПРАВАЯ ЧАСТЬ (Поиск + Таблица товаров) */}
        <div style={{ 
          flex: 1, 
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minWidth: 0
        }}>
          
          {/* Поле живого поиска */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--bg-module)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '8px 14px'
          }}>
            <Search size={18} color={query ? 'var(--text-title)' : 'var(--text-muted)'} />
            <input 
              type="text"
              placeholder={t('prices.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--text-title)',
                fontSize: '14px'
              }}
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                title={t('prices.resetSearch')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Панель переключения области поиска при непустом запросе */}
          {query && activeCategory !== 'all' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontSize: '12px'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>
                {t('prices.searchScope')}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSearchScope('all')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: searchScope === 'all' ? 'var(--accent-primary)' : 'var(--border-color)',
                    backgroundColor: searchScope === 'all' ? 'var(--accent-primary)' : 'transparent',
                    color: searchScope === 'all' ? 'white' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: searchScope === 'all' ? '600' : 'normal'
                  }}
                >
                  {t('prices.scopeAllWithCount', { count: categoryCounts.all })}
                </button>
                <button
                  type="button"
                  onClick={() => setSearchScope('category')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: searchScope === 'category' ? 'var(--accent-primary)' : 'var(--border-color)',
                    backgroundColor: searchScope === 'category' ? 'var(--accent-primary)' : 'transparent',
                    color: searchScope === 'category' ? 'white' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: searchScope === 'category' ? '600' : 'normal'
                  }}
                >
                  {t('prices.scopeCategoryWithCount', {
                    category: t(`prices.categories.${activeCategory}`) || activeCategoryObj?.label,
                    count: categoryCounts[activeCategory] || 0
                  })}
                </button>
              </div>
            </div>
          )}

          {/* Таблица товаров */}
          <div style={{ 
            backgroundColor: 'var(--bg-input)', 
            borderRadius: '8px', 
            border: '1px solid var(--border-color)', 
            overflow: 'hidden' 
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '3fr 1fr 1fr', 
              padding: '14px 20px', 
              color: 'var(--text-muted)', 
              fontSize: '12px', 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              borderBottom: '2px solid var(--border-color)',
              backgroundColor: 'var(--bg-module)'
            }}>
              <span>{t('prices.table.name')}</span>
              <span style={{ textAlign: 'center' }}>{t('prices.table.weight')}</span>
              <span style={{ textAlign: 'right' }}>{t('prices.table.cost')}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {displayedItems.map((item) => {
                const showCategoryBadge = activeCategory === 'all' || (query && searchScope === 'all');

                return (
                  <div key={item.id} className="price-row" style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0 }}>
                      <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-title)' }}>
                        {language === 'en' && item.name_en ? item.name_en : item.name}
                      </span>
                      {showCategoryBadge && (
                        <span style={{
                          fontSize: '11px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.07)',
                          color: 'var(--text-muted)',
                          fontWeight: '500'
                        }}>
                          {t(`prices.categories.${item.categoryId}`) || item.categoryLabel}
                        </span>
                      )}
                    </div>

                    <span style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      {item.weight > 0 ? item.weight : '—'}
                    </span>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        backgroundColor: currencyColors[item.currency]?.bg || 'transparent',
                        color: currencyColors[item.currency]?.text || 'var(--text-title)',
                        border: `1px solid ${currencyColors[item.currency]?.border || 'var(--border-color)'}`
                      }}>
                        {item.cost} <span style={{ fontSize: '11px', opacity: 0.8 }}>{item.currency.toUpperCase()}</span>
                      </span>
                    </div>
                  </div>
                );
              })}

              {displayedItems.length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: 'var(--text-title)' }}>
                    {t('prices.nothingFound')} {query && <>{t('prices.byQuery')} <strong style={{ color: 'var(--text-title)' }}>«{query}»</strong></>}
                  </p>
                  {query && searchScope === 'category' && categoryCounts.all > 0 ? (
                    <button
                      type="button"
                      onClick={() => setSearchScope('all')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        backgroundColor: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      {t('prices.searchAllSections', { count: categoryCounts.all })} <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: 'transparent',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      {t('prices.resetSearch')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
