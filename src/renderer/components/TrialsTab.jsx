import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../i18n/LanguageContext.jsx';
import logoSvg from '../assets/logo.svg';
import { audio } from '../trials/audio.js';
import { dnd, TIER_PRESETS } from '../trials/dnd-engine.js';
import { LockpickGame } from '../trials/games/lockpick.js';
import { TrapGame } from '../trials/games/trap.js';
import { RunesGame } from '../trials/games/runes.js';
import { PickpocketGame } from '../trials/games/pickpocket.js';
import { AlchemyGame } from '../trials/games/alchemy.js';
import { 
  KeyRound, 
  Bomb, 
  Sparkles, 
  Coins, 
  FlaskConical, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  HelpCircle, 
  ShieldAlert, 
  Maximize2, 
  Minimize2,
  Menu,
  Dices,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const GAME_MODULES = {
  lockpick: { id: 'lockpick', name: 'Взлом замка', name_en: 'Lockpicking', icon: KeyRound, Class: LockpickGame },
  trap: { id: 'trap', name: 'Обезвреживание ловушки', name_en: 'Trap Disarming', icon: Bomb, Class: TrapGame },
  runes: { id: 'runes', name: 'Магические руны', name_en: 'Arcane Runes', icon: Sparkles, Class: RunesGame },
  pickpocket: { id: 'pickpocket', name: 'Карманная кража', name_en: 'Pickpocketing', icon: Coins, Class: PickpocketGame },
  alchemy: { id: 'alchemy', name: 'Зельеварение', name_en: 'Alchemy & Brewing', icon: FlaskConical, Class: AlchemyGame }
};

export default function TrialsTab({ onOpenSidebar }) {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const [currentGame, setCurrentGame] = useState('lockpick');
  const [isCurtainOpen, setIsCurtainOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(audio.isMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Параметры D&D
  const [dc, setDc] = useState(dnd.dc);
  const [bonus, setBonus] = useState(dnd.bonus);
  const [tier, setTier] = useState(2);
  const [stealthNoise, setStealthNoise] = useState(false);
  const [lockTheme, setLockTheme] = useState('auto');
  const [lootType, setLootType] = useState('auto');
  const [trapType, setTrapType] = useState('tripwire');
  const [potionType, setPotionType] = useState('healing');
  const [strikerStage, setStrikerStage] = useState(0);
  const [maxPicks, setMaxPicks] = useState(5);
  const [currentPicks, setCurrentPicks] = useState(5);
  const [pickDurability, setPickDurability] = useState(100);

  // Сюжетный объект
  const [challengeName, setChallengeName] = useState(isEn ? 'Mountain Fort Treasure Vault Gate' : 'Тяжёлый кованый сундук бандитов');
  const [challengeDesc, setChallengeDesc] = useState(isEn ? 'Massive stone doors bound with heavy black iron.' : 'Грубый навесной замок со следами ржавчины и царапин от ножа.');

  // Состояние активного раунда
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);

  // Кубик d20 для Мастера
  const [d20Result, setD20Result] = useState(null);
  const [isRollingD20, setIsRollingD20] = useState(false);

  // Модальные окна
  const [outcome, setOutcome] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Ссылки
  const arenaRef = useRef(null);
  const activeGameInstanceRef = useRef(null);
  const sessionStartTimeRef = useRef(performance.now());
  const finishGameRef = useRef(null);
  const stateRef = useRef({
    currentGame: 'lockpick',
    mistakesCount: 0,
    noiseLevel: 0,
    currentPicks: 5,
    maxPicks: 5,
    lockTheme: 'auto',
    lootType: 'auto',
    trapType: 'tripwire',
    potionType: 'healing',
    strikerStage: 0,
    stealthNoise: false,
    challengeName: 'Тяжёлый кованый сундук бандитов'
  });

  stateRef.current.currentGame = currentGame;
  stateRef.current.mistakesCount = mistakesCount;
  stateRef.current.noiseLevel = noiseLevel;
  stateRef.current.currentPicks = currentPicks;
  stateRef.current.maxPicks = maxPicks;
  stateRef.current.lockTheme = lockTheme;
  stateRef.current.lootType = lootType;
  stateRef.current.trapType = trapType;
  stateRef.current.potionType = potionType;
  stateRef.current.strikerStage = strikerStage;
  stateRef.current.stealthNoise = stealthNoise;
  stateRef.current.challengeName = challengeName;

  // Генерация испытания
  const generateNewChallenge = useCallback((gameId = currentGame, currentTier = tier) => {
    const ch = dnd.generateRandomChallenge(gameId);
    const isEnMode = language === 'en';
    setChallengeName(isEnMode ? (ch.name_en || ch.name) : ch.name);
    setChallengeDesc(isEnMode ? (ch.desc_en || ch.desc) : ch.desc);
    setDc(dnd.dc);
  }, [currentGame, tier, language]);

  // Завершение испытания
  const finishGame = useCallback((success, extraData = {}) => {
    if (success) {
      audio.playSuccess();
    } else {
      audio.playFailure();
    }

    const elapsed = Math.max(1, Math.round((performance.now() - sessionStartTimeRef.current) / 100) / 10);
    const activeGameType = extraData.gameType || stateRef.current.currentGame || currentGame;

    const res = dnd.evaluateOutcome({
      success,
      timeSpent: elapsed,
      mistakes: stateRef.current.mistakesCount,
      noiseLevel: stateRef.current.noiseLevel,
      gameType: activeGameType,
      language
    });

    if (extraData.potionName && success) {
      res.subtitle = isEn
        ? `Brewed: ${extraData.potionName} (${extraData.effect || ''})`
        : `Сварено: ${extraData.potionName} (${extraData.effect || ''})`;
    }

    setOutcome(res);
  }, [currentGame, isEn, language]);

  finishGameRef.current = finishGame;

  // Контроллер для мини-игр
  const appController = useRef({
    finishGame: (success, extra) => {
      if (finishGameRef.current) {
        finishGameRef.current(success, extra);
      }
    },
    get language() {
      return language;
    },
    recordMistake: () => {
      setMistakesCount(prev => {
        const next = prev + 1;
        stateRef.current.mistakesCount = next;
        return next;
      });
      setNoiseLevel(n => Math.min(100, n + 25));
    },
    addNoise: (amount) => {
      setNoiseLevel(prev => {
        const next = Math.min(100, Math.max(0, prev + amount));
        if (next >= 95) {
          finishGame(false, { reason: 'noise_alert' });
        }
        return next;
      });
    },
    reduceNoise: (amount) => {
      setNoiseLevel(prev => Math.max(0, prev - amount));
    },
    onPickBroke: () => {
      const remaining = Math.max(0, stateRef.current.currentPicks - 1);
      stateRef.current.currentPicks = remaining;
      setCurrentPicks(remaining);
      setMistakesCount(m => m + 1);
      setPickDurability(0);

      if (remaining <= 0) {
        setTimeout(() => {
          finishGame(false, { reason: 'picks_depleted' });
        }, 500);
        return false;
      }
      return true;
    },
    setPickDurability: (percent) => {
      setPickDurability(Math.max(0, Math.min(100, Math.round(percent))));
    },
    updatePicksDisplay: (durability = 100) => {
      setPickDurability(Math.max(0, Math.min(100, Math.round(durability))));
    },
    getLockTheme: () => {
      if (stateRef.current.lockTheme && stateRef.current.lockTheme !== 'auto') {
        return stateRef.current.lockTheme;
      }
      const objName = (stateRef.current.challengeName || '').toLowerCase();
      if (objName.includes('гном') || objName.includes('механ') || objName.includes('сейф') || objName.includes('шестерен')) {
        return 'dwarven';
      } else if (objName.includes('маг') || objName.includes('руни') || objName.includes('лич') || objName.includes('астрал') || objName.includes('эльф')) {
        return 'arcane';
      }
      return 'iron';
    },
    getLootType: () => {
      if (stateRef.current.lootType && stateRef.current.lootType !== 'auto') {
        return stateRef.current.lootType;
      }
      const objName = (stateRef.current.challengeName || '').toLowerCase();
      if (objName.includes('ключ') || objName.includes('связк')) return 'keys';
      if (objName.includes('письм') || objName.includes('свиток') || objName.includes('документ')) return 'scroll';
      if (objName.includes('амулет') || objName.includes('око') || objName.includes('камен') || objName.includes('реликв')) return 'amulet';
      return 'pouch';
    },
    getTrapType: () => {
      return stateRef.current.trapType || 'tripwire';
    },
    getPotionType: () => {
      return stateRef.current.potionType || 'healing';
    },
    setStrikerStage: (stage) => {
      const s = Math.max(0, Math.min(3, stage));
      stateRef.current.strikerStage = s;
      setStrikerStage(s);
    },
    get strikerStage() {
      return stateRef.current.strikerStage;
    },
    get stealthNoiseEnabled() {
      return stateRef.current.stealthNoise;
    },
    get currentPicks() {
      return stateRef.current.currentPicks;
    },
    get maxPicks() {
      return stateRef.current.maxPicks;
    },
    get mistakesCount() {
      return stateRef.current.mistakesCount;
    }
  });

  // Запуск сессии
  const startSession = useCallback(() => {
    sessionStartTimeRef.current = performance.now();
    setMistakesCount(0);
    setNoiseLevel(0);
    setStrikerStage(0);
    stateRef.current.strikerStage = 0;
    setCurrentPicks(maxPicks);
    stateRef.current.currentPicks = maxPicks;
    setPickDurability(100);

    if (activeGameInstanceRef.current && typeof activeGameInstanceRef.current.start === 'function') {
      activeGameInstanceRef.current.start();
    }
  }, [maxPicks]);

  // Сброс игры
  const resetGame = useCallback(() => {
    sessionStartTimeRef.current = performance.now();
    setMistakesCount(0);
    setNoiseLevel(0);
    setStrikerStage(0);
    stateRef.current.strikerStage = 0;
    setCurrentPicks(maxPicks);
    stateRef.current.currentPicks = maxPicks;
    setPickDurability(100);
    setOutcome(null);

    if (activeGameInstanceRef.current && typeof activeGameInstanceRef.current.reset === 'function') {
      activeGameInstanceRef.current.reset();
    }
  }, [maxPicks]);

  // Инициализация / смена мини-игры
  useEffect(() => {
    sessionStartTimeRef.current = performance.now();
    setOutcome(null);

    if (activeGameInstanceRef.current && typeof activeGameInstanceRef.current.destroy === 'function') {
      activeGameInstanceRef.current.destroy();
      activeGameInstanceRef.current = null;
    }

    generateNewChallenge(currentGame, tier);

    const gameDef = GAME_MODULES[currentGame];
    if (gameDef && arenaRef.current) {
      arenaRef.current.innerHTML = '';
      try {
        const instance = new gameDef.Class(arenaRef.current, appController.current);
        activeGameInstanceRef.current = instance;
        instance.init();
      } catch (err) {
        console.error('Ошибка инициализации мини-игры:', err);
      }
    }

    return () => {
      if (activeGameInstanceRef.current && typeof activeGameInstanceRef.current.destroy === 'function') {
        try {
          activeGameInstanceRef.current.destroy();
        } catch (e) {
          console.warn('Destroy error:', e);
        }
        activeGameInstanceRef.current = null;
      }
    };
  }, [currentGame, generateNewChallenge, tier, language]);

  // Бросок d20
  const handleRollD20 = () => {
    if (isRollingD20) return;
    setIsRollingD20(true);
    audio.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      setD20Result(Math.floor(Math.random() * 20) + 1);
      count++;
      if (count >= 8) {
        clearInterval(interval);
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + bonus;
        setD20Result({ roll, total, isCrit: roll === 20, isFumble: roll === 1, success: total >= dc });
        setIsRollingD20(false);
      }
    }, 45);
  };

  // Полноэкранный режим
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="trials-container">
      {/* ================= ВЕРХНЯЯ ПОЛОСА МИНИ-ИГР ================= */}
      <div className="trials-nav-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onOpenSidebar && (
            <button 
              type="button" 
              className="sidebar-toggle-btn"
              onClick={onOpenSidebar}
              title={t('sidebar.openMenu')}
            >
              <Menu size={20} />
            </button>
          )}
          <img src={logoSvg} alt="d20" style={{ width: '22px', height: '22px', opacity: 0.9 }} />

          <div className="trials-tabs-group">
            {Object.values(GAME_MODULES).map((g) => {
              const Icon = g.icon;
              const isActive = currentGame === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  className={`trials-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setCurrentGame(g.id)}
                >
                  <Icon size={16} />
                  <span>{t(`trials.games.${g.id}`) || g.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="trials-actions-group">
          <button 
            type="button" 
            className={`trials-action-btn curtain-toggle ${isCurtainOpen ? 'active' : ''}`}
            onClick={() => setIsCurtainOpen(!isCurtainOpen)}
            title={t('trials.curtain.title')}
          >
            <ShieldAlert size={16} />
            <span>{t('trials.curtain.title')}</span>
            {isCurtainOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button 
            type="button" 
            className="trials-icon-btn" 
            onClick={() => {
              const muted = audio.toggleMute();
              setIsMuted(muted);
            }}
            title={isMuted ? (isEn ? 'Unmute' : 'Включить звук') : (isEn ? 'Mute' : 'Выключить звук')}
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          <button 
            type="button" 
            className="trials-icon-btn" 
            onClick={toggleFullscreen}
            title={isEn ? 'Fullscreen' : 'Полноэкранный режим'}
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>

          <button 
            type="button" 
            className="trials-icon-btn" 
            onClick={() => setIsHelpOpen(true)}
            title={isEn ? 'Help & Rules' : 'Справка и правила'}
          >
            <HelpCircle size={17} />
          </button>

          <button 
            type="button" 
            className="trials-icon-btn" 
            onClick={resetGame}
            title={isEn ? 'Restart Challenge' : 'Перезапустить испытание'}
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </div>

      {/* ================= ШТОРКА МАСТЕРА ================= */}
      <div className={`trials-curtain ${isCurtainOpen ? 'open' : ''}`}>
        <div className="trials-curtain-grid">
          {/* Колонка 1: Сложность / Зелье */}
          <div className="curtain-box">
            <h4 className="curtain-box-title">
              {currentGame === 'alchemy' ? (isEn ? '🧪 Potion Recipe & Difficulty' : '🧪 Рецепт и сложность зелья') : (isEn ? '🎯 Difficulty & Modifiers' : '🎯 Сложность и Модификаторы')}
            </h4>
            
            {currentGame !== 'alchemy' && (
              <>
                <div className="curtain-row">
                  <label>{isEn ? 'Difficulty (DC):' : 'Сложность (DC):'} <strong>{dc}</strong></label>
                  <input 
                    type="range" 
                    min="8" 
                    max="28" 
                    value={dc} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setDc(val);
                      dnd.setDC(val);
                      if (activeGameInstanceRef.current?.onParametersChanged) {
                        activeGameInstanceRef.current.onParametersChanged(dnd.getEffectiveAdvantage());
                      }
                    }} 
                  />
                </div>

                <div className="curtain-row">
                  <label>{isEn ? 'Character Bonus:' : 'Бонус персонажа:'} <strong>{bonus >= 0 ? `+${bonus}` : bonus}</strong></label>
                  <input 
                    type="range" 
                    min="-2" 
                    max="12" 
                    value={bonus} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setBonus(val);
                      dnd.setBonus(val);
                      if (activeGameInstanceRef.current?.onParametersChanged) {
                        activeGameInstanceRef.current.onParametersChanged(dnd.getEffectiveAdvantage());
                      }
                    }} 
                  />
                </div>
              </>
            )}

            {currentGame === 'lockpick' && (
              <div className="curtain-row">
                <label>{isEn ? 'Lock Style:' : 'Стиль замка:'}</label>
                <select 
                  className="curtain-select"
                  value={lockTheme}
                  onChange={(e) => {
                    setLockTheme(e.target.value);
                    if (activeGameInstanceRef.current?.setTheme) {
                      activeGameInstanceRef.current.setTheme(e.target.value);
                    }
                  }}
                >
                  <option value="auto">{isEn ? '🎲 Auto (from story)' : '🎲 Авто (по сюжету)'}</option>
                  <option value="iron">{isEn ? '⛓️ Wrought Iron' : '⛓️ Кованое железо'}</option>
                  <option value="dwarven">{isEn ? '⚙️ Dwarven Mechanism' : '⚙️ Гномья механика'}</option>
                  <option value="arcane">{isEn ? '✨ Arcane Magic' : '✨ Тайная магия'}</option>
                </select>
              </div>
            )}

            {currentGame === 'pickpocket' && (
              <div className="curtain-row">
                <label>{isEn ? 'Loot Item:' : 'Предмет кражи:'}</label>
                <select 
                  className="curtain-select"
                  value={lootType}
                  onChange={(e) => {
                    setLootType(e.target.value);
                    if (activeGameInstanceRef.current?.setLootType) {
                      activeGameInstanceRef.current.setLootType(e.target.value);
                    }
                  }}
                >
                  <option value="auto">{isEn ? '🎲 Auto (from story)' : '🎲 Авто (по сюжету)'}</option>
                  <option value="pouch">{isEn ? '💰 Heavy pouch of gold' : '💰 Тяжёлый кошель с золотом'}</option>
                  <option value="keys">{isEn ? '🗝️ Dungeon key ring' : '🗝️ Связка ключей от темницы'}</option>
                  <option value="scroll">{isEn ? '📜 Secret letter / scroll' : '📜 Секретное письмо / свиток'}</option>
                  <option value="amulet">{isEn ? '💎 Jeweled amulet' : '💎 Драгоценный амулет'}</option>
                </select>
              </div>
            )}

            {currentGame === 'trap' && (
              <div className="curtain-row">
                <label>{isEn ? 'Trap Mechanism Type:' : 'Тип механизма ловушки:'}</label>
                <select 
                  className="curtain-select"
                  value={trapType}
                  onChange={(e) => {
                    const next = e.target.value;
                    setTrapType(next);
                    stateRef.current.trapType = next;
                    if (activeGameInstanceRef.current?.setTrapType) {
                      activeGameInstanceRef.current.setTrapType(next);
                    }
                  }}
                >
                  <option value="tripwire">{isEn ? '🏹 Tripwire Crossbow (wire & striker)' : '🏹 Арбалетная растяжка (нить и боёк)'}</option>
                  <option value="gears">{isEn ? '⚙️ Clockwork Gearwork (cogs & wedge)' : '⚙️ Зубчатый часовой механизм (шестерня)'}</option>
                  <option value="plate">{isEn ? '⚖️ Counterweight Plate (pressure & weight)' : '⚖️ Плита-противовес (давление и вес)'}</option>
                  <option value="gas">{isEn ? '🧪 Poison Gas Dispenser (gas & valves)' : '🧪 Ядовитый распылитель (газ и клапаны)'}</option>
                </select>
              </div>
            )}

            {currentGame === 'runes' && (
              <div style={{ marginTop: '8px', fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {isEn 
                  ? 'ℹ️ Arcane Ward: at DC < 20, 3 elemental altars are active (Fire, Water, Storm). At DC ≥ 20, the 4th Earth Altar activates.'
                  : 'ℹ️ Магическая печать: при DC < 20 активно 3 стихийных алтаря (Огонь, Вода, Буря). При DC ≥ 20 активируется 4-й алтарь Земли.'}
              </div>
            )}

            {currentGame === 'alchemy' && (
              <>
                <div className="curtain-row">
                  <label>{isEn ? 'Select D&D 5e Recipe:' : 'Выбор рецепта D&D 5e:'}</label>
                  <select 
                    className="curtain-select"
                    value={potionType}
                    onChange={(e) => {
                      const next = e.target.value;
                      setPotionType(next);
                      stateRef.current.potionType = next;
                      if (activeGameInstanceRef.current?.setPotion) {
                        activeGameInstanceRef.current.setPotion(next);
                      }
                    }}
                  >
                    <optgroup label={isEn ? "Common — 3 mistakes allowed" : "Обычные (Common) — 3 ошибки"}>
                      <option value="healing">🍷 {isEn ? "Potion of Healing (2d4+2 HP)" : "Зелье лечения (2d4+2 HP)"}</option>
                      <option value="climbing">🧗 {isEn ? "Potion of Climbing (Athletics)" : "Зелье лазания (Атлетика)"}</option>
                      <option value="animal_friendship">🌿 {isEn ? "Potion of Animal Friendship (24h)" : "Зелье дружбы с животными (24 ч)"}</option>
                    </optgroup>
                    <optgroup label={isEn ? "Uncommon — 2 mistakes allowed" : "Необычные (Uncommon) — 2 ошибки"}>
                      <option value="greater_healing">💖 {isEn ? "Potion of Greater Healing (4d4+4 HP)" : "Большее зелье лечения (4d4+4 HP)"}</option>
                      <option value="water_breathing">🌊 {isEn ? "Potion of Water Breathing (1 hour)" : "Зелье дыхания под водой (1 ч)"}</option>
                      <option value="fire_resistance">🛡️ {isEn ? "Potion of Resistance (Fire)" : "Зелье огнестойкости (Огонь)"}</option>
                      <option value="hill_giant">🦾 {isEn ? "Potion of Hill Giant Strength (STR 21)" : "Зелье силы холмового великана (Сила 21)"}</option>
                      <option value="growth">🍄 {isEn ? "Potion of Growth (+1d4 dmg, size)" : "Зелье роста (+1d4 к урону, размер)"}</option>
                    </optgroup>
                    <optgroup label={isEn ? "Rare — 1 mistake allowed" : "Редкие (Rare) — 1 ошибка"}>
                      <option value="invisibility">👻 {isEn ? "Potion of Invisibility (1 hour)" : "Зелье невидимости (1 ч)"}</option>
                      <option value="heroism">👑 {isEn ? "Potion of Heroism (Bless + 10 HP)" : "Зелье героизма (Благословение + 10 HP)"}</option>
                      <option value="gaseous_form">🌫️ {isEn ? "Potion of Gaseous Form (Mist)" : "Зелье газообразной формы (Туман)"}</option>
                      <option value="invulnerability">🛡️ {isEn ? "Potion of Invulnerability (Resist all)" : "Зелье неуязвимости (Сопротивление всему)"}</option>
                    </optgroup>
                    <optgroup label={isEn ? "Very Rare — 1 mistake allowed" : "Очень редкие (Very Rare) — 1 ошибка"}>
                      <option value="speed">⚡ {isEn ? "Potion of Speed (Haste)" : "Зелье скорости (Ускорение)"}</option>
                      <option value="flying">🕊️ {isEn ? "Potion of Flying (60 ft)" : "Зелье полёта (60 футов)"}</option>
                      <option value="supreme_healing">🌟 {isEn ? "Potion of Supreme Healing (10d4+20 HP)" : "Высшее зелье лечения (10d4+20 HP)"}</option>
                    </optgroup>
                    <optgroup label={isEn ? "Legendary — 1 mistake allowed" : "Легендарные (Legendary) — 1 ошибка"}>
                      <option value="storm_giant">⛈️ {isEn ? "Potion of Storm Giant Strength (STR 29!)" : "Зелье силы великана бурь (Сила 29!)"}</option>
                    </optgroup>
                  </select>
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {isEn 
                    ? 'ℹ️ Scaled to D&D canon: potent brews demand strict temperature corridors, complex steps, and carry high spoiling risk.'
                    : 'ℹ️ Сложность определяется каноном D&D: чем могущественнее эффект, тем строже допуск по температуре, сложнее шаги и выше риск порчи варева.'}
                </p>
              </>
            )}
          </div>

          {/* Колонка 2: Специальные параметры мини-игры */}
          <div className="curtain-box">
            <h4 className="curtain-box-title">
              {currentGame === 'lockpick' && (isEn ? '🗝️ Lockpicks & Stealth' : '🗝️ Отмычки и Скрытность')}
              {currentGame === 'trap' && (isEn ? '⚙️ Mechanism & Striker' : '⚙️ Механизм и Боёк')}
              {currentGame === 'runes' && (isEn ? '✨ Ward Structure' : '✨ Структура печати')}
              {currentGame === 'pickpocket' && (isEn ? '👥 Awareness & Stealth' : '👥 Бдительность и Скрытность')}
              {currentGame === 'alchemy' && (isEn ? '⚗️ Crucible & Reagents' : '⚗️ Тигель и Реагенты')}
            </h4>

            {currentGame === 'lockpick' && (
              <>
                <div className="curtain-row">
                  <label>{isEn ? 'Player lockpick stock:' : 'Запас отмычек у персонажа:'}</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      min="1" 
                      max="50" 
                      value={maxPicks} 
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                        setMaxPicks(val);
                        setCurrentPicks(val);
                        stateRef.current.maxPicks = val;
                        stateRef.current.currentPicks = val;
                      }}
                      className="curtain-select"
                      style={{ width: '70px', textAlign: 'center', fontWeight: 'bold' }}
                    />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{isEn ? 'pcs.' : 'шт.'}</span>
                    <input 
                      type="range" 
                      min="1" 
                      max="20" 
                      value={Math.min(20, maxPicks)} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setMaxPicks(val);
                        setCurrentPicks(val);
                        stateRef.current.maxPicks = val;
                        stateRef.current.currentPicks = val;
                      }} 
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                <div className="curtain-toggle-row">
                  <label>{isEn ? 'Guard noise meter (stealth):' : 'Шкала шума стражи (стелс):'}</label>
                  <input 
                    type="checkbox" 
                    checked={stealthNoise} 
                    onChange={(e) => setStealthNoise(e.target.checked)} 
                  />
                </div>

                <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {isEn 
                    ? 'ℹ️ Lockpicks bend and break under excessive pressure. When stealth is on, rattling fills the guard alert meter.'
                    : 'ℹ️ Отмычки гнутся и ломаются при сильном упоре. При включённом стелсе звон замка заполняет шкалу тревоги стражи.'}
                </p>
              </>
            )}

            {currentGame === 'trap' && (
              <>
                <div style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                  <p style={{ margin: '0 0 6px 0' }}><strong>{isEn ? 'Striker fuse:' : 'Предохранитель бойка:'}</strong> {isEn ? '3 clicks until detonation.' : '3 щелчка до детонации.'}</p>
                  <p style={{ margin: '0 0 6px 0' }}><strong>{isEn ? 'Detonation damage:' : 'Урон при взрыве:'}</strong> {tier === 1 ? '2d10' : tier === 2 ? '4d10' : '8d10'} {isEn ? 'damage.' : 'урона.'}</p>
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {isEn 
                    ? 'ℹ️ Traps require steady hands in the active trigger zone. Fumbles advance the striker closer to detonation.'
                    : 'ℹ️ Ловушка требует филигранного удержания пинцета в рабочей зоне триггера. При срыве боёк взводится ближе к детонации.'}
                </p>
              </>
            )}

            {currentGame === 'runes' && (
              <>
                <div style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                  <p style={{ margin: '0 0 6px 0' }}><strong>{isEn ? 'Ward rings:' : 'Кольца печати:'}</strong> {isEn ? '3 concentric circles (Inner, Middle, Outer).' : '3 концентрических круга (Внутреннее, Среднее, Внешнее).'}</p>
                  <p style={{ margin: '0 0 6px 0' }}><strong>{isEn ? 'Controls:' : 'Управление:'}</strong> {isEn ? 'Keys 1, 2, 3 — select ring; A/D or scroll wheel — rotate.' : <>Клавиши <code>1, 2, 3</code> — выбор кольца; <code>A/D</code> или колёсико — поворот.</>}</p>
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {isEn 
                    ? 'ℹ️ Mana radiates from the central core in 4 directions. Align conduits to connect colored elemental altars.'
                    : 'ℹ️ Мана бьёт из центрального ядра по 4 направлениям. Совмещайте золотые желоба, чтобы замкнуть цветные алтари.'}
                </p>
              </>
            )}

            {currentGame === 'pickpocket' && (
              <>
                <div className="curtain-toggle-row">
                  <label>{isEn ? 'Target awareness meter (stealth):' : 'Шкала бдительности жертвы (стелс):'}</label>
                  <input 
                    type="checkbox" 
                    checked={stealthNoise} 
                    onChange={(e) => setStealthNoise(e.target.checked)} 
                  />
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {isEn 
                    ? 'ℹ️ Slowly slide the item out of the target’s pocket. Sudden jerks or touches raise suspicion and trigger an alert.'
                    : 'ℹ️ Медленно вытягивайте предмет из кармана жертвы. Резкие рывки и касания краёв вызывают подозрение и крик «Держи вора!».'}
                </p>
              </>
            )}

            {currentGame === 'alchemy' && (
              <>
                <div style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                  <p style={{ margin: '0 0 4px 0' }}>💨 <strong>{isEn ? 'Bellows (SPACE):' : 'Меха (ПРОБЕЛ):'}</strong> {isEn ? 'raise crucible flame heat.' : 'накал пламени тигля.'}</p>
                  <p style={{ margin: '0 0 4px 0' }}>🥄 <strong>{isEn ? 'Stirring (A/D):' : 'Помешивание (A/D):'}</strong> {isEn ? 'clockwise ↻ or counter-clockwise ↺.' : 'по часовой ↻ или против ↺.'}</p>
                  <p style={{ margin: '0 0 4px 0' }}>🌿 <strong>{isEn ? 'Reagents:' : 'Реагенты:'}</strong> {isEn ? 'add strictly within green temperature zone.' : 'всыпать строго в зелёной зоне.'}</p>
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {isEn 
                    ? 'ℹ️ Violating the recipe or temperature destabilizes the brew. Exceeding mistake limits spoils the potion!'
                    : 'ℹ️ При нарушении рецепта или температуры варево теряет стабильность. Превышение лимита ошибок портит зелье!'}
                </p>
              </>
            )}
          </div>

          {/* Колонка 3: Генератор испытаний и кубик */}
          <div className="curtain-box">
            <h4 className="curtain-box-title">🎲 Генератор и Кубик d20</h4>

            <div className="curtain-row">
              <label>{t('trials.curtain.tierPresets')}</label>
              <select 
                className="curtain-select"
                value={tier}
                onChange={(e) => {
                  const tVal = parseInt(e.target.value, 10);
                  setTier(tVal);
                  dnd.setTier(tVal);
                  generateNewChallenge(currentGame, tVal);
                }}
              >
                <option value="1">{t('trials.curtain.tier1')}</option>
                <option value="2">{t('trials.curtain.tier2')}</option>
                <option value="3">{t('trials.curtain.tier3')}</option>
                <option value="4">{t('trials.curtain.tier4')}</option>
              </select>
            </div>

            <button 
              type="button" 
              className="trials-btn secondary" 
              onClick={() => generateNewChallenge(currentGame, tier)}
              style={{ width: '100%', marginBottom: '10px' }}
            >
              {t('trials.curtain.randomize')}
            </button>

            <div className="d20-roller-box">
              <div className="d20-display">
                <span>{t('trials.curtain.d20Result')}</span>
                <span className="d20-val">
                  {typeof d20Result === 'object' && d20Result !== null ? (
                    `${d20Result.roll} + ${bonus >= 0 ? '+' : ''}${bonus} = ${d20Result.total} ${d20Result.isCrit ? '🌟' : d20Result.success ? '✓' : '✗'}`
                  ) : d20Result || '—'}
                </span>
              </div>
              <button 
                type="button" 
                className="trials-btn primary" 
                onClick={handleRollD20}
                disabled={isRollingD20}
                style={{ width: '100%', padding: '6px' }}
              >
                <Dices size={16} /> {isRollingD20 ? t('trials.curtain.rolling') : t('trials.curtain.rollD20')}
              </button>
            </div>
          </div>
        </div>

        <div className="curtain-footer">
          <button 
            type="button" 
            className="trials-btn primary hand-off-btn"
            onClick={() => {
              setIsCurtainOpen(false);
              startSession();
            }}
          >
            {t('trials.curtain.handOffBtn')}
          </button>
        </div>
      </div>

      {/* ================= СЕССИОННЫЙ HUD ================= */}
      <div className="trials-hud">
        <div className="hud-target-info">
          <span className="hud-label">{t('trials.hud.target')}</span>
          <span className="hud-value" title={challengeDesc}>{challengeName}</span>
        </div>

        {currentGame !== 'alchemy' ? (
          <div className="hud-dnd-badges">
            <span className="hud-badge dc-badge">DC {dc}</span>
            <span className="hud-badge bonus-badge">{t('trials.hud.modifier', { mod: bonus >= 0 ? `+${bonus}` : bonus })}</span>
          </div>
        ) : (
          <div className="hud-dnd-badges">
            <span className="hud-badge dc-badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
              {t('trials.hud.alchemyBadge')}
            </span>
          </div>
        )}

        {currentGame === 'lockpick' && (
          <div className="hud-picks-box">
            <span className="hud-label">{t('trials.hud.picks')}</span>
            <span className="picks-badge">🗝️ {currentPicks} / {maxPicks}</span>
            <div className="durability-track" title={t('trials.hud.durabilityTitle')}>
              <div 
                className={`durability-fill ${pickDurability < 30 ? 'critical' : pickDurability < 60 ? 'warning' : ''}`}
                style={{ width: `${pickDurability}%` }}
              />
            </div>
          </div>
        )}

        {currentGame === 'trap' && (
          <div className="hud-striker-box">
            <span className="hud-label">{t('trials.hud.striker')}</span>
            <div className="striker-indicators" title={t('trials.hud.strikerTitle')}>
              <span className={`striker-pip ${strikerStage >= 1 ? 'active warning' : ''}`}>1</span>
              <span className={`striker-pip ${strikerStage >= 2 ? 'active alert' : ''}`}>2</span>
              <span className={`striker-pip ${strikerStage >= 3 ? 'active danger' : ''}`}>3 💥</span>
            </div>
          </div>
        )}

        {stealthNoise && (
          <div className="hud-noise-box">
            <div className="noise-header">
              <span className="hud-label">{t('trials.hud.noise')}</span>
              <span className={`noise-val ${noiseLevel > 70 ? 'danger' : noiseLevel > 35 ? 'warning' : 'safe'}`}>
                {noiseLevel < 35 ? t('trials.hud.quiet') : noiseLevel < 70 ? t('trials.hud.suspicious') : t('trials.hud.alert')}
              </span>
            </div>
            <div className="noise-track">
              <div className="noise-fill" style={{ width: `${noiseLevel}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ================= ИГРОВАЯ АРЕНА ================= */}
      <div className="trials-arena-wrapper">
        <div ref={arenaRef} className="trials-canvas-stage" />
      </div>

      {/* ================= МОДАЛКА ИТОГОВ ================= */}
      {outcome && (
        <div className="trials-modal-backdrop">
          <div className="trials-modal-card result-card">
            <div className="result-crest">{outcome.crest}</div>
            <h2 className="result-title">{outcome.title}</h2>
            <p className="result-subtitle">{outcome.subtitle}</p>

            <div className="result-details-grid">
              {outcome.toolsLabel && outcome.toolsStatus && (
                <div className="detail-item">
                  <span className="detail-label">{outcome.toolsLabel}</span>
                  <span className="detail-val">{outcome.toolsStatus}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-label">{t('trials.result.timeElapsed')}</span>
                <span className="detail-val">{outcome.timeFormatted}</span>
              </div>
            </div>

            <div className="modal-actions-row">
              <button 
                type="button" 
                className="trials-btn primary"
                onClick={() => {
                  setOutcome(null);
                  resetGame();
                  startSession();
                }}
              >
                <RotateCcw size={16} /> {t('trials.result.retry')}
              </button>
              <button 
                type="button" 
                className="trials-btn secondary"
                onClick={() => setOutcome(null)}
              >
                {t('trials.result.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= МОДАЛКА СПРАВКИ ================= */}
      {isHelpOpen && (
        <div className="trials-modal-backdrop" onClick={() => setIsHelpOpen(false)}>
          <div className="trials-modal-card help-card" onClick={(e) => e.stopPropagation()}>
            <div className="help-header">
              <h3>{t('trials.help.title', { game: t(`trials.games.${currentGame}`) || GAME_MODULES[currentGame]?.name })}</h3>
              <button 
                type="button" 
                className="help-close-btn"
                onClick={() => setIsHelpOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="help-content">
              {currentGame === 'lockpick' && (
                isEn ? (
                  <>
                    <p><strong>Goal:</strong> Turn the lock cylinder all the way (90°) by finding the lock's sweet spot angle.</p>
                    <p><strong>Controls:</strong> Move mouse/finger across the canvas to aim the lockpick. Press and hold <code>SPACE / LMB</code> to turn the cylinder.</p>
                    <p><strong>Tip:</strong> Higher character bonus widens the sweet spot and increases pick durability. Release tension when pick shivers to avoid breaking it!</p>
                  </>
                ) : (
                  <>
                    <p><strong>Цель:</strong> Повернуть цилиндр замка до упора (90°), найдя скрытый угол отмычки.</p>
                    <p><strong>Управление:</strong> Двигайте мышь/палец по холсту для наклона отмычки. Нажмите и удерживайте <code>ПРОБЕЛ / ЛКМ</code> для поворота цилиндра.</p>
                    <p><strong>Подсказка:</strong> Чем выше бонус персонажа, тем шире «зеленая зона» и тем выше прочность отмычек. При сильном сопротивлении отпустите натяжитель, чтобы не сломать отмычку!</p>
                  </>
                )
              )}
              {currentGame === 'trap' && (
                isEn ? (
                  <>
                    <p><strong>Goal:</strong> Disarm one of 4 authentic D&D traps (chosen by the DM) before the striker's 3rd click.</p>
                    <p><strong>4 Trap Mechanisms:</strong></p>
                    <ul style={{ margin: '4px 0 8px 16px', padding: 0, fontSize: '12px', lineHeight: '1.5' }}>
                      <li>🏹 <strong>Tripwire Crossbow:</strong> Align the pin into the sear slot (press <code>SPACE / Click</code> when lined up), then cut the wire with pliers strictly inside the green zone. Slips or hesitation advance the striker!</li>
                      <li>⚙️ <strong>Clockwork Gearwork:</strong> Drive the locking wedge with <code>SPACE</code> or click directly into the gear teeth notches. Caution: after the first wedge, the gear accelerates by +45%!</li>
                      <li>⚖️ <strong>Counterweight Plate:</strong> Pour sand in short bursts (<code>SPACE / LMB</code>), balancing the plate within the narrow green corridor taking indicator inertia into account.</li>
                      <li>🧪 <strong>Poison Gas Dispenser:</strong> Press <code>SPACE</code> to vent steam and lower pressure into the green zone; while in the GREEN sector, hold <code>LMB</code> to inject the neutralizing serum.</li>
                    </ul>
                    <p><strong>Striker Meter:</strong> Critical slips advance the striker by 1 notch. On the 3rd click the trap detonates instantly!</p>
                  </>
                ) : (
                  <>
                    <p><strong>Цель:</strong> Обезвредить один из 4 аутентичных механизмов D&D (выбирается Мастером) до 3-го щелчка бойка.</p>
                    <p><strong>4 типа ловушек:</strong></p>
                    <ul style={{ margin: '4px 0 8px 16px', padding: 0, fontSize: '12px', lineHeight: '1.5' }}>
                      <li>🏹 <strong>Арбалетная растяжка:</strong> Направьте штифт в паз шептала (при совпадении нажмите <code>ПРОБЕЛ / Клик</code>), затем перекусите нить кусачками строго в зелёной зоне. Долгое ожидание или промах сдвигают боёк!</li>
                      <li>⚙️ <strong>Зубчатый часовой механизм:</strong> Вбивайте стопорный клин клавишей <code>ПРОБЕЛ</code> или кликом точно в пазы колеса. Осторожно: после первого клина колесо разгоняется на +45%!</li>
                      <li>⚖️ <strong>Плита-противовес:</strong> Подсыпайте песок короткими порциями (<code>ПРОБЕЛ / ЛКМ</code>), балансируя плиту с учётом инерции стрелки в узком зелёном коридоре.</li>
                      <li>🧪 <strong>Ядовитый распылитель:</strong> Нажимайте <code>ПРОБЕЛ</code> для стравливания пара (сбивает давление в зелёную зону), а пока манометр в ЗЕЛЁНОМ секторе — зажимайте <code>ЛКМ</code> для нейтрализации.</li>
                    </ul>
                    <p><strong>Шкала бойка:</strong> При критических ошибках боёк сдвигается на 1 зуб. После 3-го щелчка ловушка немедленно срабатывает!</p>
                  </>
                )
              )}
              {currentGame === 'runes' && (
                isEn ? (
                  <>
                    <p><strong>Goal:</strong> Rotate concentric rings of the arcane ward to channel mana beams from the core to all elemental altars.</p>
                    <p><strong>Controls:</strong> Select ring with keys <code>1, 2, 3</code> or UI buttons. Rotate with <code>A / D</code>, <code>← / →</code>, <code>↺</code> / <code>↻</code> buttons, or drag rings directly with mouse.</p>
                  </>
                ) : (
                  <>
                    <p><strong>Цель:</strong> Вращать концентрические кольца арканной печати, чтобы соединить световой поток маны от центрального ядра ко всем стихийным якорям.</p>
                    <p><strong>Управление:</strong> Выбирайте кольцо клавишами <code>1, 2, 3</code> или кнопками интерфейса. Вращайте клавишами <code>A / D</code>, <code>← / →</code> или кнопками <code>↺</code> / <code>↻</code>, либо перетаскивайте кольцо мышью.</p>
                  </>
                )
              )}
              {currentGame === 'pickpocket' && (
                isEn ? (
                  <>
                    <p><strong>Goal:</strong> Pull loot out of the pocket to 100% while the target is distracted.</p>
                    <p><strong>Controls:</strong> Hold <code>SPACE</code> or the <code>Pull Loot</code> button while status is green (🍺 <code>Distracted</code>). As soon as status shifts to 👂 or 👁️ — IMMEDIATELY release and freeze!</p>
                  </>
                ) : (
                  <>
                    <p><strong>Цель:</strong> Вытянуть добычу из кошелька на 100%, пока жертва отвлечена.</p>
                    <p><strong>Управление:</strong> Зажимайте <code>ПРОБЕЛ</code> или кнопку <code>Тянуть добычу</code>, пока статус зеленый (🍺 <code>Отвлечён</code>). Как только статус меняется на 👂 или 👁️ — СРОЧНО отпустите и замрите!</p>
                  </>
                )
              )}
              {currentGame === 'alchemy' && (
                isEn ? (
                  <>
                    <p><strong>Goal:</strong> Brew a canonical D&D 5e potion following the ancient alchemical treatise.</p>
                    <p><strong>3 Alchemist Actions:</strong></p>
                    <ul style={{ margin: '4px 0 8px 16px', padding: 0, fontSize: '12px', lineHeight: '1.5' }}>
                      <li>💨 <strong>Bellows (SPACE):</strong> Pump heat into the crucible (Simmer, Boil, or Raging Heat). Release to let it naturally cool down.</li>
                      <li>🌿 <strong>Reagent Shelf:</strong> Drop the required ingredient while the crucible is strictly in the target temperature range.</li>
                      <li>🥄 <strong>Stirring (A / D or ← / →):</strong> Stir clockwise ↻ or counter-clockwise ↺ as instructed in the scroll.</li>
                    </ul>
                    <p><strong>Potion Difficulty:</strong> Stronger and rarer potions (from Common to Very Rare and Legendary) involve more steps and much narrower margin of error!</p>
                  </>
                ) : (
                  <>
                    <p><strong>Цель:</strong> Приготовить каноническое зелье D&D 5e по старинному алхимическому трактату.</p>
                    <p><strong>3 действия алхимика:</strong></p>
                    <ul style={{ margin: '4px 0 8px 16px', padding: 0, fontSize: '12px', lineHeight: '1.5' }}>
                      <li>💨 <strong>Меха (ПРОБЕЛ):</strong> Нагнетайте жар тигля (Томление, Кипение или Жар). Отпустите для естественного остывания.</li>
                      <li>🌿 <strong>Полка реагентов:</strong> Бросайте нужный ингредиент, пока тигель в целевом температурном диапазоне.</li>
                      <li>🥄 <strong>Помешивание (A / D или ← / →):</strong> Размешивайте по часовой ↻ или против часовой ↺ стрелки по указанию в свитке.</li>
                    </ul>
                    <p><strong>Сложность зелья:</strong> Чем сильнее и выше редкость зелья (от Обычного до Очень редкого), тем больше этапов и тем строже допуски на ошибки!</p>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
