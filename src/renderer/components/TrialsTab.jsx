import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Copy,
  Check,
  Dices,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const GAME_MODULES = {
  lockpick: { id: 'lockpick', name: 'Взлом замка', icon: KeyRound, Class: LockpickGame },
  trap: { id: 'trap', name: 'Обезвреживание ловушки', icon: Bomb, Class: TrapGame },
  runes: { id: 'runes', name: 'Магические руны', icon: Sparkles, Class: RunesGame },
  pickpocket: { id: 'pickpocket', name: 'Карманная кража', icon: Coins, Class: PickpocketGame },
  alchemy: { id: 'alchemy', name: 'Зельеварение', icon: FlaskConical, Class: AlchemyGame }
};

export default function TrialsTab() {
  const [currentGame, setCurrentGame] = useState('lockpick');
  const [isCurtainOpen, setIsCurtainOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(audio.isMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Параметры D&D
  const [dc, setDc] = useState(dnd.dc);
  const [bonus, setBonus] = useState(dnd.bonus);
  const [tier, setTier] = useState(2);
  const [mode, setMode] = useState('realtime');
  const [timeLimit, setTimeLimit] = useState(35);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [stealthNoise, setStealthNoise] = useState(false);
  const [lockTheme, setLockTheme] = useState('auto');
  const [maxPicks, setMaxPicks] = useState(5);
  const [currentPicks, setCurrentPicks] = useState(5);
  const [pickDurability, setPickDurability] = useState(100);

  // Сюжетный объект
  const [challengeName, setChallengeName] = useState('Тяжёлый кованый сундук бандитов');
  const [challengeDesc, setChallengeDesc] = useState('Грубый навесной замок со следами ржавчины и царапин от ножа.');

  // Состояние активного раунда
  const [timeLeft, setTimeLeft] = useState(35);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Кубик d20 для Мастера
  const [d20Result, setD20Result] = useState(null);
  const [isRollingD20, setIsRollingD20] = useState(false);

  // Модальные окна
  const [outcome, setOutcome] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Ссылки
  const arenaRef = useRef(null);
  const activeGameInstanceRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const timeSpentRef = useRef(0);
  const stateRef = useRef({
    mistakesCount: 0,
    noiseLevel: 0,
    currentPicks: 5,
    maxPicks: 5,
    timeSpent: 0,
    timeLimit: 35,
    lockTheme: 'auto',
    stealthNoise: false,
    challengeName: 'Тяжёлый кованый сундук бандитов'
  });

  stateRef.current.mistakesCount = mistakesCount;
  stateRef.current.noiseLevel = noiseLevel;
  stateRef.current.currentPicks = currentPicks;
  stateRef.current.maxPicks = maxPicks;
  stateRef.current.timeLimit = timeLimit;
  stateRef.current.lockTheme = lockTheme;
  stateRef.current.stealthNoise = stealthNoise;
  stateRef.current.challengeName = challengeName;

  // Остановка таймера
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsTimerRunning(false);
  }, []);

  // Генерация испытания
  const generateNewChallenge = useCallback((gameId = currentGame, currentTier = tier) => {
    const ch = dnd.generateRandomChallenge(gameId);
    setChallengeName(ch.name);
    setChallengeDesc(ch.desc);
    setDc(dnd.dc);
    setTimeLimit(dnd.timeLimit);
    setTimeLeft(dnd.timeLimit);
    setMaxAttempts(dnd.maxAttempts);
  }, [currentGame, tier]);

  // Завершение испытания
  const finishGame = useCallback((success, extraData = {}) => {
    stopTimer();
    if (success) {
      audio.playSuccess();
    } else {
      audio.playFailure();
    }

    const res = dnd.evaluateOutcome({
      success,
      timeSpent: timeSpentRef.current,
      mistakes: stateRef.current.mistakesCount,
      noiseLevel: stateRef.current.noiseLevel,
      gameType: currentGame
    });

    setOutcome(res);
  }, [currentGame, stopTimer]);

  // Контроллер для мини-игр
  const appController = useRef({
    finishGame: (success, extra) => finishGame(success, extra),
    recordMistake: () => {
      setMistakesCount(prev => {
        const next = prev + 1;
        stateRef.current.mistakesCount = next;
        if (dnd.mode === 'turnbased' && next >= dnd.maxAttempts) {
          finishGame(false, { reason: 'attempts_exhausted' });
        }
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
      let remaining = 0;
      setCurrentPicks(prev => {
        remaining = Math.max(0, prev - 1);
        stateRef.current.currentPicks = remaining;
        return remaining;
      });
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

  // Запуск сессии с таймером
  const startSession = useCallback(() => {
    stopTimer();
    setTimeLeft(dnd.timeLimit);
    timeSpentRef.current = 0;
    setMistakesCount(0);
    setNoiseLevel(0);
    setCurrentPicks(maxPicks);
    setPickDurability(100);

    if (dnd.mode === 'realtime') {
      setIsTimerRunning(true);
      timerIntervalRef.current = setInterval(() => {
        timeSpentRef.current += 0.5;
        setTimeLeft(prev => {
          const next = prev - 0.5;
          if (Math.floor(timeSpentRef.current * 2) % 2 === 0) {
            audio.playTick(next <= 10);
          }
          if (next <= 0) {
            stopTimer();
            finishGame(false, { reason: 'time_up' });
            return 0;
          }
          return next;
        });
      }, 500);
    }

    if (activeGameInstanceRef.current && typeof activeGameInstanceRef.current.start === 'function') {
      activeGameInstanceRef.current.start();
    }
  }, [finishGame, maxPicks, stopTimer]);

  // Сброс игры
  const resetGame = useCallback(() => {
    stopTimer();
    setTimeLeft(dnd.timeLimit);
    timeSpentRef.current = 0;
    setMistakesCount(0);
    setNoiseLevel(0);
    setCurrentPicks(maxPicks);
    setPickDurability(100);
    setOutcome(null);

    if (activeGameInstanceRef.current && typeof activeGameInstanceRef.current.reset === 'function') {
      activeGameInstanceRef.current.reset();
    }
  }, [maxPicks, stopTimer]);

  // Инициализация / смена мини-игры
  useEffect(() => {
    stopTimer();
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
      stopTimer();
      if (activeGameInstanceRef.current && typeof activeGameInstanceRef.current.destroy === 'function') {
        try {
          activeGameInstanceRef.current.destroy();
        } catch (e) {
          console.warn('Destroy error:', e);
        }
        activeGameInstanceRef.current = null;
      }
    };
  }, [currentGame, generateNewChallenge, stopTimer, tier]);

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

  // Копирование в буфер
  const copyVerdict = () => {
    if (!outcome) return;
    const text = [
      `**⚔️ D&D Испытание: ${challengeName}**`,
      `🎯 DC ${dc} | Модификатор: ${bonus >= 0 ? '+' : ''}${bonus}`,
      `📊 Исход: ${outcome.crest} ${outcome.title} — ${outcome.subtitle}`,
      `⏳ Время: ${outcome.timeFormatted} | ${outcome.toolsLabel} ${outcome.toolsStatus}`,
      `📜 **Вердикт Мастера:**`,
      `> ${outcome.narrative}`
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
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
      {/* ================= ШТОРКА МАСТЕРА ================= */}
      <div className={`trials-curtain ${isCurtainOpen ? 'open' : ''}`}>
        <div className="trials-curtain-grid">
          {/* Колонка 1: Сложность и статы */}
          <div className="curtain-box">
            <h4 className="curtain-box-title">🎯 Сложность и Модификаторы</h4>
            
            <div className="curtain-row">
              <label>Сложность (DC): <strong>{dc}</strong></label>
              <input 
                type="range" 
                min="8" 
                max="28" 
                value={dc} 
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setDc(val);
                  dnd.setDC(val);
                }} 
              />
            </div>

            <div className="curtain-row">
              <label>Бонус персонажа: <strong>{bonus >= 0 ? `+${bonus}` : bonus}</strong></label>
              <input 
                type="range" 
                min="-2" 
                max="12" 
                value={bonus} 
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setBonus(val);
                  dnd.setBonus(val);
                }} 
              />
            </div>

            {currentGame === 'lockpick' && (
              <div className="curtain-row">
                <label>Стиль замка:</label>
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
                  <option value="auto">🎲 Авто (по сюжету)</option>
                  <option value="iron">⛓️ Кованое железо</option>
                  <option value="dwarven">⚙️ Гномья механика</option>
                  <option value="arcane">✨ Тайная магия</option>
                </select>
              </div>
            )}
          </div>

          {/* Колонка 2: Темп и режим */}
          <div className="curtain-box">
            <h4 className="curtain-box-title">⏳ Темп и Режим</h4>

            <div className="curtain-segmented">
              <button 
                type="button" 
                className={`segmented-btn ${mode === 'realtime' ? 'active' : ''}`}
                onClick={() => { setMode('realtime'); dnd.setMode('realtime'); }}
              >
                ⏱️ Таймер
              </button>
              <button 
                type="button" 
                className={`segmented-btn ${mode === 'turnbased' ? 'active' : ''}`}
                onClick={() => { setMode('turnbased'); dnd.setMode('turnbased'); }}
              >
                🛡️ Пошаговый
              </button>
            </div>

            {mode === 'realtime' ? (
              <div className="curtain-row">
                <label>Лимит времени: <strong>{timeLimit} сек</strong></label>
                <input 
                  type="range" 
                  min="15" 
                  max="90" 
                  step="5"
                  value={timeLimit} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setTimeLimit(val);
                    dnd.setTimeLimit(val);
                    setTimeLeft(val);
                  }} 
                />
              </div>
            ) : (
              <div className="curtain-row">
                <label>Лимит ошибок: <strong>{maxAttempts} шт</strong></label>
                <input 
                  type="range" 
                  min="1" 
                  max="6" 
                  value={maxAttempts} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setMaxAttempts(val);
                    dnd.setAttempts(val);
                  }} 
                />
              </div>
            )}

            {currentGame === 'lockpick' && (
              <div className="curtain-row">
                <label>Запас отмычек: <strong>{maxPicks} шт</strong></label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={maxPicks} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setMaxPicks(val);
                    setCurrentPicks(val);
                  }} 
                />
              </div>
            )}

            <div className="curtain-toggle-row">
              <label>Шкала шума стражи (стелс):</label>
              <input 
                type="checkbox" 
                checked={stealthNoise} 
                onChange={(e) => setStealthNoise(e.target.checked)} 
              />
            </div>
          </div>

          {/* Колонка 3: Генератор испытаний и кубик */}
          <div className="curtain-box">
            <h4 className="curtain-box-title">🎲 Генератор и Кубик d20</h4>

            <div className="curtain-row">
              <label>Уровень партии (Тир):</label>
              <select 
                className="curtain-select"
                value={tier}
                onChange={(e) => {
                  const t = parseInt(e.target.value, 10);
                  setTier(t);
                  dnd.setTier(t);
                  generateNewChallenge(currentGame, t);
                }}
              >
                <option value="1">Тир 1 (1–4 ур. Приключенцы)</option>
                <option value="2">Тир 2 (5–10 ур. Герои королевства)</option>
                <option value="3">Тир 3 (11–16 ур. Защитники мира)</option>
                <option value="4">Тир 4 (17–20 ур. Легенды)</option>
              </select>
            </div>

            <button 
              type="button" 
              className="trials-btn secondary" 
              onClick={() => generateNewChallenge(currentGame, tier)}
              style={{ width: '100%', marginBottom: '10px' }}
            >
              🎲 Новое случайное испытание
            </button>

            <div className="d20-roller-box">
              <div className="d20-display">
                <span>Бросок d20:</span>
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
                <Dices size={16} /> Бросить d20
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
            📜 Передать экран игроку (Закрыть шторку и Начать)
          </button>
        </div>
      </div>

      {/* ================= ВЕРХНЯЯ ПОЛОСА МИНИ-ИГР ================= */}
      <div className="trials-nav-bar">
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
                <span>{g.name}</span>
              </button>
            );
          })}
        </div>

        <div className="trials-actions-group">
          <button 
            type="button" 
            className={`trials-action-btn curtain-toggle ${isCurtainOpen ? 'active' : ''}`}
            onClick={() => setIsCurtainOpen(!isCurtainOpen)}
            title="Панель Мастера: DC, таймер, генератор"
          >
            <ShieldAlert size={16} />
            <span>Панель Мастера</span>
            {isCurtainOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button 
            type="button" 
            className="trials-icon-btn" 
            onClick={() => {
              const muted = audio.toggleMute();
              setIsMuted(muted);
            }}
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          <button 
            type="button" 
            className="trials-icon-btn" 
            onClick={toggleFullscreen}
            title="Полноэкранный режим"
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>

          <button 
            type="button" 
            className="trials-icon-btn" 
            onClick={() => setIsHelpOpen(true)}
            title="Справка и правила"
          >
            <HelpCircle size={17} />
          </button>

          <button 
            type="button" 
            className="trials-icon-btn" 
            onClick={resetGame}
            title="Перезапустить испытание"
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </div>

      {/* ================= СЕССИОННЫЙ HUD ================= */}
      <div className="trials-hud">
        <div className="hud-target-info">
          <span className="hud-label">Цель:</span>
          <span className="hud-value" title={challengeDesc}>{challengeName}</span>
        </div>

        <div className="hud-dnd-badges">
          <span className="hud-badge dc-badge">DC {dc}</span>
          <span className="hud-badge bonus-badge">Модификатор: {bonus >= 0 ? `+${bonus}` : bonus}</span>
        </div>

        {currentGame === 'lockpick' && (
          <div className="hud-picks-box">
            <span className="hud-label">Отмычки:</span>
            <span className="picks-badge">🗝️ {currentPicks} / {maxPicks}</span>
            <div className="durability-track" title="Прочность текущей отмычки">
              <div 
                className={`durability-fill ${pickDurability < 30 ? 'critical' : pickDurability < 60 ? 'warning' : ''}`}
                style={{ width: `${pickDurability}%` }}
              />
            </div>
          </div>
        )}

        <div className="hud-tension-box">
          {mode === 'realtime' ? (
            <div className={`timer-box ${timeLeft <= 10 ? 'danger' : ''}`}>
              <span className="timer-icon">⏳</span>
              <span className="timer-digits">
                {String(Math.floor(Math.ceil(timeLeft) / 60)).padStart(2, '0')}:
                {String(Math.ceil(timeLeft) % 60).padStart(2, '0')}
              </span>
            </div>
          ) : (
            <div className="attempts-box">
              <span className="hud-label">Запас:</span>
              <span className="attempts-hearts">
                {Array.from({ length: maxAttempts }).map((_, i) => (
                  i < (maxAttempts - mistakesCount) ? '❤️' : '🖤'
                ))}
              </span>
            </div>
          )}
        </div>

        {stealthNoise && (
          <div className="hud-noise-box">
            <div className="noise-header">
              <span className="hud-label">Уровень шума:</span>
              <span className={`noise-val ${noiseLevel > 70 ? 'danger' : noiseLevel > 35 ? 'warning' : 'safe'}`}>
                {noiseLevel < 35 ? 'Тихо' : noiseLevel < 70 ? 'Подозрительно' : 'ТРЕВОГА!'}
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
              <div className="detail-item">
                <span className="detail-label">Уровень шума:</span>
                <span className="detail-val">{outcome.noiseStatus}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{outcome.toolsLabel}</span>
                <span className="detail-val">{outcome.toolsStatus}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Затраченное время:</span>
                <span className="detail-val">{outcome.timeFormatted}</span>
              </div>
              <div className="detail-item narrative-item">
                <span className="detail-label">Вердикт для Мастера:</span>
                <p className="detail-narrative">{outcome.narrative}</p>
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
                <RotateCcw size={16} /> Повторить
              </button>
              <button 
                type="button" 
                className="trials-btn secondary"
                onClick={copyVerdict}
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                <span>{isCopied ? 'Скопировано!' : 'Скопировать в чат'}</span>
              </button>
              <button 
                type="button" 
                className="trials-btn secondary"
                onClick={() => setOutcome(null)}
              >
                Закрыть
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
              <h3>📜 Справка испытания: {GAME_MODULES[currentGame]?.name}</h3>
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
                <>
                  <p><strong>Цель:</strong> Повернуть цилиндр замка до упора (90°), найдя скрытый угол отмычки.</p>
                  <p><strong>Управление:</strong> Двигайте мышь/палец по холсту для наклона отмычки. Нажмите и удерживайте <code>ПРОБЕЛ / ЛКМ</code> для поворота цилиндра.</p>
                  <p><strong>Подсказка:</strong> Чем выше бонус персонажа, тем шире «зеленая зона» и тем выше прочность отмычек. При сильном сопротивлении отпустите натяжитель, чтобы не сломать отмычку!</p>
                </>
              )}
              {currentGame === 'trap' && (
                <>
                  <p><strong>Цель:</strong> Обесточить детонатор, перекусив нужные провода по правилам рунического свитка слева.</p>
                  <p><strong>Управление:</strong> Кликайте по проводам для надреза. Для опасных проводов (руна Смерти 💀) зажимайте кнопку стравливания давления!</p>
                  <p><strong>Подсказка:</strong> Ошибка перекусывания вызывает детонацию капсюля, повышает уровень шума и отнимает сердечко попытки.</p>
                </>
              )}
              {currentGame === 'runes' && (
                <>
                  <p><strong>Цель:</strong> Вращать концентрические кольца арканной печати, чтобы соединить световой поток маны от центрального ядра ко всем стихийным якорям.</p>
                  <p><strong>Управление:</strong> Вращайте кольца мышью/пальцем или используйте кнопки <code>↺</code> и <code>↻</code>.</p>
                </>
              )}
              {currentGame === 'pickpocket' && (
                <>
                  <p><strong>Цель:</strong> Вытянуть добычу из кошелька на 100%, пока жертва отвлечена.</p>
                  <p><strong>Управление:</strong> Зажимайте <code>ЛКМ / кнопку «Тянуть добычу»</code>, пока статус зеленый (<code>Отвлечён</code>). Как только статус желтеет или краснеет — СРОЧНО отпустите и замрите!</p>
                </>
              )}
              {currentGame === 'alchemy' && (
                <>
                  <p><strong>Цель:</strong> Сварить зелье по рецепту, соблюдая точный температурный диапазон для каждого реагента.</p>
                  <p><strong>Управление:</strong> Зажимайте <code>ПРОБЕЛ</code> или кнопку <code>Раздувать меха</code> для нагрева. Кликайте по ингредиенту на полке, когда столбик в зеленой зоне.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
