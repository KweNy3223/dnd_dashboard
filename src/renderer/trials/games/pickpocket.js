/**
 * Модуль мини-игры: Карманная кража (Pickpocketing)
 * Глубокая D&D 5e стелс-механика: Sleight of Hand против Passive Perception (DC).
 * 
 * Особенности:
 * 1. Честная сложность: с ростом DC сопротивление вытягиванию резко растёт (меньше прогресса за рывок,
 *    сильнее трение, короче безопасные окна и быстрее натягивается пояс).
 * 2. Разнообразие добычи (Кошель с золотом, Связка ключей, Секретный свиток, Драгоценный амулет)
 *    с уникальными звуками и визуалом.
 * 3. Живая анимация силуэта жертвы: плечи напрягаются, голова физически поворачивается при настороженности
 *    и оборачивается прямо к карману при тревоге.
 * 4. Чистый процедурный объёмный звук (шелест ткани, ключи, пергамент, монеты, стук сердца).
 */

import { audio } from '../audio.js';
import { dnd } from '../dnd-engine.js';

export const LOOT_TYPES = {
  pouch: {
    id: 'pouch',
    name: '💰 Тяжёлый кошель с золотом',
    weight: 1.05,
    soundType: 'coins'
  },
  keys: {
    id: 'keys',
    name: '🗝️ Связка ключей от темницы',
    weight: 0.90,
    soundType: 'keys'
  },
  scroll: {
    id: 'scroll',
    name: '📜 Секретное письмо / свиток',
    weight: 0.78,
    soundType: 'parchment'
  },
  amulet: {
    id: 'amulet',
    name: '💎 Драгоценный амулет на цепочке',
    weight: 0.95,
    soundType: 'amulet'
  }
};

