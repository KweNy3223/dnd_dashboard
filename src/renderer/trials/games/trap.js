/**
 * Модуль мини-игры: Обезвреживание ловушки (Trap Disarming) v2.2
 * Высокая сложность, точная физика и исправление всех багов:
 * 1. 🏹 «Арбалетная растяжка (нить)»:
 *    - Исправлен критический баг: срез натянутой струны БОЛЬШЕ НЕ ДАЕТ ПОБЕДУ, а взводит боёк!
 *    - Шептало требует прицельного клика при совпадении + таймер срыва пружины.
 * 2. ⚙️ «Зубчатый часовой механизм (шестерня)»:
 *    - Высокая базовая скорость + бешеное ускорение (+50%) после 1-го клина!
 * 3. ⚖️ «Плита-противовес (давление и вес)»:
 *    - Полностью перерисован и исправлен интерфейс (шкала недовеса/перевеса, выдвижные штифты).
 *    - Узкий коридор равновесия + быстрый срыв бойка при перекосе (>0.4с).
 * 4. 🧪 «Ядовитый распылитель (газ и давление)»:
 *    - Быстрое нарастание пара, строгое окно впрыска (0..38%), обратный гидроудар при жадности!
 */

import { audio } from '../audio.js';
import { dnd } from '../dnd-engine.js';

export const TRAP_CONFIGS = {
  tripwire: {
    id: 'tripwire',
    name: 'Арбалетная растяжка',
    icon: '🏹',
    subtitle: '1. Совместите штифт с шепталом и нажмите ПРОБЕЛ/Клик -> 2. Перекусите струну в узкой зелёной зоне',
    actionBtnText: 'Зафиксировать штифт (ПРОБЕЛ / ЛКМ)',
    actionBtnIcon: '🪡',
    guide1Key: 'Шептало',
    guide1Desc: 'Наведите штифт на паз и нажмите ПРОБЕЛ/Клик',
    guide2Key: 'Нить',
    guide2Desc: 'Срезайте нить строго в зелёной зоне натяжения',
    guide3Key: 'Осечка',
    guide3Desc: 'Срез под натяжением дергает спуск и взводит боёк!'
  },
  gears: {
    id: 'gears',
    name: 'Зубчатый часовой механизм',
    icon: '⚙️',
    subtitle: 'Вбивайте стопорный клин в открывающиеся пазы. Осторожно: после 1-го клина механизм ускоряется!',
    actionBtnText: 'Вбить стопорный клин (ПРОБЕЛ / КЛИК)',
    actionBtnIcon: '🔨',
    guide1Key: 'Тайминг',
    guide1Desc: 'Ждите момента точного совмещения паза с клином',
    guide2Key: 'Ускорение',
    guide2Desc: 'После 1-го клина шестерня крутится на +50% быстрее!',
    guide3Key: 'Осечка',
    guide3Desc: 'Удар по зубьям шестерни взводит боёк'
  },
  plate: {
    id: 'plate',
    name: 'Плита-противовес',
    icon: '⚖️',
    subtitle: 'Подсыпайте песок короткими нажатиями (ПРОБЕЛ / ЛКМ), балансируя плиту в зелёном секторе',
    actionBtnText: 'Сыпать песок (Зажать ПРОБЕЛ / ЛКМ)',
    actionBtnIcon: '⏳',
    guide1Key: 'Ритм',
    guide1Desc: 'Сыпьте песок короткими порциями (тап-тап)',
    guide2Key: 'Баланс',
    guide2Desc: 'Удерживайте стрелку в зелёном секторе до 100%',
    guide3Key: 'Перекос',
    guide3Desc: 'Перевес или недобор свыше 0.4 сек сдвигает боёк!'
  },
  gas: {
    id: 'gas',
    name: 'Ядовитый распылитель',
    icon: '🧪',
    subtitle: 'Сбрасывайте пар клавишей ПРОБЕЛ, а в зелёной зоне (<38%) зажимайте впрыск нейтрализатора',
    actionBtnText: 'Впрыск нейтрализатора (Зажать ЛКМ / кнопку)',
    actionBtnIcon: '💉',
    guide1Key: 'Сброс пара',
    guide1Desc: 'Клавиша ПРОБЕЛ сбивает напор пара в зелёную зону',
    guide2Key: 'Впрыск',
    guide2Desc: 'Вводите реагент только пока манометр в ЗЕЛЁНОМ секторе (<38%)',
    guide3Key: 'Гидроудар',
    guide3Desc: 'Впрыск в жёлтой зоне или рост давления до 100% сорвут затвор!'
  }
};

