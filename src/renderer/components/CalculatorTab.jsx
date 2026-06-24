import React, { useState } from 'react';
import { Calculator } from 'lucide-react'; // Импортируем иконку

const currencyMap = {
  pp: 'ПМ (Платина)',
  gp: 'ЗМ (Золото)',
  ep: 'ЭМ (Электрум)',
  sp: 'СМ (Серебро)',
  cp: 'ММ (Медь)'
};

const exchangeRates = {
  pp: 1000,
  gp: 100,
  ep: 50,
  sp: 10,
  cp: 1
};

export default function CalculatorTab() {
  const [loot, setLoot] = useState({ pp: '', gp: '', ep: '', sp: '', cp: '' });

  const handleLootChange = (coin, value) => {
    setLoot(prev => ({ ...prev, [coin]: value }));
  };

  const totalBaseCp = 
    (parseInt(loot.pp) || 0) * exchangeRates.pp +
    (parseInt(loot.gp) || 0) * exchangeRates.gp +
    (parseInt(loot.ep) || 0) * exchangeRates.ep +
    (parseInt(loot.sp) || 0) * exchangeRates.sp +
    (parseInt(loot.cp) || 0) * exchangeRates.cp;

  const totalEquivalents = {
    pp: Math.round(totalBaseCp / exchangeRates.pp * 100) / 100,
    gp: Math.round(totalBaseCp / exchangeRates.gp * 100) / 100,
    ep: Math.round(totalBaseCp / exchangeRates.ep * 100) / 100,
    sp: Math.round(totalBaseCp / exchangeRates.sp * 100) / 100,
    cp: totalBaseCp,
  };

  return (
    <div style={{ padding: '20px', color: 'var(--text-title)', maxWidth: '900px', margin: '0 auto', height: 'calc(100vh - 40px)', overflowY: 'auto', boxSizing: 'border-box' }}>
      
      {/* Заголовок с иконкой */}
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0' }}>
        <Calculator size={28} color="var(--accent-primary)" />
        Калькулятор лута
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ backgroundColor: 'var(--bg-module)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-title)' }}>Введи найденные монеты:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            {['pp', 'gp', 'ep', 'sp', 'cp'].map((coin) => (
              <div key={coin} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{currencyMap[coin]}</label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="0"
                  value={loot[coin]}
                  onChange={(e) => handleLootChange(coin, e.target.value)}
                  style={{
                    width: '100px', padding: '10px', backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)', borderRadius: '6px',
                    color: 'var(--text-title)', outline: 'none', fontSize: '16px'
                  }}
                />
              </div>
            ))}
            <button 
              onClick={() => setLoot({ pp: '', gp: '', ep: '', sp: '', cp: '' })}
              style={{ marginTop: '22px', padding: '0 15px', backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}
            >
              Очистить
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          <div style={{ backgroundColor: 'var(--bg-module)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-title)' }}>Общая ценность равна:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
                <span style={{ color: 'var(--text-muted)' }}>В платине (ПМ):</span>
                <strong style={{ color: 'var(--text-title)' }}>{totalEquivalents.pp}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
                <span style={{ color: 'var(--text-muted)' }}>В золоте (ЗМ):</span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '16px' }}>{totalEquivalents.gp}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
                <span style={{ color: 'var(--text-muted)' }}>В электруме (ЭМ):</span>
                <strong style={{ color: 'var(--text-title)' }}>{totalEquivalents.ep}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
                <span style={{ color: 'var(--text-muted)' }}>В серебре (СМ):</span>
                <strong style={{ color: 'var(--text-title)' }}>{totalEquivalents.sp}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>В меди (ММ):</span>
                <strong style={{ color: 'var(--text-title)' }}>{totalEquivalents.cp}</strong>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-module)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-title)' }}>Памятка: Курс валют</h3>
            <ul style={{ color: 'var(--text-muted)', margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong style={{ color: 'var(--text-title)' }}>1 ПМ (Платина)</strong> = 10 ЗМ = 1 000 ММ</li>
              <li><strong style={{ color: 'var(--text-title)' }}>1 ЗМ (Золото)</strong> = 2 ЭМ = 10 СМ = 100 ММ</li>
              <li><strong style={{ color: 'var(--text-title)' }}>1 ЭМ (Электрум)</strong> = 5 СМ = 50 ММ</li>
              <li><strong style={{ color: 'var(--text-title)' }}>1 СМ (Серебро)</strong> = 10 ММ</li>
              <li><strong style={{ color: 'var(--text-title)' }}>1 ММ (Медь)</strong> = базовая монета</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}