export class PickpocketGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;

    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;

    // Состояния внимания жертвы:
    // 'DISTRACTED' -> 'SUSPICIOUS' (микро-предупреждение) -> 'ALERT' (смотрит на пояс)
    this.targetState = 'DISTRACTED';
    this.stateTimer = 0;
    this.stateDuration = 2.0;

    // Шкала подозрения (0..100%)
    this.suspicion = 0;

    // Шкала извлечения добычи (0..100%)
    this.progress = 0;

    // Шкала натяжения шнура/пояса (0..100%) при непрерывном вытягивании
    this.beltTension = 0;
    this.pullDuration = 0;

    // Статусы сессии
    this.isExtracting = false;
    this.isCaught = false;
    this.isStolen = false;

    // Таймеры фаз
    this.telegraphTimer = 0;
    this.alertLookTimer = 0;
    this.rustleSoundCooldown = 0;
    this.heartbeatTimer = 0;

    // Параметры D&D (динамически рассчитываются от DC и Бонуса)
    this.extractionSpeed = 16;
    this.maxSafeTug = 0.50;
    this.tensionBuildRate = 160;
    this.distractedMin = 1.4;
    this.distractedMax = 2.4;
    this.telegraphDuration = 0.6;
    this.alertDuration = 1.1;
    this.suspicionMult = 1.0;

    // Тип добычи ('pouch' | 'keys' | 'scroll' | 'amulet')
    this.lootType = 'pouch';

    // Анимационные параметры силуэта жертвы
    this.currentHeadAngle = -8; // в градусах
    this.targetHeadAngle = -8;
    this.currentTorsoTurn = 0;
    this.targetTorsoTurn = 0;
    this.breathCycle = 0;

    // Частицы блеска
    this.particles = [];

    // Привязанные события
    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
    this.boundResize = this.setupCanvas.bind(this);
  }

  setLootType(type) {
    if (type === 'auto') {
      this.lootType = this.app?.getLootType ? this.app.getLootType() : 'pouch';
    } else if (LOOT_TYPES[type]) {
      this.lootType = type;
    }
    this.calculateDndParams();
    this.updateHUD();
  }

  init() {
    this.renderDOM();
    this.setupCanvas();
    this.bindEvents();
    if (this.app?.getLootType) {
      this.lootType = this.app.getLootType();
    }
    this.calculateDndParams();
    this.reset();
    this.startAnimationLoop();
  }

  renderDOM() {
    this.container.innerHTML = `
      <div class="stage-container pickpocket-stage">
        <div class="stage-header">
          <h2 class="stage-title">🪙 Карманная кража</h2>
          <p class="stage-subtitle" id="pickpocketSubtitle">Тяните добычу аккуратными рывками. При повышении DC вытягивать сложнее!</p>
        </div>

        <div class="pickpocket-layout">
          <!-- Карточка внимания жертвы -->
          <div class="npc-awareness-card" id="npcAwarenessBox">
            <div class="awareness-header">
              <span class="awareness-icon" id="awarenessIcon">🍺</span>
              <div class="awareness-info">
                <span class="awareness-label">Внимание цели (Passive Perception DC <strong id="hudDcVal">${dnd.dc}</strong> | <span id="hudLootName">Кошель</span>):</span>
                <span class="awareness-status" id="awarenessStatus">Отвлечён (Смотрит в зал)</span>
              </div>
            </div>
            
            <div class="suspicion-bar-wrap">
              <div class="suspicion-label-row">
                <span>Уровень подозрения жертвы:</span>
                <span id="suspicionVal" style="font-weight: 700;">0%</span>
              </div>
              <div class="suspicion-track">
                <div class="suspicion-fill" id="suspicionFill" style="width: 0%;"></div>
              </div>
            </div>

            <!-- Шкала натяжения шнура / ритма рывка -->
            <div class="suspicion-bar-wrap" style="margin-top: 4px;">
              <div class="suspicion-label-row">
                <span>Натяжение пояса (Ритм рывка):</span>
                <span id="tensionVal" style="font-weight: 600; color: #60a5fa;">0%</span>
              </div>
              <div class="tension-track" style="width: 100%; height: 5px; background: rgba(255, 255, 255, 0.08); border-radius: 3px; overflow: hidden;">
                <div class="tension-fill" id="tensionFill" style="width: 0%; height: 100%; background: #3b82f6; transition: width 0.04s linear, background 0.15s;"></div>
              </div>
            </div>
          </div>

          <!-- Холст сцены кошеля и извлечения -->
          <div class="pickpocket-canvas-wrapper">
            <canvas id="pickpocketCanvas" class="game-canvas"></canvas>
            
            <div class="extraction-progress-overlay">
              <div class="progress-label-row">
                <span>Добыча извлечена:</span>
                <span id="extractionPercent" style="font-weight: 700; color: var(--accent-gold);">0%</span>
              </div>
              <div class="extraction-track">
                <div class="extraction-fill" id="extractionFill" style="width: 0%;"></div>
              </div>
            </div>
          </div>

          <!-- Кнопка действия -->
          <div class="pickpocket-controls-row">
            <button type="button" class="btn fantasy-btn primary" id="btnTouchSteal" style="min-width: 260px; padding: 12px 28px; font-size: 1rem; font-weight: 700;">
              <span>🤏</span> Тянуть добычу (Зажать ПРОБЕЛ / ЛКМ)
            </button>
          </div>
        </div>

        <div class="lock-controls-guide" style="margin-top: 14px;">
          <div class="guide-pill">
            <span class="guide-key">Ритм рывка</span>
            <span>Тянуть на долю секунды и отпускать</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">Сопротивление</span>
            <span>При высоком DC предмет выходит медленнее</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">👂 / 👁️ Замри!</span>
            <span>Остановиться при повороте головы цели</span>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#pickpocketCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.npcAwarenessBox = this.container.querySelector('#npcAwarenessBox');
    this.awarenessIcon = this.container.querySelector('#awarenessIcon');
    this.awarenessStatus = this.container.querySelector('#awarenessStatus');
    this.suspicionVal = this.container.querySelector('#suspicionVal');
    this.suspicionFill = this.container.querySelector('#suspicionFill');
    this.tensionVal = this.container.querySelector('#tensionVal');
    this.tensionFill = this.container.querySelector('#tensionFill');
    this.extractionPercent = this.container.querySelector('#extractionPercent');
    this.extractionFill = this.container.querySelector('#extractionFill');
    this.btnTouchSteal = this.container.querySelector('#btnTouchSteal');
    this.hudDcVal = this.container.querySelector('#hudDcVal');
    this.hudLootName = this.container.querySelector('#hudLootName');
  }

  setupCanvas() {
    if (!this.canvas) return;
    const width = Math.min(480, Math.min(window.innerWidth - 48, 480));
    const height = 340;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.logicalWidth = width;
    this.logicalHeight = height;
  }

  bindEvents() {
    this.canvas.addEventListener('pointerdown', this.boundPointerDown);
    window.addEventListener('pointerup', this.boundPointerUp);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('resize', this.boundResize);

    const start = (e) => {
      e.preventDefault();
      this.startStealing();
    };
    const stop = (e) => {
      e.preventDefault();
      this.stopStealing();
    };

    if (this.btnTouchSteal) {
      this.btnTouchSteal.addEventListener('pointerdown', start);
      this.btnTouchSteal.addEventListener('pointerup', stop);
      this.btnTouchSteal.addEventListener('pointerleave', stop);
    }
  }

  // Расчет параметров D&D 5e (С ростом DC вытягивать заметно сложнее!)
  calculateDndParams(advantage = null) {
    const dc = dnd.dc;
    const bonus = dnd.bonus;
    const adv = advantage || dnd.getEffectiveAdvantage();
    const dcFactor = Math.max(0, dc - 8);

    // 1. СКОРОСТЬ ВЫТЯГИВАНИЯ (Сопротивление трения):
    // При DC 8: ~26%/сек (идёт гладко и легко)
    // При DC 14: ~18%/сек (умеренно тугой карман)
    // При DC 20: ~11.5%/сек (глубокий кошель, сильное сопротивление)
    // При DC 26+: ~6.5%/сек (сверх-тугой карман, требует много терпеливых рывков)
    const basePull = Math.max(5.0, 26 - (dcFactor * 1.15));
    const bonusPull = bonus * Math.max(0.6, 1.5 - (dcFactor * 0.035));
    const advMult = adv?.extraDurability ? 1.25 : adv?.toleranceFactor || 1.0;

    const lootDef = LOOT_TYPES[this.lootType] || LOOT_TYPES.pouch;
    this.extractionSpeed = Math.max(4.5, (basePull + bonusPull) / lootDef.weight) * advMult;

    // 2. БЕЗОПАСНЫЙ РЫВОК ДО НАТЯЖЕНИЯ (maxSafeTug):
    // При DC 8: до 0.70 сек безопасного удержания
    // При DC 15: ~0.48 сек
    // При DC 22+: ~0.32 сек (чуткий ремень, чуть передержал — сразу натяжение)
    this.maxSafeTug = Math.max(0.24, Math.min(0.85, 0.70 - (dcFactor * 0.024) + (bonus * 0.02)));

    // 3. СКОРОСТЬ РОСТА НАТЯЖЕНИЯ:
    // Чем выше DC, тем резче шнур врезается в пояс
    this.tensionBuildRate = 120 + (dcFactor * 9);

    // 4. ДЛИТЕЛЬНОСТЬ ОКНА ОТВЛЕЧЕНИЯ:
    // При DC 8: 2.5 – 3.8 сек
    // При DC 15: 1.5 – 2.4 сек
    // При DC 22+: 0.8 – 1.4 сек
    this.distractedMin = Math.max(0.65, 2.5 - (dcFactor * 0.09));
    this.distractedMax = Math.max(1.1, 3.8 - (dcFactor * 0.12));

    // 5. ОКНО ПРЕДУПРЕЖДЕНИЯ (Telegraph):
    this.telegraphDuration = Math.max(0.32, 0.80 - (dcFactor * 0.026));

    // 6. ВРЕМЯ ОСМОТРА ЦЕЛИ (Alert):
    this.alertDuration = Math.max(0.8, 1.1 + (dcFactor * 0.03));

    // 7. МНОЖИТЕЛЬ РОСТА ПОДОЗРЕНИЯ:
    this.suspicionMult = 1.0 + Math.max(0, (dc - 10) * 0.06);

    if (this.hudDcVal) this.hudDcVal.textContent = dc;
    if (this.hudLootName) {
      this.hudLootName.textContent = lootDef.name.replace(/^[^\s]+\s*/, '');
    }
  }

  onParametersChanged(advantage) {
    if (this.app?.getLootType) {
      this.lootType = this.app.getLootType();
    }
    this.calculateDndParams(advantage);
    this.reset();
  }

  startStealing() {
    if (this.isCaught || this.isStolen) return;
    this.isExtracting = true;
    if (this.btnTouchSteal) {
      this.btnTouchSteal.classList.add('active');
    }
    audio.ensureContext();
    this.playTugSound(0.04);
  }

  stopStealing() {
    this.isExtracting = false;
    this.pullDuration = 0;
    if (this.btnTouchSteal) {
      this.btnTouchSteal.classList.remove('active');
    }
  }

  playTugSound(volume = 0.045) {
    const lootDef = LOOT_TYPES[this.lootType] || LOOT_TYPES.pouch;
    if (lootDef.soundType === 'keys') {
      audio.playKeysClink(volume * 0.9);
    } else if (lootDef.soundType === 'parchment') {
      audio.playParchmentRustle(volume * 1.1);
    } else {
      audio.playClothRustle(volume);
    }
  }

  playOverTugSound() {
    const lootDef = LOOT_TYPES[this.lootType] || LOOT_TYPES.pouch;
    if (lootDef.soundType === 'keys') {
      audio.playKeysClink(0.09);
    } else if (lootDef.soundType === 'parchment') {
      audio.playParchmentRustle(0.09);
    } else {
      audio.playCoinJingle(0.08);
    }
  }

  onPointerDown(e) {
    if (e.button === 0) {
      this.startStealing();
    }
  }

  onPointerUp() {
    this.stopStealing();
  }

  onKeyDown(e) {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    if (e.code === 'Space') {
      if (!this.isExtracting) {
        this.startStealing();
      }
      e.preventDefault();
    }
  }

  onKeyUp(e) {
    if (e.code === 'Space') {
      this.stopStealing();
      e.preventDefault();
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
    }
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('resize', this.boundResize);
  }

  reset() {
    this.targetState = 'DISTRACTED';
    this.stateTimer = 0;
    this.stateDuration = this.getDistractedDuration();
    this.suspicion = 0;
    this.progress = 0;
    this.beltTension = 0;
    this.pullDuration = 0;
    this.isExtracting = false;
    this.isCaught = false;
    this.isStolen = false;
    this.telegraphTimer = 0;
    this.alertLookTimer = 0;
    this.rustleSoundCooldown = 0;
    this.heartbeatTimer = 0;
    this.particles = [];

    this.currentHeadAngle = -8;
    this.targetHeadAngle = -8;
    this.currentTorsoTurn = 0;
    this.targetTorsoTurn = 0;

    if (this.btnTouchSteal) {
      this.btnTouchSteal.classList.remove('active');
    }
    this.updateHUD();
  }

  start() {
    if (this.app?.getLootType) {
      this.lootType = this.app.getLootType();
    }
    this.calculateDndParams();
    this.reset();
  }

  getDistractedDuration() {
    return this.distractedMin + Math.random() * (this.distractedMax - this.distractedMin);
  }

  // --- ИГРОВОЙ ЦИКЛ ---
  startAnimationLoop() {
    let lastTime = performance.now();
    const loop = (currentTime) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      this.update(dt);
      this.draw();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  update(dt) {
    if (this.isCaught || this.isStolen) return;

    this.breathCycle += dt;

    // Плавная анимация поворота головы и плеч жертвы (LERP)
    this.currentHeadAngle += (this.targetHeadAngle - this.currentHeadAngle) * Math.min(1, 14 * dt);
    this.currentTorsoTurn += (this.targetTorsoTurn - this.currentTorsoTurn) * Math.min(1, 10 * dt);

    // 1. АВТОМАТ СОСТОЯНИЙ ВНИМАНИЯ ЖЕРТВЫ
    if (this.targetState === 'DISTRACTED') {
      this.targetHeadAngle = -8;
      this.targetTorsoTurn = 0;

      this.stateTimer += dt;
      if (this.stateTimer >= this.stateDuration) {
        // Переход к настороженности
        this.targetState = 'SUSPICIOUS';
        this.telegraphTimer = this.telegraphDuration;
        this.targetHeadAngle = 28; // голова начинает поворачиваться
        this.targetTorsoTurn = 8;
        audio.playTargetSuspicious();
      }

      // Вытягивание кошеля
      if (this.isExtracting) {
        this.pullDuration += dt;
        this.progress = Math.min(100, this.progress + this.extractionSpeed * dt);

        // Звук трения при непрерывном вытягивании
        this.rustleSoundCooldown -= dt;
        if (this.rustleSoundCooldown <= 0) {
          this.playTugSound(0.04);
          this.rustleSoundCooldown = 0.17;
        }

        // Рост натяжения ремня
        if (this.pullDuration > this.maxSafeTug) {
          this.beltTension = Math.min(100, this.beltTension + this.tensionBuildRate * dt);

          // Перенатяжение ремня
          if (this.beltTension >= 98) {
            this.playOverTugSound();
            this.spawnCoinSparkle(1);
            this.suspicion = Math.min(100, this.suspicion + (20 * this.suspicionMult));
            if (this.app?.stealthNoiseEnabled) {
              this.app.addNoise(12);
            }
            // Цель сразу дёргается от рывка
            this.targetState = 'SUSPICIOUS';
            this.telegraphTimer = this.telegraphDuration * 0.75;
            this.targetHeadAngle = 35;
            this.targetTorsoTurn = 10;
            this.beltTension = 60;
            this.pullDuration = this.maxSafeTug * 0.5;
            audio.playTargetSuspicious();
          }
        } else {
          this.beltTension = (this.pullDuration / this.maxSafeTug) * 55;
        }
      } else {
        // Рука отпущена: натяжение быстро сбрасывается
        this.pullDuration = 0;
        this.beltTension = Math.max(0, this.beltTension - 340 * dt);
        if (this.suspicion > 0) {
          this.suspicion = Math.max(0, this.suspicion - 8.5 * dt);
        }
      }

    } else if (this.targetState === 'SUSPICIOUS') {
      // ФАЗА ПРЕДУПРЕЖДЕНИЯ (Telegraph)
      this.targetHeadAngle = 32;
      this.targetTorsoTurn = 10;
      this.telegraphTimer -= dt;

      if (this.isExtracting) {
        // ОШИБКА: Игрок тянет, пока цель насторожена!
        this.suspicion = Math.min(100, this.suspicion + (70 * this.suspicionMult * dt));
        this.progress = Math.min(100, this.progress + (this.extractionSpeed * 0.3) * dt);
        this.playOverTugSound();

        if (this.app?.stealthNoiseEnabled) {
          this.app.addNoise(22 * dt);
        }

        if (this.telegraphTimer <= 0 || this.suspicion >= 50) {
          this.targetState = 'ALERT';
          this.alertLookTimer = this.alertDuration;
          this.targetHeadAngle = 65; // смотрит прямо на пояс!
          this.targetTorsoTurn = 22;
          audio.playTargetAlert();
        }
      } else {
        // Игрок вовремя замер
        this.beltTension = Math.max(0, this.beltTension - 350 * dt);

        if (this.telegraphTimer <= 0) {
          if (Math.random() < 0.68) {
            this.targetState = 'ALERT';
            this.alertLookTimer = this.alertDuration;
            this.targetHeadAngle = 65;
            this.targetTorsoTurn = 22;
            audio.playTargetAlert();
          } else {
            // Отмахнулась обратно
            this.targetState = 'DISTRACTED';
            this.stateTimer = 0;
            this.stateDuration = this.getDistractedDuration();
            this.targetHeadAngle = -8;
            this.targetTorsoTurn = 0;
          }
        }
      }

    } else if (this.targetState === 'ALERT') {
      // ФАЗА ПРОВЕРКИ (Alert) — цель смотрит прямо на карман!
      this.targetHeadAngle = 68;
      this.targetTorsoTurn = 24;
      this.alertLookTimer -= dt;

      if (this.isExtracting) {
        // КАТАСТРОФА: движение под прямым взглядом!
        this.suspicion = 100;
        this.triggerCaught();
        return;
      } else {
        this.beltTension = 0;

        if (this.alertLookTimer <= 0) {
          // Ничего не заметила, успокаивается и отворачивается
          this.targetState = 'DISTRACTED';
          this.stateTimer = 0;
          this.stateDuration = this.getDistractedDuration();
          this.targetHeadAngle = -8;
          this.targetTorsoTurn = 0;
          this.suspicion = Math.max(0, this.suspicion - 18);
        }
      }
    }

    // 2. СТУК СЕРДЦА
    if (this.suspicion >= 40) {
      this.heartbeatTimer += dt;
      const beatRate = this.suspicion >= 75 ? 0.52 : 0.85;
      if (this.heartbeatTimer >= beatRate) {
        this.heartbeatTimer = 0;
        audio.playHeartbeat();
      }
    }

    // 3. ПРОВЕРКА ПОБЕДЫ / ПОРАЖЕНИЯ
    if (this.suspicion >= 100) {
      this.triggerCaught();
      return;
    }

    if (this.progress >= 100) {
      this.triggerStolenSuccess();
      return;
    }

    this.updateHUD();

    // Частицы
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  updateHUD() {
    if (!this.awarenessIcon || !this.awarenessStatus) return;

    if (this.targetState === 'DISTRACTED') {
      this.awarenessIcon.textContent = '🍺';
      this.awarenessStatus.textContent = 'Отвлечён (Смотрит в зал / Пьет эль)';
      this.awarenessStatus.style.color = '#22c55e';
      this.npcAwarenessBox?.classList.remove('suspicious', 'alert');
    } else if (this.targetState === 'SUSPICIOUS') {
      this.awarenessIcon.textContent = '👂';
      this.awarenessStatus.textContent = 'НАСТОРОЖИЛСЯ! (Прислушивается... Замри!)';
      this.awarenessStatus.style.color = '#f59e0b';
      this.npcAwarenessBox?.classList.add('suspicious');
      this.npcAwarenessBox?.classList.remove('alert');
    } else {
      this.awarenessIcon.textContent = '👁️';
      this.awarenessStatus.textContent = 'ПРОВЕРЯЕТ КАРМАНЫ! (Не шевелись!)';
      this.awarenessStatus.style.color = '#ef4444';
      this.npcAwarenessBox?.classList.remove('suspicious');
      this.npcAwarenessBox?.classList.add('alert');
    }

    // Подозрение
    if (this.suspicionFill && this.suspicionVal) {
      const s = Math.round(this.suspicion);
      this.suspicionFill.style.width = `${s}%`;
      this.suspicionVal.textContent = `${s}%`;
      this.suspicionFill.style.background = s < 40 ? '#22c55e' : s < 75 ? '#f59e0b' : '#ef4444';
    }

    // Натяжение пояса (Ритм рывка)
    if (this.tensionFill && this.tensionVal) {
      const t = Math.round(this.beltTension);
      this.tensionFill.style.width = `${t}%`;
      this.tensionVal.textContent = `${t}%`;
      this.tensionVal.style.color = t < 55 ? '#60a5fa' : t < 80 ? '#f59e0b' : '#ef4444';
      this.tensionFill.style.background = t < 55 ? '#3b82f6' : t < 80 ? '#f59e0b' : '#ef4444';
    }

    // Извлечение
    if (this.extractionFill && this.extractionPercent) {
      const p = Math.round(this.progress);
      this.extractionFill.style.width = `${p}%`;
      this.extractionPercent.textContent = `${p}%`;
    }
  }

  triggerCaught() {
    this.isCaught = true;
    this.isExtracting = false;
    this.targetHeadAngle = 72;
    this.targetTorsoTurn = 28;
    audio.playTargetAlert();
    audio.playFailure();
    this.app?.recordMistake?.();
    this.app?.addNoise?.(45);

    this.updateHUD();

    setTimeout(() => {
      this.app?.finishGame?.(false, { reason: 'pickpocket_detected' });
    }, 700);
  }

  triggerStolenSuccess() {
    this.isStolen = true;
    this.isExtracting = false;
    const lootDef = LOOT_TYPES[this.lootType] || LOOT_TYPES.pouch;
    if (lootDef.soundType === 'keys') {
      audio.playKeysClink(0.14);
    } else {
      audio.playPurseSnatch();
    }
    audio.playSuccess();

    // Россыпь искр победы
    for (let i = 0; i < 35; i++) {
      this.spawnCoinSparkle(2.5);
    }

    this.updateHUD();

    setTimeout(() => {
      this.app?.finishGame?.(true);
    }, 850);
  }

  spawnCoinSparkle(speedMult = 1.0) {
    if (!this.logicalWidth || !this.logicalHeight) return;
    const cx = this.logicalWidth / 2;
    const cy = this.logicalHeight * 0.45;
    const a = Math.random() * Math.PI * 2;
    const speed = (1.5 + Math.random() * 3.5) * speedMult;

    this.particles.push({
      x: cx + (Math.random() - 0.5) * 36,
      y: cy + (Math.random() - 0.5) * 36,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 1.2,
      color: Math.random() > 0.35 ? '#ffd700' : '#ffffff',
      size: 2.5 + Math.random() * 3,
      life: 1.0,
      decay: 0.035
    });
  }

  // --- ОТРИСОВКА НА ХОЛСТЕ ---
  draw() {
    if (!this.ctx || !this.logicalWidth) return;
    const ctx = this.ctx;
    const w = this.logicalWidth;
    const h = this.logicalHeight;
    const cx = w / 2;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Трактирный полумрак и ткань мантии с живой анимацией плеч и головы
    this.drawBackground(ctx, cx, w, h);

    // 2. Световой конус/аура внимания цели
    this.drawAwarenessAura(ctx, cx, w, h);

    // 3. Кожаный ремень с латунными бляшками
    this.drawBelt(ctx, cx, w);

    // 4. Кожаный кошель со шнурками
    this.drawPouch(ctx, cx, h);

    // 5. Драгоценная добыча выбранного типа
    this.drawLootItem(ctx, cx, h);

    // 6. Воровские перчатки и руки
    this.drawHands(ctx, cx, h);

    // 7. Искры
    this.drawParticles(ctx);

    ctx.restore();
  }

  drawBackground(ctx, cx, w, h) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0f1118');
    bgGrad.addColorStop(1, '#07080c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Дыхание цели в спокойном состоянии
    const breath = this.targetState === 'DISTRACTED' ? Math.sin(this.breathCycle * 2.2) * 2.5 : 0;
    const torsoShift = (this.currentTorsoTurn / 25) * 16;

    // Спина и плечи жертвы
    ctx.save();
    ctx.translate(torsoShift, breath);

    // Тёмный шерстяной плащ
    ctx.fillStyle = '#171926';
    ctx.beginPath();
    ctx.moveTo(cx - 150, 0);
    ctx.lineTo(cx + 150, 0);
    ctx.lineTo(cx + 190, h);
    ctx.lineTo(cx - 190, h);
    ctx.fill();

    // Складки плаща
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 75, 0);
    ctx.bezierCurveTo(cx - 95, h * 0.4, cx - 115, h * 0.8, cx - 125, h);
    ctx.moveTo(cx + 75, 0);
    ctx.bezierCurveTo(cx + 95, h * 0.4, cx + 115, h * 0.8, cx + 125, h);
    ctx.stroke();

    // Воротник плаща
    ctx.fillStyle = '#232738';
    ctx.beginPath();
    ctx.ellipse(cx, 12, 100, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // ГОЛОВА ЖЕРТВЫ (С анимацией поворота шеи)
    const headRad = (this.currentHeadAngle * Math.PI) / 180;
    ctx.save();
    ctx.translate(cx, 8);
    ctx.rotate(headRad);

    // Капюшон / затылок
    ctx.fillStyle = '#11131c';
    ctx.beginPath();
    ctx.ellipse(0, -18, 42, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2b3044';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Если голова сильно повернута (ALERT) — виден профиль лица и глаз
    if (this.currentHeadAngle > 40) {
      ctx.fillStyle = '#d1a784';
      ctx.beginPath();
      ctx.arc(28, -14, 12, 0, Math.PI * 2);
      ctx.fill();

      // Глаз смотрящий на пояс
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(32, -12, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // возврат от головы
    ctx.restore(); // возврат от туловища
  }

  drawAwarenessAura(ctx, cx, w, h) {
    if (this.targetState === 'DISTRACTED') {
      const g = ctx.createRadialGradient(cx, 30, 20, cx, 30, 180);
      g.addColorStop(0, 'rgba(34, 197, 94, 0.08)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    } else if (this.targetState === 'SUSPICIOUS') {
      const pulse = 0.5 + Math.sin(performance.now() * 0.012) * 0.35;
      const g = ctx.createRadialGradient(cx, 30, 20, cx, 30, 230);
      g.addColorStop(0, `rgba(245, 158, 11, ${0.14 * pulse})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    } else if (this.targetState === 'ALERT') {
      const pulse = 0.7 + Math.sin(performance.now() * 0.018) * 0.3;
      const g = ctx.createRadialGradient(cx, 40, 10, cx, 140, 250);
      g.addColorStop(0, `rgba(239, 68, 68, ${0.24 * pulse})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Глаз тревоги
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 22px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👁️', cx, 28);
      ctx.restore();
    }
  }

  drawBelt(ctx, cx, w) {
    ctx.fillStyle = '#26170a';
    ctx.fillRect(cx - 200, 22, 400, 36);
    ctx.strokeStyle = '#422812';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 200, 22, 400, 36);

    // Латунные заклёпки
    ctx.fillStyle = '#d4af37';
    for (let x = cx - 180; x <= cx + 180; x += 36) {
      ctx.beginPath();
      ctx.arc(x, 40, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Латунная пряжка
    ctx.strokeStyle = '#e5b839';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 24, 20, 48, 40);
  }

  drawPouch(ctx, cx, h) {
    const pouchTopY = 56;
    const pouchHeight = 155;

    // Смещение кошеля вверх по мере извлечения (до 45px)
    const liftY = (this.progress / 100) * 45;
    const actualPouchY = pouchTopY - liftY;

    // Дрожь кошеля при высоком натяжении
    const shake = this.beltTension > 60 ? (Math.random() - 0.5) * (this.beltTension / 22) : 0;
    const finalCx = cx + shake;

    // Шнурки подвеса (натягиваются, меняют цвет на предупреждающий красный)
    ctx.save();
    ctx.strokeStyle = this.beltTension > 75 ? '#ef4444' : this.beltTension > 45 ? '#f59e0b' : '#8d5b2d';
    ctx.lineWidth = this.beltTension > 75 ? 3.5 : 2.5;

    ctx.beginPath();
    ctx.moveTo(finalCx - 22, 48);
    ctx.lineTo(finalCx - 16, actualPouchY + 6);
    ctx.moveTo(finalCx + 22, 48);
    ctx.lineTo(finalCx + 16, actualPouchY + 6);
    ctx.stroke();
    ctx.restore();

    // Тело кошеля
    const pouchGrad = ctx.createRadialGradient(finalCx, actualPouchY + 70, 8, finalCx, actualPouchY + 70, 85);
    pouchGrad.addColorStop(0, '#53321d');
    pouchGrad.addColorStop(0.75, '#2e190d');
    pouchGrad.addColorStop(1, '#180d06');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(finalCx - 42, actualPouchY);
    ctx.bezierCurveTo(finalCx - 80, actualPouchY + 40, finalCx - 75, actualPouchY + pouchHeight, finalCx, actualPouchY + pouchHeight + 8);
    ctx.bezierCurveTo(finalCx + 75, actualPouchY + pouchHeight, finalCx + 80, actualPouchY + 40, finalCx + 42, actualPouchY);
    ctx.closePath();

    ctx.fillStyle = pouchGrad;
    ctx.fill();

    ctx.strokeStyle = this.beltTension > 80 ? 'rgba(239, 68, 68, 0.75)' : '#744728';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Горловина кошеля со шнуровкой
    ctx.fillStyle = '#1e1107';
    ctx.fillRect(finalCx - 40, actualPouchY - 2, 80, 14);

    ctx.restore();
  }

  drawLootItem(ctx, cx, h) {
    const startY = 175;
    const endY = 65;
    const currentY = startY - (this.progress / 100) * (startY - endY);

    ctx.save();

    if (this.lootType === 'keys') {
      // 🗝️ СВЯЗКА КЛЮЧЕЙ
      ctx.shadowColor = '#94a3b8';
      ctx.shadowBlur = this.progress > 75 ? 14 : 4;

      // Стальное кольцо связки
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(cx, currentY - 12, 16, 0, Math.PI * 2);
      ctx.stroke();

      // 3 ключа, висящих веером
      const angles = [-0.35, 0, 0.35];
      const lengths = [36, 42, 34];
      const colors = ['#f59e0b', '#94a3b8', '#e2e8f0'];

      angles.forEach((ang, i) => {
        ctx.save();
        ctx.translate(cx, currentY - 6);
        ctx.rotate(ang);

        // Стержень ключа
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, lengths[i]);
        ctx.stroke();

        // Бородка ключа
        ctx.fillStyle = colors[i];
        ctx.fillRect(2, lengths[i] - 12, 7, 3);
        ctx.fillRect(2, lengths[i] - 6, 9, 4);

        ctx.restore();
      });

    } else if (this.lootType === 'scroll') {
      // 📜 СВИТОК / ПИСЬМО
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = this.progress > 75 ? 16 : 5;

      ctx.save();
      ctx.translate(cx, currentY + 4);

      // Тело свитка (свернутый пергамент)
      const pGrad = ctx.createLinearGradient(-18, 0, 18, 0);
      pGrad.addColorStop(0, '#d4c090');
      pGrad.addColorStop(0.5, '#fef9c3');
      pGrad.addColorStop(1, '#c8b27c');

      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.roundRect(-20, -22, 40, 44, 4);
      ctx.fill();
      ctx.strokeStyle = '#a1834e';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Свитые края
      ctx.fillStyle = '#b89b62';
      ctx.beginPath();
      ctx.ellipse(-20, 0, 4, 21, 0, 0, Math.PI * 2);
      ctx.ellipse(20, 0, 4, 21, 0, 0, Math.PI * 2);
      ctx.fill();

      // Красная шелковая лента с сургучной печатью
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(-20, -5, 40, 10);

      // Сургучная печать
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

    } else if (this.lootType === 'amulet') {
      // 💎 АМУЛЕТ НА ЦЕПОЧКЕ
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = this.progress > 75 ? 18 : 6;

      // Золотая цепочка
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, currentY - 24);
      ctx.lineTo(cx, currentY);
      ctx.stroke();

      // Оправа амулета
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(cx, currentY, 17, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Рубин
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(cx, currentY, 8, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // 💰 ТЯЖЁЛЫЙ КОШЕЛЬ (Вытягивание золота прямо из кармана)
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = this.progress > 75 ? 16 : 6;

      // Горка золотых монет, показывающаяся из горловины
      const coinY = currentY - 4;
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;

      [-14, 0, 14].forEach((xOff, i) => {
        ctx.beginPath();
        ctx.ellipse(cx + xOff, coinY + (i % 2 === 0 ? 0 : -4), 10, 6, 0.2 * (i - 1), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Золотое тиснение знака гильдии
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 16px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚜️', cx, coinY + 18);
    }

    ctx.restore();
  }

  drawHands(ctx, cx, h) {
    const handY = 170 - (this.progress / 100) * 85;

    ctx.save();
    ctx.fillStyle = '#1c1f2b';
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;

    if (this.isExtracting) {
      // Пальцы вора крепко и осторожно держат шнур / предмет
      ctx.beginPath();
      ctx.roundRect(cx - 15, handY - 12, 9, 28, 4);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(cx + 6, handY - 12, 9, 28, 4);
      ctx.fill();
      ctx.stroke();
    } else {
      // Рука убрана в тень
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.roundRect(cx - 15, 235, 9, 22, 4);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(cx + 6, 235, 9, 22, 4);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // Если пойман: латная перчатка стражника перехватывает запястье!
    if (this.isCaught) {
      ctx.fillStyle = '#4b5563';
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(cx - 32, handY - 4, 64, 22, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ХВАТКА!', cx, handY + 12);
    }

    ctx.restore();
  }

  drawParticles(ctx) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
