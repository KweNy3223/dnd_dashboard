import React, { useState } from 'react';
import { Store, Beer, Backpack, Sword, Shield, Hammer, Map, Package, Handshake } from 'lucide-react';
import pricesData from '../../prices.json';

const categories = [
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
  const [activeCategory, setActiveCategory] = useState('weapons');
  const currentItems = pricesData[activeCategory] || [];

  return (
    <div style={{ padding: '20px', color: 'var(--text-title)', maxWidth: '1100px', margin: '0 auto', height: 'calc(100vh - 40px)', overflowY: 'auto', boxSizing: 'border-box' }}>
      
      {/* Заголовок с иконкой */}
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 25px 0' }}>
        <Store size={28} color="var(--accent-primary)" />
        Справочник цен
      </h2>

      {/* --- ГЛАВНЫЙ КОНТЕЙНЕР (Сайдбар + Таблица) --- */}
      <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
        
        {/* ЛЕВОЕ МЕНЮ (Сайдбар) */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          minWidth: '220px', /* Фиксированная ширина меню */
          flexShrink: 0 
        }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px 16px',
                  backgroundColor: activeCategory === cat.id ? 'var(--bg-module)' : 'transparent',
                  color: activeCategory === cat.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                  border: `1px solid ${activeCategory === cat.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  textAlign: 'left',
                  fontSize: '15px',
                  fontWeight: activeCategory === cat.id ? '600' : 'normal',
                  transition: 'all 0.2s',
                  boxShadow: activeCategory === cat.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <Icon size={18} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ПРАВАЯ ЧАСТЬ (Таблица товаров) */}
        <div style={{ 
          flex: 1, /* Занимает всё оставшееся место */
          backgroundColor: 'var(--bg-input)', 
          borderRadius: '8px', 
          border: '1px solid var(--border-color)', 
          overflow: 'hidden' 
        }}>
          <div style={{ 
            display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', padding: '15px 20px', color: 'var(--text-muted)', 
            fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid var(--border-color)',
            backgroundColor: 'var(--bg-module)'
          }}>
            <span>Название предмета</span>
            <span style={{ textAlign: 'center' }}>Вес (фунты)</span>
            <span style={{ textAlign: 'right' }}>Стоимость</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {currentItems.map((item) => (
              <div key={item.id} className="price-row" style={{ padding: '12px 20px' }}>
                <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-title)' }}>
                  {item.name}
                </span>
                <span style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  {item.weight > 0 ? item.weight : '—'}
                </span>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '4px 8px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold',
                    backgroundColor: currencyColors[item.currency]?.bg || 'transparent',
                    color: currencyColors[item.currency]?.text || 'var(--text-title)',
                    border: `1px solid ${currencyColors[item.currency]?.border || 'var(--border-color)'}`
                  }}>
                    {item.cost} <span style={{ fontSize: '11px', opacity: 0.8 }}>{item.currency.toUpperCase()}</span>
                  </span>
                </div>
              </div>
            ))}
            {currentItems.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                В этой категории пока нет товаров.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}