export class TrapGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;

    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;

    // Тип ловушки и параметры сессии
    this.trapType = 'tripwire';
    this.strikerStage = 0; // 0, 1, 2 -> 3 (детонация)
    this.isDisarmed = false;
    this.isDetonated = false;
    this.isHoldingAction = false;
    this.shakeAmount = 0;
    this.statusMessage = '';
    this.statusTimer = 0;
    this.particles = [];
    this.animTime = 0;

    // Параметры D&D
    this.dc = 15;
    this.bonus = 3;

    // --- 1. Растяжка ---
    this.tripwire = {
      subStage: 'SEAR_LOCK', // 'SEAR_LOCK' -> 'WIRE_SNIP'
      searProgress: 0,
      searTargetX: 0.5,
      searTargetWidth: 0.12,
      searCurrentX: 0.2,
      searAligned: false,
      tension: 50,
      tensionPhase: 0,
      tensionSpeed: 2.8,
      tensionSafeMin: 46,
      tensionSafeMax: 54,
      wireSevered: false,
      searTimer: 0
    };

    // --- 2. Шестерни ---
    this.gears = {
      wedgesInserted: 0,
      wedgesRequired: 2,
      angle: 0,
      baseSpeed: 2.8,
      speed: 2.8,
      wedgeDropY: 0,
      wedgeStriking: false,
      notches: [
        { angle: 0, width: 0.24, jammed: false },
        { angle: Math.PI, width: 0.24, jammed: false }
      ],
      lastTickTooth: -1
    };

    // --- 3. Плита-противовес ---
    this.plate = {
      weight: 50,           // 0..100%
      safeMin: 46,
      safeMax: 54,
      stabilizeProgress: 0, // 0..100%
      pourRate: 58,
      drainRate: 48,
      maxDangerTime: 0.42,
      dangerAccumulator: 0
    };

    // --- 4. Газовый распылитель ---
    this.gas = {
      pressure: 20,         // 0..100%
      riseRate: 25,         // % в секунду
      safeZoneMax: 38,      // строгая граница зеленой зоны
      dangerZoneMin: 75,    // граница красной зоны
      neutralizeProgress: 0,// 0..100%
      ventCooldown: 0
    };

    // Привязанные события
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
    this.boundResize = this.setupCanvas.bind(this);
  }

  setTrapType(type) {
    if (TRAP_CONFIGS[type]) {
      this.trapType = type;
    } else {
      this.trapType = 'tripwire';
    }
    this.calculateDndParams();
    this.resetSubgames();
    this.renderDOM();
    this.setupCanvas();
    this.bindEvents();
    this.updateHUD();
  }

  init() {
    if (this.app?.getTrapType) {
      const savedType = this.app.getTrapType();
      if (TRAP_CONFIGS[savedType]) {
        this.trapType = savedType;
      }
    }
    this.calculateDndParams();
    this.renderDOM();
    this.setupCanvas();
    this.bindEvents();
    this.reset();
    this.startAnimationLoop();
  }

  calculateDndParams() {
    this.dc = dnd.dc || 15;
    this.bonus = dnd.bonus !== undefined ? dnd.bonus : 3;

    // 1. Растяжка: шептало и натяжение
    const searW = Math.max(0.08, Math.min(0.20, 0.13 + (this.bonus * 0.01) - ((this.dc - 15) * 0.01)));
    this.tripwire.searTargetWidth = searW;
    this.tripwire.tensionSpeed = Math.max(1.8, 2.8 + (this.dc - 15) * 0.16 - (this.bonus * 0.06));
    this.tripwire.tensionSafeMin = 46;
    this.tripwire.tensionSafeMax = 54;

    // 2. Шестерни: высокая скорость
    this.gears.baseSpeed = Math.max(1.8, 2.8 + (this.dc - 15) * 0.18 - (this.bonus * 0.06));
    this.gears.speed = this.gears.baseSpeed;
    const notchW = Math.max(0.14, Math.min(0.32, 0.22 + (this.bonus * 0.015) - ((this.dc - 15) * 0.014)));
    this.gears.notches.forEach(n => { n.width = notchW; });

    // 3. Плита: узкий коридор
    const plateSpread = Math.max(4.0, Math.min(8.5, 6.5 + this.bonus * 0.4 - (this.dc - 15) * 0.4));
    this.plate.safeMin = 50 - plateSpread;
    this.plate.safeMax = 50 + plateSpread;
    this.plate.drainRate = Math.max(40, 50 + (this.dc - 15) * 1.8);
    this.plate.pourRate = 62 + (this.bonus * 2);
    this.plate.maxDangerTime = Math.max(0.32, 0.46 - (this.dc - 15) * 0.02);

    // 4. Газ: скорость нарастания давления
    this.gas.riseRate = Math.max(18, 25 + (this.dc - 15) * 1.3 - (this.bonus * 0.4));
  }

  reset() {
    this.strikerStage = 0;
    this.isDisarmed = false;
    this.isDetonated = false;
    this.isHoldingAction = false;
    this.shakeAmount = 0;
    this.statusMessage = '';
    this.statusTimer = 0;
    this.particles = [];
    this.resetSubgames();
    if (this.app?.setStrikerStage) {
      this.app.setStrikerStage(0);
    }
    this.updateHUD();
  }

  resetSubgames() {
    this.tripwire.subStage = 'SEAR_LOCK';
    this.tripwire.searProgress = 0;
    this.tripwire.searCurrentX = 0.2;
    this.tripwire.searAligned = false;
    this.tripwire.tension = 50;
    this.tripwire.wireSevered = false;
    this.tripwire.searTimer = 0;

    this.gears.wedgesInserted = 0;
    this.gears.wedgeDropY = 0;
    this.gears.wedgeStriking = false;
    this.gears.speed = this.gears.baseSpeed;
    this.gears.notches.forEach(n => { n.jammed = false; });

    this.plate.weight = 50;
    this.plate.stabilizeProgress = 0;
    this.plate.dangerAccumulator = 0;

    this.gas.pressure = 20;
    this.gas.neutralizeProgress = 0;
    this.gas.ventCooldown = 0;
  }

  start() {
    this.reset();
  }

  renderDOM() {
    const cfg = TRAP_CONFIGS[this.trapType] || TRAP_CONFIGS.tripwire;

    this.container.innerHTML = `
      <div class="stage-container trap-stage">
        <div class="stage-header">
          <h2 class="stage-title">${cfg.icon} ${cfg.name}</h2>
          <p class="stage-subtitle" id="trapStageSubtitle">${cfg.subtitle}</p>
        </div>

        <div class="trap-layout">
          <!-- Информационный HUD механизма -->
          <div class="trap-status-hud">
            <div class="trap-hud-row">
              <span id="trapHudLabel">Состояние механизма:</span>
              <span class="trap-hud-badge" id="trapHudValue">Взведено (Боёк нейтрален)</span>
            </div>
            <div class="trap-progress-track">
              <div class="trap-progress-fill" id="trapProgressFill" style="width: 0%;"></div>
            </div>
          </div>

          <!-- Центральный игровой холст -->
          <div class="trap-canvas-wrapper">
            <canvas id="trapCanvas" class="game-canvas"></canvas>

            <!-- Кнопки действия -->
            <div class="trap-controls-row">
              <button type="button" class="btn fantasy-btn primary trap-action-btn" id="btnTrapAction">
                <span id="trapActionIcon">${cfg.actionBtnIcon}</span>
                <span id="trapActionText">${cfg.actionBtnText}</span>
              </button>

              ${this.trapType === 'gas' ? `
                <button type="button" class="btn fantasy-btn secondary" id="btnTrapSecondary" style="min-width: 220px; padding: 12px 22px; font-weight: 700;">
                  <span>💨</span> Сбросить пар (ПРОБЕЛ)
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Памятка управления -->
          <div class="lock-controls-guide" style="margin-top: 6px;">
            <div class="guide-pill">
              <span class="guide-key">${cfg.guide1Key}</span>
              <span>${cfg.guide1Desc}</span>
            </div>
            <div class="guide-pill">
              <span class="guide-key">${cfg.guide2Key}</span>
              <span>${cfg.guide2Desc}</span>
            </div>
            <div class="guide-pill">
              <span class="guide-key">${cfg.guide3Key}</span>
              <span>${cfg.guide3Desc}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#trapCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.trapStageSubtitle = this.container.querySelector('#trapStageSubtitle');
    this.trapHudLabel = this.container.querySelector('#trapHudLabel');
    this.trapHudValue = this.container.querySelector('#trapHudValue');
    this.trapProgressFill = this.container.querySelector('#trapProgressFill');
    this.btnTrapAction = this.container.querySelector('#btnTrapAction');
    this.btnTrapSecondary = this.container.querySelector('#btnTrapSecondary');
    this.trapActionIcon = this.container.querySelector('#trapActionIcon');
    this.trapActionText = this.container.querySelector('#trapActionText');
  }

  setupCanvas() {
    if (!this.canvas) return;
    const width = Math.min(520, Math.min(window.innerWidth - 48, 520));
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
    this.canvas.addEventListener('pointermove', this.boundPointerMove);
    this.canvas.addEventListener('pointerdown', this.boundPointerDown);
    window.addEventListener('pointerup', this.boundPointerUp);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('resize', this.boundResize);

    if (this.btnTrapAction) {
      this.btnTrapAction.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.handleActionStart();
      });
      this.btnTrapAction.addEventListener('pointerup', (e) => {
        e.preventDefault();
        this.handleActionEnd();
      });
    }

    if (this.btnTrapSecondary) {
      this.btnTrapSecondary.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSecondaryAction();
      });
    }
  }

  unbindEvents() {
    if (this.canvas) {
      this.canvas.removeEventListener('pointermove', this.boundPointerMove);
      this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
    }
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('resize', this.boundResize);
  }

  onPointerMove(e) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

    if (this.trapType === 'tripwire' && this.tripwire.subStage === 'SEAR_LOCK') {
      this.tripwire.searCurrentX = x;
      const diff = Math.abs(this.tripwire.searCurrentX - this.tripwire.searTargetX);
      const isAlignedNow = diff <= this.tripwire.searTargetWidth / 2;
      if (isAlignedNow && !this.tripwire.searAligned) {
        audio.playSearClick();
      }
      this.tripwire.searAligned = isAlignedNow;
    }
  }

  onPointerDown(e) {
    if (e.button !== 0) return;
    this.handleActionStart();
  }

  onPointerUp(e) {
    this.handleActionEnd();
  }

  onKeyDown(e) {
    if (e.repeat) return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (this.trapType === 'gas' && this.btnTrapSecondary) {
        this.handleSecondaryAction();
      } else {
        this.handleActionStart();
      }
    } else if (e.code === 'KeyV' || e.code === 'KeyE') {
      if (this.trapType === 'gas') {
        this.handleSecondaryAction();
      }
    }
  }

  onKeyUp(e) {
    if (e.code === 'Space') {
      if (this.trapType !== 'gas') {
        this.handleActionEnd();
      }
    }
  }

  handleActionStart() {
    if (this.isDisarmed || this.isDetonated) return;
    this.isHoldingAction = true;

    if (this.trapType === 'gears') {
      this.strikeGearWedge();
    } else if (this.trapType === 'tripwire') {
      if (this.tripwire.subStage === 'WIRE_SNIP') {
        this.snipTripwire();
      } else {
        this.checkSearAlignmentClick();
      }
    }
  }

  handleActionEnd() {
    this.isHoldingAction = false;
  }

  handleSecondaryAction() {
    if (this.isDisarmed || this.isDetonated) return;
    if (this.trapType === 'gas') {
      this.ventGasPressure();
    }
  }

  advanceStriker(reason = '') {
    if (this.isDisarmed || this.isDetonated) return;

    this.strikerStage = Math.min(3, this.strikerStage + 1);
    this.shakeAmount = 10 * this.strikerStage;
    this.statusMessage = reason || `Щёлк! Боёк сдвинулся (${this.strikerStage}/3)`;
    this.statusTimer = 2.2;

    audio.playStrikerStep(this.strikerStage);
    this.spawnSparks(this.logicalWidth / 2, this.logicalHeight / 2, '#f97316', 30 * this.strikerStage);

    if (this.app?.setStrikerStage) {
      this.app.setStrikerStage(this.strikerStage);
    }
    if (this.app?.recordMistake) {
      this.app.recordMistake();
    }

    if (this.strikerStage >= 3) {
      this.triggerDetonation(reason);
    } else {
      this.updateHUD();
    }
  }

  triggerDetonation(reason = '') {
    this.isDetonated = true;
    this.shakeAmount = 30;
    audio.playExplosion();
    this.spawnSparks(this.logicalWidth / 2, this.logicalHeight / 2, '#ef4444', 70);
    this.spawnSmoke(this.logicalWidth / 2, this.logicalHeight / 2, 50);

    this.statusMessage = `💥 ДЕТОНАЦИЯ! ${reason || 'Ловушка сработала!'}`;
    this.statusTimer = 4.0;
    this.updateHUD();

    setTimeout(() => {
      if (this.app?.finishGame) {
        this.app.finishGame(false, { reason: 'striker_detonated' });
      }
    }, 1100);
  }

  triggerVictory() {
    if (this.isDisarmed || this.isDetonated) return;
    this.isDisarmed = true;
    this.statusMessage = '✨ МЕХАНИЗМ ПОЛНОСТЬЮ ОБЕЗВРЕЖЕН!';
    this.statusTimer = 3.0;

    audio.playSuccess();
    this.spawnSparks(this.logicalWidth / 2, this.logicalHeight / 2, '#22c55e', 55);
    this.updateHUD();

    setTimeout(() => {
      if (this.app?.finishGame) {
        this.app.finishGame(true);
      }
    }, 1100);
  }

  // --- ПОД-ИГРА 1: АРБАЛЕТНАЯ РАСТЯЖКА ---
  checkSearAlignmentClick() {
    const diff = Math.abs(this.tripwire.searCurrentX - this.tripwire.searTargetX);
    if (diff <= this.tripwire.searTargetWidth / 2) {
      this.tripwire.searProgress = 100;
      this.finishSearLock();
    } else {
      // Клик мимо щели взводит боёк!
      this.advanceStriker('Штифт со звоном соскочил мимо шептала бойка!');
    }
  }

  finishSearLock() {
    audio.playSearClick();
    this.tripwire.subStage = 'WIRE_SNIP';
    this.statusMessage = '🛡️ Шептало бойка заблокировано! Срежьте нить строго в зелёной зоне!';
    this.statusTimer = 2.5;

    if (this.trapActionIcon) this.trapActionIcon.textContent = '✂️';
    if (this.trapActionText) this.trapActionText.textContent = 'Срезать нить кусачками (ПРОБЕЛ / КЛИК)';
    this.updateHUD();
  }

  snipTripwire() {
    const t = this.tripwire.tension;
    if (t >= this.tripwire.tensionSafeMin && t <= this.tripwire.tensionSafeMax) {
      // Идеальный чистый срез в узкой зоне!
      this.tripwire.wireSevered = true;
      audio.playWireCut(false);
      this.triggerVictory();
    } else {
      // ИСПРАВЛЕН БАГ: ошибка перекусывания БОЛЬШЕ НЕ ДАЕТ ПОБЕДУ!
      // Струна рвётся/бьет по спуску, боёк делает шаг!
      audio.playWireCut(true);
      this.advanceStriker('Струна натянута! Кусачки дернули спусковой крючок!');
      // Нить остается натянутой, попытка не завершена, игрок должен поймать зеленую зону!
    }
  }

  // --- ПОД-ИГРА 2: ЧАСОВОЙ МЕХАНИЗМ ---
  strikeGearWedge() {
    this.gears.wedgeStriking = true;
    this.gears.wedgeDropY = 0;

    const normAngle = ((this.gears.angle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
    let hitNotch = null;

    for (const notch of this.gears.notches) {
      if (notch.jammed) continue;
      const targetA = (notch.angle + (Math.PI * 2)) % (Math.PI * 2);
      let diff = Math.abs(normAngle - targetA);
      if (diff > Math.PI) diff = (Math.PI * 2) - diff;

      if (diff <= notch.width / 2) {
        hitNotch = notch;
        break;
      }
    }

    if (hitNotch) {
      hitNotch.jammed = true;
      this.gears.wedgesInserted++;
      audio.playWedgeStrike();
      this.spawnSparks(this.logicalWidth / 2, this.logicalHeight * 0.38, '#22c55e', 35);

      if (this.gears.wedgesInserted >= this.gears.wedgesRequired) {
        this.triggerVictory();
      } else {
        // УСКОРЕНИЕ НА +50%!
        this.gears.speed = this.gears.baseSpeed * 1.5;
        this.shakeAmount = 12;
        this.statusMessage = '⚠️ ПРУЖИНА ПЕРЕГРУЖЕНА! Колесо бешено ускорилось (+50%)!';
        this.statusTimer = 2.4;
        this.updateHUD();
      }
    } else {
      audio.playGearGrind();
      this.spawnSparks(this.logicalWidth / 2, this.logicalHeight * 0.38, '#f59e0b', 25);
      this.advanceStriker('Клин со скрежетом отскочил от калёных зубьев шестерни!');
    }
  }

  // --- ПОД-ИГРА 3: ПЛИТА-ПРОТИВОВЕС ---
  updatePlate(dt) {
    if (this.isDisarmed || this.isDetonated) return;

    // Прямой отзывчивый баланс песка
    if (this.isHoldingAction) {
      this.plate.weight = Math.min(100, this.plate.weight + this.plate.pourRate * dt);
      audio.playSandPour();
      this.spawnSandGrains();
    } else {
      this.plate.weight = Math.max(0, this.plate.weight - this.plate.drainRate * dt);
    }

    const inSafe = this.plate.weight >= this.plate.safeMin && this.plate.weight <= this.plate.safeMax;

    if (inSafe) {
      this.plate.stabilizeProgress = Math.min(100, this.plate.stabilizeProgress + 22 * dt);
      this.plate.dangerAccumulator = Math.max(0, this.plate.dangerAccumulator - dt * 2.0);
      audio.playBalanceChime();

      if (this.plate.stabilizeProgress >= 100) {
        this.triggerVictory();
      }
    } else {
      // Строгий лимит опасности: перекос свыше ~0.4с сдвигает боёк!
      this.plate.dangerAccumulator += dt;
      audio.playStoneGrind();

      if (this.plate.dangerAccumulator >= this.plate.maxDangerTime) {
        this.plate.dangerAccumulator = 0;
        this.advanceStriker(this.plate.weight > this.plate.safeMax ? 'Плита просела от перевеса!' : 'Плита перекосилась от недобора веса!');
      }
    }

    this.updateHUD();
  }

  spawnSandGrains() {
    const cx = this.logicalWidth / 2 + 140;
    const cy = 160;
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        type: 'sand',
        x: cx + (Math.random() - 0.5) * 6,
        y: cy + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 3 + Math.random() * 3,
        color: '#d97706',
        size: 2 + Math.random() * 1.5,
        life: 0.5,
        decay: 0.05
      });
    }
  }

  // --- ПОД-ИГРА 4: ЯДОВИТЫЙ РАСПЫЛИТЕЛЬ ---
  ventGasPressure() {
    if (this.gas.ventCooldown > 0) return;
    this.gas.ventCooldown = 0.55;
    audio.playSteamHiss(0.35);

    // Сбрасываем 36% давления
    this.gas.pressure = Math.max(10, this.gas.pressure - 36);
    this.spawnSteam(this.logicalWidth * 0.8, this.logicalHeight * 0.42, 25);
    this.statusMessage = '💨 Пар стравлен! Зажимайте впрыск пока манометр зелёный!';
    this.statusTimer = 1.3;
    this.updateHUD();
  }

  updateGas(dt) {
    if (this.isDisarmed || this.isDetonated) return;

    if (this.gas.ventCooldown > 0) {
      this.gas.ventCooldown = Math.max(0, this.gas.ventCooldown - dt);
    }

    // Быстрое нарастание давления
    this.gas.pressure += this.gas.riseRate * dt;

    // Взрыв котла при 100%
    if (this.gas.pressure >= 100) {
      this.gas.pressure = 60;
      this.advanceStriker('Критический перегрев котла — гидроудар сорвал затвор!');
    }

    // Впрыск нейтрализатора
    if (this.isHoldingAction) {
      if (this.gas.pressure <= this.gas.safeZoneMax) {
        // ЗЕЛЕНАЯ ЗОНА (<38%): впрыск работает
        this.gas.neutralizeProgress = Math.min(100, this.gas.neutralizeProgress + 18 * dt);
        audio.playChemicalFizz();
        audio.playNeedleInsert();

        if (this.gas.neutralizeProgress >= 100) {
          this.triggerVictory();
        }
      } else {
        // ЖЕЛТАЯ/КРАСНАЯ ЗОНА: обратный удар вышибает шприц и взводит боёк!
        this.isHoldingAction = false;
        this.advanceStriker('Обратное давление яда вышибло шприц! Боёк сорван!');
      }
    }

    this.updateHUD();
  }

  // --- HUD И СТАТУС ---
  updateHUD() {
    if (!this.trapHudLabel || !this.trapHudValue || !this.trapProgressFill) return;

    if (this.isDetonated) {
      this.trapHudValue.textContent = '💥 СРАБОТАЛА (ЛОВУШКА ДЕТОНИРОВАЛА)';
      this.trapHudValue.style.color = '#ed4245';
      this.trapProgressFill.style.width = '100%';
      this.trapProgressFill.className = 'trap-progress-fill danger';
      return;
    }

    if (this.isDisarmed) {
      this.trapHudValue.textContent = '✨ ОБЕЗВРЕЖЕНО (МЕХАНИЗМ ЗАБЛОКИРОВАН)';
      this.trapHudValue.style.color = '#22c55e';
      this.trapProgressFill.style.width = '100%';
      this.trapProgressFill.className = 'trap-progress-fill';
      return;
    }

    if (this.trapType === 'tripwire') {
      if (this.tripwire.subStage === 'SEAR_LOCK') {
        const isAligned = this.tripwire.searAligned;
        this.trapHudLabel.textContent = 'Шептало бойка:';
        this.trapHudValue.textContent = isAligned ? '🟢 СОВПАДЕНИЕ! Жмите ПРОБЕЛ / Клик!' : '🔴 Штифт не в пазу (наведите на синий паз)';
        this.trapHudValue.style.color = isAligned ? '#22c55e' : '#f59e0b';
        this.trapProgressFill.style.width = isAligned ? '100%' : '20%';
      } else {
        const t = Math.round(this.tripwire.tension);
        const inSafe = t >= this.tripwire.tensionSafeMin && t <= this.tripwire.tensionSafeMax;
        this.trapHudLabel.textContent = 'Натяжение спусковой нити:';
        this.trapHudValue.textContent = `${t}% ${inSafe ? '(🟢 МОМЕНТ ДЛЯ СРЕЗА!)' : '(⚠️ Опасно высокое натяжение)'}`;
        this.trapHudValue.style.color = inSafe ? '#22c55e' : '#f59e0b';
        this.trapProgressFill.style.width = `${t}%`;
      }
    } else if (this.trapType === 'gears') {
      const ins = this.gears.wedgesInserted;
      const req = this.gears.wedgesRequired;
      this.trapHudLabel.textContent = ins > 0 ? '⚠️ Пружина перегружена (+50% скорости):' : 'Стопорные клинья в шестерне:';
      this.trapHudValue.textContent = `${ins} из ${req} ${ins >= req ? '(Остановлено)' : '(Ловите пазы!)'}`;
      this.trapHudValue.style.color = ins > 0 ? '#f59e0b' : '#38bdf8';
      this.trapProgressFill.style.width = `${(ins / req) * 100}%`;
    } else if (this.trapType === 'plate') {
      const p = Math.round(this.plate.stabilizeProgress);
      const inSafe = this.plate.weight >= this.plate.safeMin && this.plate.weight <= this.plate.safeMax;
      this.trapHudLabel.textContent = 'Фиксация стопорных штифтов:';
      this.trapHudValue.textContent = `${p}% ${inSafe ? '(🟢 Равновесие удерживается)' : '(🔴 ПЕРЕКОС ПЛИТЫ!)'}`;
      this.trapHudValue.style.color = inSafe ? '#22c55e' : '#ed4245';
      this.trapProgressFill.style.width = `${p}%`;
    } else if (this.trapType === 'gas') {
      const p = Math.round(this.gas.pressure);
      const neut = Math.round(this.gas.neutralizeProgress);
      const isSafe = p <= this.gas.safeZoneMax;
      const isDanger = p >= this.gas.dangerZoneMin;
      this.trapHudLabel.textContent = `Давление: ${p}% | Нейтрализация:`;
      this.trapHudValue.textContent = `${neut}% ${isSafe ? '(🟢 Зажимайте впрыск!)' : isDanger ? '(🔴 СРОЧНО СБРОСЬТЕ ПАР!)' : '(🟡 Высокое давление — сбросьте пар)'}`;
      this.trapHudValue.style.color = isSafe ? '#22c55e' : isDanger ? '#ed4245' : '#f59e0b';
      this.trapProgressFill.style.width = `${neut}%`;
    }
  }

  // --- АНИМАЦИОННЫЙ ЦИКЛ ---
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
    this.animTime += dt;

    if (this.shakeAmount > 0) {
      this.shakeAmount *= 0.88;
      if (this.shakeAmount < 0.2) this.shakeAmount = 0;
    }

    if (this.statusTimer > 0) {
      this.statusTimer -= dt;
      if (this.statusTimer <= 0) this.statusMessage = '';
    }

    // Обновление частиц
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (this.isDisarmed || this.isDetonated) return;

    // 1. Растяжка
    if (this.trapType === 'tripwire') {
      if (this.tripwire.subStage === 'SEAR_LOCK') {
        this.tripwire.searTargetX = 0.5 + Math.sin(this.animTime * 4.2) * 0.28 + Math.cos(this.animTime * 2.3) * 0.15;
        const diff = Math.abs(this.tripwire.searCurrentX - this.tripwire.searTargetX);
        this.tripwire.searAligned = diff <= this.tripwire.searTargetWidth / 2;

        this.tripwire.searTimer += dt;
        if (this.tripwire.searTimer >= 6.5) {
          this.tripwire.searTimer = 0;
          this.advanceStriker('Шептало сорвалось от долгого напряжения пружины!');
        }

        this.updateHUD();
      } else {
        this.tripwire.tensionPhase += this.tripwire.tensionSpeed * dt;
        this.tripwire.tension = 50 + Math.sin(this.tripwire.tensionPhase) * 44;
        this.updateHUD();
      }
    }

    // 2. Шестерни
    if (this.trapType === 'gears') {
      this.gears.angle += this.gears.speed * dt;

      const toothIdx = Math.floor((this.gears.angle / (Math.PI * 2)) * 12);
      if (toothIdx !== this.gears.lastTickTooth) {
        this.gears.lastTickTooth = toothIdx;
        audio.playGearTick(1.0 + (toothIdx % 2) * 0.25);
      }

      if (this.gears.wedgeStriking) {
        this.gears.wedgeDropY += dt * 5;
        if (this.gears.wedgeDropY >= 1) {
          this.gears.wedgeStriking = false;
          this.gears.wedgeDropY = 0;
        }
      }
    }

    // 3. Плита
    if (this.trapType === 'plate') {
      this.updatePlate(dt);
    }

    // 4. Газ
    if (this.trapType === 'gas') {
      this.updateGas(dt);
    }
  }

  // --- ОТРИСОВКА (CANVAS) ---
  draw() {
    if (!this.ctx || !this.logicalWidth) return;
    const ctx = this.ctx;
    const w = this.logicalWidth;
    const h = this.logicalHeight;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    if (this.shakeAmount > 0) {
      const sx = (Math.random() - 0.5) * this.shakeAmount;
      const sy = (Math.random() - 0.5) * this.shakeAmount;
      ctx.translate(sx, sy);
    }

    this.drawChassis(ctx, w, h);

    if (this.trapType === 'tripwire') {
      this.drawTripwireMechanism(ctx, w, h);
    } else if (this.trapType === 'gears') {
      this.drawGearsMechanism(ctx, w, h);
    } else if (this.trapType === 'plate') {
      this.drawPlateMechanism(ctx, w, h);
    } else if (this.trapType === 'gas') {
      this.drawGasMechanism(ctx, w, h);
    }

    this.drawParticles(ctx);
    this.drawStrikerRatchet(ctx, w - 85, 45);

    if (this.statusMessage) {
      this.drawStatusBanner(ctx, w, h);
    }

    ctx.restore();
  }

  drawChassis(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#15171e');
    grad.addColorStop(1, '#0b0c10');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#2d323f';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, w - 6, h - 6);

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.strokeRect(7, 7, w - 14, h - 14);

    const rivets = [
      [14, 14], [w - 14, 14], [14, h - 14], [w - 14, h - 14],
      [w / 2, 14], [w / 2, h - 14]
    ];
    rivets.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#6b7280';
      ctx.fill();
      ctx.strokeStyle = '#1f2937';
      ctx.stroke();
    });
  }

  drawStrikerRatchet(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-45, -20, 90, 40, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'center';
    ctx.fillText('БОЁК ВЗВОДА', 0, -6);

    for (let i = 1; i <= 3; i++) {
      const px = -24 + (i - 1) * 24;
      const py = 10;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);

      if (this.strikerStage >= i) {
        ctx.fillStyle = i === 3 ? '#ed4245' : i === 2 ? '#f97316' : '#f59e0b';
        ctx.fill();
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = '#374151';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.strokeStyle = '#111827';
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- МЕХАНИЗМ 1: РАСТЯЖКА ---
  drawTripwireMechanism(ctx, w, h) {
    const isLockPhase = this.tripwire.subStage === 'SEAR_LOCK';

    ctx.fillStyle = '#333846';
    ctx.fillRect(20, 40, 40, h - 80);
    ctx.strokeStyle = '#4b5563';
    ctx.strokeRect(20, 40, 40, h - 80);

    ctx.beginPath();
    ctx.moveTo(60, h / 2 - 20);
    ctx.lineTo(110, h / 2);
    ctx.lineTo(60, h / 2 + 20);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.stroke();

    if (isLockPhase) {
      const trackX = 140;
      const trackW = w - 240;
      const trackY = h / 2;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(trackX, trackY - 24, trackW, 48);
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 2;
      ctx.strokeRect(trackX, trackY - 24, trackW, 48);

      const targetCenter = trackX + this.tripwire.searTargetX * trackW;
      const targetW = this.tripwire.searTargetWidth * trackW;
      const targetLeft = targetCenter - targetW / 2;

      const isAligned = this.tripwire.searAligned;

      ctx.fillStyle = isAligned ? 'rgba(34, 197, 94, 0.45)' : 'rgba(59, 130, 246, 0.28)';
      ctx.fillRect(targetLeft, trackY - 22, targetW, 44);
      ctx.strokeStyle = isAligned ? '#4ade80' : '#60a5fa';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(targetLeft, trackY - 22, targetW, 44);

      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillStyle = isAligned ? '#4ade80' : '#93c5fd';
      ctx.textAlign = 'center';
      ctx.fillText(isAligned ? 'ЖМИТЕ ПРОБЕЛ / КЛИК!' : 'ЩЕЛЬ ШЕПТАЛА', targetCenter, trackY - 28);

      const pinX = trackX + this.tripwire.searCurrentX * trackW;
      ctx.save();
      ctx.translate(pinX, trackY);

      ctx.beginPath();
      ctx.moveTo(-6, -30);
      ctx.lineTo(6, -30);
      ctx.lineTo(2, 20);
      ctx.lineTo(-2, 20);
      ctx.closePath();
      ctx.fillStyle = isAligned ? '#4ade80' : '#f3f4f6';
      ctx.fill();
      ctx.strokeStyle = isAligned ? '#22c55e' : '#9ca3af';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -36, 10, 0, Math.PI * 2);
      ctx.strokeStyle = isAligned ? '#4ade80' : '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

    } else {
      const wireY = h / 2;
      const isSevered = this.tripwire.wireSevered;

      if (!isSevered) {
        ctx.beginPath();
        ctx.moveTo(60, wireY);
        const waveAmp = (this.tripwire.tension / 100) * 10;
        const cpY = wireY + Math.sin(this.animTime * 14) * waveAmp;
        ctx.quadraticCurveTo(w / 2, cpY, w - 40, wireY);

        const inSafe = this.tripwire.tension >= this.tripwire.tensionSafeMin && this.tripwire.tension <= this.tripwire.tensionSafeMax;
        ctx.strokeStyle = inSafe ? '#4ade80' : '#ed4245';
        ctx.lineWidth = inSafe ? 3.5 : 2;
        ctx.stroke();

        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.fillStyle = inSafe ? '#4ade80' : '#f59e0b';
        ctx.textAlign = 'center';
        ctx.fillText(inSafe ? '✂️ МОМЕНТ ДЛЯ СРЕЗА! (КЛИК / ПРОБЕЛ)' : '⚠️ НАТЯЖЕНИЕ ВЫСОКОЕ (ЖДИТЕ СЛАБИНЫ)', w / 2, wireY - 26);

        ctx.save();
        ctx.translate(w / 2, wireY);
        ctx.beginPath();
        ctx.moveTo(-12, -18);
        ctx.lineTo(0, -4);
        ctx.lineTo(12, -18);
        ctx.strokeStyle = inSafe ? '#4ade80' : '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.moveTo(60, wireY);
        ctx.lineTo(w / 2 - 20, wireY + 25);
        ctx.moveTo(w - 40, wireY);
        ctx.lineTo(w / 2 + 20, wireY + 25);
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  // --- МЕХАНИЗМ 2: ШЕСТЕРНИ ---
  drawGearsMechanism(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2 + 25;
    const radius = 95;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.save();
    ctx.rotate(this.gears.angle);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.gears.wedgesInserted > 0 ? '#92400e' : '#78350f';
    ctx.fill();
    ctx.strokeStyle = this.gears.wedgesInserted > 0 ? '#f59e0b' : '#d97706';
    ctx.lineWidth = 4;
    ctx.stroke();

    const teeth = 12;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-8, -radius - 12, 16, 14);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-8, -radius - 12, 16, 14);
      ctx.restore();
    }

    this.gears.notches.forEach((notch) => {
      ctx.save();
      ctx.rotate(notch.angle);
      ctx.fillStyle = notch.jammed ? '#22c55e' : '#111827';
      ctx.beginPath();
      ctx.roundRect(-12, -radius - 2, 24, 26, 4);
      ctx.fill();
      ctx.strokeStyle = notch.jammed ? '#4ade80' : '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      if (notch.jammed) {
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(-8, -radius - 14, 16, 20);
      }
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#1e1f24';
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();

    // Верхний направляющий клин
    const wedgeY = -radius - 36 + this.gears.wedgeDropY * 26;
    ctx.save();
    ctx.translate(0, wedgeY);

    ctx.beginPath();
    ctx.moveTo(-10, -20);
    ctx.lineTo(10, -20);
    ctx.lineTo(4, 14);
    ctx.lineTo(-4, 14);
    ctx.closePath();
    ctx.fillStyle = '#f3f4f6';
    ctx.fill();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let k = 0; k < 4; k++) {
      ctx.moveTo(-8, -22 - k * 6);
      ctx.lineTo(8, -25 - k * 6);
    }
    ctx.stroke();

    ctx.restore();

    ctx.restore();
  }

  // --- МЕХАНИЗМ 3: ПЛИТА-ПРОТИВОВЕС (ПОЛНОСТЬЮ ПЕРЕРАБОТАННЫЙ ИНТЕРФЕЙС) ---
  drawPlateMechanism(ctx, w, h) {
    const cx = w / 2;

    // 1. Гранитная плита сверху
    const plateShiftY = (this.plate.weight - 50) * 0.45;
    const slabY = 46 + plateShiftY;

    ctx.fillStyle = '#374151';
    ctx.fillRect(cx - 150, slabY, 300, 22);
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 150, slabY, 300, 22);

    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'center';
    ctx.fillText('ГРАНИТНАЯ НАЖИМНАЯ ПЛИТА', cx, slabY + 15);

    // Выдвижные стопорные штифты в стенах (анимируются от 0% до 100%)
    const pinProgress = this.plate.stabilizeProgress / 100;
    const boltWidth = 32 * pinProgress;

    // Левый штифт
    ctx.fillStyle = pinProgress >= 1 ? '#22c55e' : '#f59e0b';
    ctx.fillRect(cx - 180, slabY + 3, boltWidth, 16);
    ctx.strokeStyle = '#d97706';
    ctx.strokeRect(cx - 180, slabY + 3, boltWidth, 16);

    // Правый штифт
    ctx.fillRect(cx + 180 - boltWidth, slabY + 3, boltWidth, 16);
    ctx.strokeRect(cx + 180 - boltWidth, slabY + 3, boltWidth, 16);

    // 2. Циферблат весов (индикатор равновесия)
    const dialX = cx - 35;
    const dialY = 210;
    const dialRadius = 66;

    // Базовый корпус циферблата
    ctx.beginPath();
    ctx.arc(dialX, dialY, dialRadius, Math.PI, 0);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Шкала 3 секторов:
    // Левый красный сектор (недобор веса: 0 .. safeMin)
    const startA = Math.PI;
    const safeMinA = Math.PI + (this.plate.safeMin / 100) * Math.PI;
    const safeMaxA = Math.PI + (this.plate.safeMax / 100) * Math.PI;
    const endA = Math.PI * 2;

    // Левый красный
    ctx.beginPath();
    ctx.arc(dialX, dialY, dialRadius - 4, startA, safeMinA);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Центральный яркий зелёный (РАВНОВЕСИЕ)
    ctx.beginPath();
    ctx.arc(dialX, dialY, dialRadius - 4, safeMinA, safeMaxA);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Правый красный (перевес)
    ctx.beginPath();
    ctx.arc(dialX, dialY, dialRadius - 4, safeMaxA, endA);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Подписи секторов на циферблате
    ctx.font = 'bold 9px "Segoe UI", sans-serif';
    ctx.fillStyle = '#f87171';
    ctx.textAlign = 'left';
    ctx.fillText('◄ НЕДОБОР', dialX - dialRadius + 4, dialY - 14);

    ctx.fillStyle = '#4ade80';
    ctx.textAlign = 'center';
    ctx.fillText('⚖ РАВНОВЕСИЕ', dialX, dialY - dialRadius + 14);

    ctx.fillStyle = '#f87171';
    ctx.textAlign = 'right';
    ctx.fillText('ПЕРЕВЕС ►', dialX + dialRadius - 4, dialY - 14);

    // Стрелка циферблата
    const needleAngle = Math.PI + (this.plate.weight / 100) * Math.PI;
    const inSafe = this.plate.weight >= this.plate.safeMin && this.plate.weight <= this.plate.safeMax;

    ctx.save();
    ctx.translate(dialX, dialY);
    ctx.rotate(needleAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(dialRadius - 8, 0);
    ctx.strokeStyle = inSafe ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(dialX, dialY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#d4af37';
    ctx.fill();

    // 3. Мешок с песком и чаша справа
    const pouchX = cx + 140;
    const pouchY = 145;

    // Мешочек
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(pouchX, pouchY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('ПЕСОК', pouchX, pouchY + 4);

    // Чаша противовеса снизу
    const cupY = 230 + (this.plate.weight - 50) * 0.2;
    ctx.beginPath();
    ctx.arc(pouchX, cupY, 26, 0, Math.PI);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // --- МЕХАНИЗМ 4: ЯДОВИТЫЙ РАСПЫЛИТЕЛЬ ---
  drawGasMechanism(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2 + 10;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 70, cy - 80, 140, 160);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 70, cy - 80, 140, 160);

    const vaporColor = this.gas.neutralizeProgress > 70 ? 'rgba(59, 130, 246, 0.45)' : 'rgba(34, 197, 94, 0.55)';
    ctx.fillStyle = vaporColor;
    ctx.fillRect(cx - 45, cy - 55, 90, 110);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 45, cy - 55, 90, 110);

    for (let i = 0; i < 4; i++) {
      const vx = cx + Math.sin(this.animTime * 3 + i) * 25;
      const vy = cy + Math.cos(this.animTime * 2 + i) * 35;
      ctx.beginPath();
      ctx.arc(vx, vy, 12 + Math.sin(this.animTime * 4 + i) * 4, 0, Math.PI * 2);
      ctx.fillStyle = this.gas.neutralizeProgress > 70 ? 'rgba(147, 197, 253, 0.35)' : 'rgba(74, 222, 128, 0.4)';
      ctx.fill();
    }

    // 2. Чёткий понятный манометр слева
    const gaugeX = cx - 130;
    const gaugeY = cy - 20;
    const gr = 42;

    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gr, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const startA = -Math.PI * 0.75;
    const totalA = Math.PI * 1.5;

    // Зелёный сектор (<38%)
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gr - 5, startA, startA + totalA * 0.38);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Жёлтый сектор (38..75%)
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gr - 5, startA + totalA * 0.38, startA + totalA * 0.75);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Красный сектор (75..100%)
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gr - 5, startA + totalA * 0.75, startA + totalA);
    ctx.strokeStyle = '#ed4245';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Стрелка манометра
    const gAngle = startA + (this.gas.pressure / 100) * totalA;
    ctx.save();
    ctx.translate(gaugeX, gaugeY);
    ctx.rotate(gAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(gr - 7, 0);
    ctx.strokeStyle = this.gas.pressure <= this.gas.safeZoneMax ? '#22c55e' : this.gas.pressure >= this.gas.dangerZoneMin ? '#ed4245' : '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText('МАНОМЕТР', gaugeX, gaugeY + gr + 14);

    // 3. Выпускной клапан справа
    const ventX = cx + 70;
    const ventY = cy - 20;

    ctx.fillStyle = '#475569';
    ctx.fillRect(ventX, ventY - 12, 35, 24);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(ventX, ventY - 12, 35, 24);

    // 4. Игла нейтрализатора слева
    const syringeX = cx - 70;
    const syringeY = cy + 40;

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(syringeX - 40, syringeY);
    ctx.lineTo(syringeX, syringeY);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // --- ЧАСТИЦЫ И ЭФФЕКТЫ ---
  spawnSparks(x, y, color = '#f59e0b', count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 2.5,
        life: 1.0,
        decay: 0.03 + Math.random() * 0.04
      });
    }
  }

  spawnSmoke(x, y, count = 25) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'smoke',
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: -1 - Math.random() * 2,
        color: 'rgba(100, 100, 100, 0.4)',
        size: 10 + Math.random() * 15,
        life: 1.0,
        decay: 0.02
      });
    }
  }

  spawnSteam(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'smoke',
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: 2 + Math.random() * 3,
        vy: -1 + (Math.random() - 0.5) * 2,
        color: 'rgba(220, 240, 255, 0.35)',
        size: 8 + Math.random() * 12,
        life: 0.8,
        decay: 0.03
      });
    }
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

  drawStatusBanner(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    ctx.fillRect(0, h - 34, w, 28);
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.fillStyle = this.statusMessage.includes('ДЕТОНАЦИЯ') ? '#ed4245' : this.statusMessage.includes('ОБЕЗВРЕЖЕН') ? '#22c55e' : '#f59e0b';
    ctx.textAlign = 'center';
    ctx.fillText(this.statusMessage, w / 2, h - 16);
    ctx.restore();
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.unbindEvents();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
