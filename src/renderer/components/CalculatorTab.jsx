import React, { useState } from 'react';
import { Calculator } from 'lucide-react'; // Импортируем иконку
import { useTranslation } from '../i18n/LanguageContext.jsx';

const currencyKeys = {
  pp: 'calculator.pp',
  gp: 'calculator.gp',
  ep: 'calculator.ep',
  sp: 'calculator.sp',
  cp: 'calculator.cp'
};

const exchangeRates = {
  pp: 1000,
  gp: 100,
  ep: 50,
  sp: 10,
  cp: 1
};

export default function CalculatorTab() {
  const { t } = useTranslation();
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
        {t('calculator.title')}
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ backgroundColor: 'var(--bg-module)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-title)' }}>{t('calculator.enterCoins')}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            {['pp', 'gp', 'ep', 'sp', 'cp'].map((coin) => (
              <div key={coin} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t(currencyKeys[coin])}</label>
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
              {t('calculator.clear')}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          <div style={{ backgroundColor: 'var(--bg-module)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-title)' }}>{t('calculator.totalValue')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('calculator.inPlatinum')}</span>
                <strong style={{ color: 'var(--text-title)' }}>{totalEquivalents.pp}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('calculator.inGold')}</span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '16px' }}>{totalEquivalents.gp}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('calculator.inElectrum')}</span>
                <strong style={{ color: 'var(--text-title)' }}>{totalEquivalents.ep}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('calculator.inSilver')}</span>
                <strong style={{ color: 'var(--text-title)' }}>{totalEquivalents.sp}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('calculator.inCopper')}</span>
                <strong style={{ color: 'var(--text-title)' }}>{totalEquivalents.cp}</strong>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-module)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-title)' }}>{t('calculator.rates')}</h3>
            <ul style={{ color: 'var(--text-muted)', margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>{t('calculator.ratePp')}</li>
              <li>{t('calculator.rateGp')}</li>
              <li>{t('calculator.rateEp')}</li>
              <li>{t('calculator.rateSp')}</li>
              <li>{t('calculator.rateCp')}</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}