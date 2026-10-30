/**
 * Модуль мини-игры: Обезвреживание ловушки (Trap Disarming) v2
 * Полный редизайн: 4 аутентичных средневековых D&D механизма:
 * 1. 🏹 «Арбалетная растяжка (нить)» (sear pin block + tension snip)
 * 2. ⚙️ «Зубчатый часовой механизм (шестерня)» (clockwork escapement + stopper wedge)
 * 3. ⚖️ «Плита-противовес (давление и вес)» (Indiana Jones sand dosing equilibrium)
 * 4. 🧪 «Ядовитый распылитель (газ и давление)» (pulsing vapor venting + neutralizer)
 *
 * Единая система взвода бойка: 3 ошибки до детонации!
 */

import { audio } from '../audio.js';
import { dnd } from '../dnd-engine.js';

export const TRAP_CONFIGS = {
  tripwire: {
    id: 'tripwire',
    name: 'Арбалетная растяжка',
    icon: '🏹',
    subtitle: '1. Направьте штифт в шептало бойка -> 2. Перекусите струну при слабом натяжении',
    actionBtnText: 'Зафиксировать штифт (ПРОБЕЛ / ЛКМ)',
    actionBtnIcon: '🪡',
    guide1Key: 'Шептало',
    guide1Desc: 'Направьте курсор в мерцающий паз и удерживайте 1 сек',
    guide2Key: 'Нить',
    guide2Desc: 'После фиксации шептала срежьте нить в зелёной зоне',
    guide3Key: 'Боёк',
    guide3Desc: '3 срыва вызовут спуск самострела!'
  },
  gears: {
    id: 'gears',
    name: 'Зубчатый часовой механизм',
    icon: '⚙️',
    subtitle: 'Вбивайте стопорный клин точно в пазы вращающегося колеса (ПРОБЕЛ или КЛИК)',
    actionBtnText: 'Вбить стопорный клин (ПРОБЕЛ / КЛИК)',
    actionBtnIcon: '🔨',
    guide1Key: 'Тайминг',
    guide1Desc: 'Ждите момента совпадения открытого паза с клином',
    guide2Key: '2 паза',
    guide2Desc: 'Застопорите оба паза шестерни для полной остановки',
    guide3Key: 'Осечка',
    guide3Desc: 'Удар по зубьям ломает зацеп и взводит боёк!'
  },
  plate: {
    id: 'plate',
    name: 'Плита-противовес',
    icon: '⚖️',
    subtitle: 'Подсыпайте песок в чашу (зажмите ПРОБЕЛ / кнопку), удерживая стрелку в зоне равновесия',
    actionBtnText: 'Сыпать песок (Зажать ПРОБЕЛ / ЛКМ)',
    actionBtnIcon: '⏳',
    guide1Key: 'Дозирование',
    guide1Desc: 'Подсыпайте песок порциями, компенсируя утечку',
    guide2Key: 'Равновесие',
    guide2Desc: 'Удерживайте стрелку в зелёном секторе до 100%',
    guide3Key: 'Перекос',
    guide3Desc: 'Критический перевес или недовес взводит боёк!'
  },
  gas: {
    id: 'gas',
    name: 'Ядовитый распылитель',
    icon: '🧪',
    subtitle: 'Стравливайте избыточное давление и вводите нейтрализатор при безопасном давлении',
    actionBtnText: 'Впрыск нейтрализатора (Зажать ЛКМ / ПРОБЕЛ)',
    actionBtnIcon: '💉',
    guide1Key: 'Клапан',
    guide1Desc: 'Кнопка стравливания сбивает напор ядовитого пара',
    guide2Key: 'Безопасность',
    guide2Desc: 'Вводите нейтрализатор только при давлении < 50%',
    guide3Key: 'Выброс',
    guide3Desc: 'Впрыск на пике давления вызовет кислотный гидроудар!'
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

    // --- Состояния под-игр ---
    // 1. Растяжка
    this.tripwire = {
      subStage: 'SEAR_LOCK', // 'SEAR_LOCK' -> 'WIRE_SNIP'
      searProgress: 0,       // 0..100
      searTargetX: 0.5,
      searTargetWidth: 0.22,
      searCurrentX: 0.2,
      searAlignedDuration: 0,
      tension: 50,
      tensionPhase: 0,
      tensionSpeed: 1.5,
      tensionSafeMin: 38,
      tensionSafeMax: 62,
      wireSevered: false
    };

    // 2. Шестерни
    this.gears = {
      wedgesInserted: 0,
      wedgesRequired: 2,
      angle: 0,
      speed: 1.2,
      wedgeDropY: 0,
      wedgeStriking: false,
      notches: [
        { angle: 0, width: 0.38, jammed: false },
        { angle: Math.PI, width: 0.38, jammed: false }
      ],
      lastTickTooth: -1
    };

    // 3. Плита-противовес
    this.plate = {
      weight: 50,           // 0..100% (50 = идеал)
      safeMin: 40,
      safeMax: 60,
      stabilizeProgress: 0, // 0..100%
      drainRate: 18,
      pourRate: 42,
      dangerAccumulator: 0,
      sandGrains: []
    };

    // 4. Газовый распылитель
    this.gas = {
      pressure: 40,         // 0..100%
      pressurePhase: 0,
      pulseRate: 1.1,
      neutralizeProgress: 0,// 0..100%
      ventCooldown: 0,
      vaporMist: []
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

    // Влияние DC и бонуса на параметры ловушек:
    // 1. Растяжка: ширина зоны шептала и скорость колебания
    const searW = Math.max(0.12, Math.min(0.35, 0.22 + (this.bonus * 0.015) - ((this.dc - 15) * 0.01)));
    this.tripwire.searTargetWidth = searW;
    this.tripwire.tensionSpeed = Math.max(0.8, 1.4 + (this.dc - 15) * 0.08 - (this.bonus * 0.04));

    // 2. Шестерни: скорость вращения и ширина паза
    this.gears.speed = Math.max(0.7, 1.1 + (this.dc - 15) * 0.07 - (this.bonus * 0.035));
    const notchW = Math.max(0.24, Math.min(0.50, 0.38 + (this.bonus * 0.02) - ((this.dc - 15) * 0.015)));
    this.gears.notches.forEach(n => { n.width = notchW; });

    // 3. Плита: ширина зеленой зоны и скорость утечки
    const plateSpread = Math.max(7, Math.min(18, 10 + this.bonus * 0.8 - (this.dc - 15) * 0.6));
    this.plate.safeMin = 50 - plateSpread;
    this.plate.safeMax = 50 + plateSpread;
    this.plate.drainRate = Math.max(12, 18 + (this.dc - 15) * 0.8);

    // 4. Газ: скорость нарастания давления
    this.gas.pulseRate = Math.max(0.7, 1.0 + (this.dc - 15) * 0.06 - (this.bonus * 0.03));
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
    // 1. Растяжка
    this.tripwire.subStage = 'SEAR_LOCK';
    this.tripwire.searProgress = 0;
    this.tripwire.searCurrentX = 0.2;
    this.tripwire.searAlignedDuration = 0;
    this.tripwire.tension = 50;
    this.tripwire.wireSevered = false;

    // 2. Шестерни
    this.gears.wedgesInserted = 0;
    this.gears.wedgeDropY = 0;
    this.gears.wedgeStriking = false;
    this.gears.notches.forEach(n => { n.jammed = false; });

    // 3. Плита
    this.plate.weight = 50;
    this.plate.stabilizeProgress = 0;
    this.plate.dangerAccumulator = 0;
    this.plate.sandGrains = [];

    // 4. Газ
    this.gas.pressure = 35;
    this.gas.neutralizeProgress = 0;
    this.gas.ventCooldown = 0;
    this.gas.vaporMist = [];
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
                <button type="button" class="btn fantasy-btn secondary" id="btnTrapSecondary" style="min-width: 200px; padding: 12px 20px; font-weight: 700;">
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
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    if (this.trapType === 'tripwire' && this.tripwire.subStage === 'SEAR_LOCK') {
      this.tripwire.searCurrentX = x;
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
        // В режиме газа Пробел стравливает пар
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
        // Проверяем мгновенный замок штифта
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

  // --- ЛОГИКА ОШИБОК И ВЗВОДА БОЙКА (3 ЩЕЛЧКА) ---
  advanceStriker(reason = '') {
    if (this.isDisarmed || this.isDetonated) return;

    this.strikerStage = Math.min(3, this.strikerStage + 1);
    this.shakeAmount = 7 * this.strikerStage;
    this.statusMessage = reason || `Щёлк! Боёк сдвинулся (${this.strikerStage}/3)`;
    this.statusTimer = 2.0;

    audio.playStrikerStep(this.strikerStage);
    this.spawnSparks(this.logicalWidth / 2, this.logicalHeight / 2, '#f97316', 25 * this.strikerStage);

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
    this.shakeAmount = 26;
    audio.playExplosion();
    this.spawnSparks(this.logicalWidth / 2, this.logicalHeight / 2, '#ef4444', 60);
    this.spawnSmoke(this.logicalWidth / 2, this.logicalHeight / 2, 40);

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
    this.spawnSparks(this.logicalWidth / 2, this.logicalHeight / 2, '#22c55e', 45);
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
      this.advanceStriker('Штифт соскочил мимо шептала бойка!');
    }
  }

  finishSearLock() {
    audio.playSearClick();
    this.tripwire.subStage = 'WIRE_SNIP';
    this.statusMessage = '🛡️ Шептало бойка заблокировано! Теперь срежьте нить кусачками.';
    this.statusTimer = 2.5;

    if (this.trapActionIcon) this.trapActionIcon.textContent = '✂️';
    if (this.trapActionText) this.trapActionText.textContent = 'Срезать нить кусачками (ПРОБЕЛ / КЛИК)';
    this.updateHUD();
  }

  snipTripwire() {
    const t = this.tripwire.tension;
    if (t >= this.tripwire.tensionSafeMin && t <= this.tripwire.tensionSafeMax) {
      // Идеальный срез
      this.tripwire.wireSevered = true;
      audio.playWireCut(false);
      this.triggerVictory();
    } else {
      // Срез при натяжении
      audio.playWireCut(true);
      this.advanceStriker('Нить лопнула при сильном натяжении, ударив по вторичному взводу!');
      if (!this.isDetonated) {
        this.tripwire.wireSevered = true;
        this.triggerVictory();
      }
    }
  }

  // --- ПОД-ИГРА 2: ЧАСОВОЙ МЕХАНИЗМ ---
  strikeGearWedge() {
    this.gears.wedgeStriking = true;
    this.gears.wedgeDropY = 0;

    // Проверяем попадание клина в один из пазов
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
      this.spawnSparks(this.logicalWidth / 2, this.logicalHeight * 0.38, '#22c55e', 30);

      if (this.gears.wedgesInserted >= this.gears.wedgesRequired) {
        this.triggerVictory();
      } else {
        this.gears.speed *= 0.6; // Замедление после первого клина
        this.statusMessage = '⚙️ Первый клин забит! Застопорите второй паз!';
        this.statusTimer = 2.0;
        this.updateHUD();
      }
    } else {
      audio.playGearGrind();
      this.spawnSparks(this.logicalWidth / 2, this.logicalHeight * 0.38, '#f59e0b', 20);
      this.advanceStriker('Клин отскочил от зубьев шестерни!');
    }
  }

  // --- ПОД-ИГРА 3: ПЛИТА-ПРОТИВОВЕС ---
  updatePlate(dt) {
    if (this.isDisarmed || this.isDetonated) return;

    if (this.isHoldingAction) {
      // Сыплем песок
      this.plate.weight = Math.min(100, this.plate.weight + this.plate.pourRate * dt);
      audio.playSandPour();
      this.spawnSandGrains();
    } else {
      // Утечка песка
      this.plate.weight = Math.max(0, this.plate.weight - this.plate.drainRate * dt);
    }

    // Проверка зоны равновесия
    const inSafe = this.plate.weight >= this.plate.safeMin && this.plate.weight <= this.plate.safeMax;

    if (inSafe) {
      this.plate.stabilizeProgress = Math.min(100, this.plate.stabilizeProgress + 26 * dt);
      this.plate.dangerAccumulator = Math.max(0, this.plate.dangerAccumulator - dt * 2);
      audio.playBalanceChime();

      if (this.plate.stabilizeProgress >= 100) {
        this.triggerVictory();
      }
    } else {
      this.plate.dangerAccumulator += dt;
      audio.playStoneGrind();

      if (this.plate.dangerAccumulator >= 1.2) {
        this.plate.dangerAccumulator = 0;
        this.advanceStriker('Плита опасно перекосилась от дисбаланса!');
      }
    }

    this.updateHUD();
  }

  spawnSandGrains() {
    const cx = this.logicalWidth * 0.72;
    const cy = this.logicalHeight * 0.32;
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        type: 'sand',
        x: cx + (Math.random() - 0.5) * 8,
        y: cy + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 2 + Math.random() * 3,
        color: '#d97706',
        size: 2 + Math.random() * 1.5,
        life: 0.6,
        decay: 0.04
      });
    }
  }

  // --- ПОД-ИГРА 4: ЯДОВИТЫЙ РАСПЫЛИТЕЛЬ ---
  ventGasPressure() {
    if (this.gas.ventCooldown > 0) return;
    this.gas.ventCooldown = 1.0;
    audio.playSteamHiss(0.3);

    // Если стравили на опасном пике (> 85%), возможен срыв клапана
    if (this.gas.pressure > 85) {
      this.advanceStriker('Клапан сорвало избыточным гидроударом!');
    }

    this.gas.pressure = Math.max(15, this.gas.pressure - 32);
    this.spawnSteam(this.logicalWidth * 0.8, this.logicalHeight * 0.42, 20);
    this.statusMessage = '💨 Давление в цилиндре безопасно сброшено!';
    this.statusTimer = 1.5;
    this.updateHUD();
  }

  updateGas(dt) {
    if (this.isDisarmed || this.isDetonated) return;

    if (this.gas.ventCooldown > 0) {
      this.gas.ventCooldown = Math.max(0, this.gas.ventCooldown - dt);
    }

    // Синусоидальное нарастание давления
    this.gas.pressurePhase += this.gas.pulseRate * dt;
    const wave = (Math.sin(this.gas.pressurePhase) + 1) * 0.5; // 0..1
    const baseTarget = 30 + wave * 55; // 30..85%
    this.gas.pressure += (baseTarget - this.gas.pressure) * 0.08;

    // Введение нейтрализатора
    if (this.isHoldingAction) {
      if (this.gas.pressure < 52) {
        // Безопасный впрыск
        this.gas.neutralizeProgress = Math.min(100, this.gas.neutralizeProgress + 24 * dt);
        audio.playChemicalFizz();
        audio.playNeedleInsert();

        if (this.gas.neutralizeProgress >= 100) {
          this.triggerVictory();
        }
      } else {
        // Впрыск при опасном давлении
        this.advanceStriker('Токсичный выброс при попытке впрыска под высоким давлением!');
        this.isHoldingAction = false;
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
        const p = Math.round(this.tripwire.searProgress);
        this.trapHudLabel.textContent = 'Блокировка шептала бойка:';
        this.trapHudValue.textContent = `${p}% ${p >= 100 ? '(Заблокировано)' : '(Удерживайте штифт в щели)'}`;
        this.trapHudValue.style.color = p >= 100 ? '#22c55e' : '#f59e0b';
        this.trapProgressFill.style.width = `${p}%`;
      } else {
        const t = Math.round(this.tripwire.tension);
        const inSafe = t >= this.tripwire.tensionSafeMin && t <= this.tripwire.tensionSafeMax;
        this.trapHudLabel.textContent = 'Натяжение спусковой нити:';
        this.trapHudValue.textContent = `${t}% ${inSafe ? '(Безопасный момент для среза!)' : '(Опасно высокое натяжение)'}`;
        this.trapHudValue.style.color = inSafe ? '#22c55e' : '#f59e0b';
        this.trapProgressFill.style.width = `${t}%`;
      }
    } else if (this.trapType === 'gears') {
      const ins = this.gears.wedgesInserted;
      const req = this.gears.wedgesRequired;
      this.trapHudLabel.textContent = 'Стопорные клинья в шестерне:';
      this.trapHudValue.textContent = `${ins} из ${req} ${ins >= req ? '(Остановлено)' : '(Ловите пазы)'}`;
      this.trapHudValue.style.color = ins > 0 ? '#22c55e' : '#f59e0b';
      this.trapProgressFill.style.width = `${(ins / req) * 100}%`;
    } else if (this.trapType === 'plate') {
      const p = Math.round(this.plate.stabilizeProgress);
      const w = Math.round(this.plate.weight);
      const inSafe = w >= this.plate.safeMin && w <= this.plate.safeMax;
      this.trapHudLabel.textContent = `Стабилизация плиты (${w}% веса):`;
      this.trapHudValue.textContent = `${p}% ${inSafe ? '(В равновесии)' : '(Перекос!)'}`;
      this.trapHudValue.style.color = inSafe ? '#22c55e' : '#ed4245';
      this.trapProgressFill.style.width = `${p}%`;
    } else if (this.trapType === 'gas') {
      const p = Math.round(this.gas.pressure);
      const neut = Math.round(this.gas.neutralizeProgress);
      const isSafe = p < 52;
      this.trapHudLabel.textContent = `Давление: ${p}% | Нейтрализация:`;
      this.trapHudValue.textContent = `${neut}% ${isSafe ? '(Безопасное окно для впрыска)' : '(Высокое давление! Сбросьте пар)'}`;
      this.trapHudValue.style.color = isSafe ? '#22c55e' : '#f59e0b';
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
      this.shakeAmount *= 0.9;
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

    // Логика под-игры 1 (Растяжка)
    if (this.trapType === 'tripwire') {
      if (this.tripwire.subStage === 'SEAR_LOCK') {
        // Микро-колебание цели
        this.tripwire.searTargetX = 0.5 + Math.sin(this.animTime * 1.8) * 0.18;
        const diff = Math.abs(this.tripwire.searCurrentX - this.tripwire.searTargetX);
        const inZone = diff <= this.tripwire.searTargetWidth / 2;

        if (inZone) {
          this.tripwire.searProgress = Math.min(100, this.tripwire.searProgress + 65 * dt);
          if (this.tripwire.searProgress >= 100) {
            this.finishSearLock();
          }
        } else {
          this.tripwire.searProgress = Math.max(0, this.tripwire.searProgress - 40 * dt);
        }
        this.updateHUD();
      } else {
        // Колебание натяжения
        this.tripwire.tensionPhase += this.tripwire.tensionSpeed * dt;
        this.tripwire.tension = 50 + Math.sin(this.tripwire.tensionPhase) * 35;
        this.updateHUD();
      }
    }

    // Логика под-игры 2 (Шестерни)
    if (this.trapType === 'gears') {
      this.gears.angle += this.gears.speed * dt;

      // Звук тиканья шестерен
      const toothIdx = Math.floor((this.gears.angle / (Math.PI * 2)) * 12);
      if (toothIdx !== this.gears.lastTickTooth) {
        this.gears.lastTickTooth = toothIdx;
        audio.playGearTick(1.0 + (toothIdx % 2) * 0.2);
      }

      // Анимация удара клина
      if (this.gears.wedgeStriking) {
        this.gears.wedgeDropY += dt * 4;
        if (this.gears.wedgeDropY >= 1) {
          this.gears.wedgeStriking = false;
          this.gears.wedgeDropY = 0;
        }
      }
    }

    // Логика под-игры 3 (Плита)
    if (this.trapType === 'plate') {
      this.updatePlate(dt);
    }

    // Логика под-игры 4 (Газ)
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

    // 1. Каменный каркас подземелья
    this.drawChassis(ctx, w, h);

    // 2. Отрисовка конкретного механизма
    if (this.trapType === 'tripwire') {
      this.drawTripwireMechanism(ctx, w, h);
    } else if (this.trapType === 'gears') {
      this.drawGearsMechanism(ctx, w, h);
    } else if (this.trapType === 'plate') {
      this.drawPlateMechanism(ctx, w, h);
    } else if (this.trapType === 'gas') {
      this.drawGasMechanism(ctx, w, h);
    }

    // 3. Частицы
    this.drawParticles(ctx);

    // 4. Индикатор взвода бойка на механизме
    this.drawStrikerRatchet(ctx, w - 85, 45);

    // 5. Всплывающее уведомление/статус
    if (this.statusMessage) {
      this.drawStatusBanner(ctx, w, h);
    }

    ctx.restore();
  }

  drawChassis(ctx, w, h) {
    // Темная кладка камня
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#15171e');
    grad.addColorStop(1, '#0b0c10');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Кованая бронзовая рамка с заклепками
    ctx.strokeStyle = '#2d323f';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, w - 6, h - 6);

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.strokeRect(7, 7, w - 14, h - 14);

    // Угловые заклепки
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
    // Компактный индикатор взвода бойка
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

    // 3 пина взвода
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

    // Железная рама самострела слева
    ctx.fillStyle = '#333846';
    ctx.fillRect(20, 40, 40, h - 80);
    ctx.strokeStyle = '#4b5563';
    ctx.strokeRect(20, 40, 40, h - 80);

    // Спусковой рычаг и пружина
    ctx.beginPath();
    ctx.moveTo(60, h / 2 - 20);
    ctx.lineTo(110, h / 2);
    ctx.lineTo(60, h / 2 + 20);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.stroke();

    if (isLockPhase) {
      // Фаза 1: Блокировка шептала
      const trackX = 140;
      const trackW = w - 240;
      const trackY = h / 2;

      // Направляющая щель шептала
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(trackX, trackY - 24, trackW, 48);
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 2;
      ctx.strokeRect(trackX, trackY - 24, trackW, 48);

      // Целевой паз (Sear Target)
      const targetCenter = trackX + this.tripwire.searTargetX * trackW;
      const targetW = this.tripwire.searTargetWidth * trackW;
      const targetLeft = targetCenter - targetW / 2;

      ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
      ctx.fillRect(targetLeft, trackY - 22, targetW, 44);
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.strokeRect(targetLeft, trackY - 22, targetW, 44);

      // Подпись паза
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillStyle = '#93c5fd';
      ctx.textAlign = 'center';
      ctx.fillText('ЩЕЛЬ ШЕПТАЛА', targetCenter, trackY - 28);

      // Штифт игрока
      const pinX = trackX + this.tripwire.searCurrentX * trackW;
      ctx.save();
      ctx.translate(pinX, trackY);

      // Конусный стальной штифт
      ctx.beginPath();
      ctx.moveTo(-6, -30);
      ctx.lineTo(6, -30);
      ctx.lineTo(2, 20);
      ctx.lineTo(-2, 20);
      ctx.closePath();
      ctx.fillStyle = '#f3f4f6';
      ctx.fill();
      ctx.strokeStyle = '#9ca3af';
      ctx.stroke();

      // Кольцо захвата штифта
      ctx.beginPath();
      ctx.arc(0, -36, 10, 0, Math.PI * 2);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Прогресс фиксации
      if (this.tripwire.searProgress > 0) {
        ctx.beginPath();
        ctx.arc(0, -36, 10, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * (this.tripwire.searProgress / 100)));
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 4;
        ctx.stroke();
      }
      ctx.restore();

    } else {
      // Фаза 2: Срез нити
      const wireY = h / 2;
      const isSevered = this.tripwire.wireSevered;

      if (!isSevered) {
        // Натянутая колеблющаяся стальная струна
        ctx.beginPath();
        ctx.moveTo(60, wireY);
        const waveAmp = (this.tripwire.tension / 100) * 8;
        const cpY = wireY + Math.sin(this.animTime * 12) * waveAmp;
        ctx.quadraticCurveTo(w / 2, cpY, w - 40, wireY);

        ctx.strokeStyle = this.tripwire.tension > 62 ? '#ed4245' : '#e5e7eb';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Световой индикатор безопасной зоны на струне
        const inSafe = this.tripwire.tension >= this.tripwire.tensionSafeMin && this.tripwire.tension <= this.tripwire.tensionSafeMax;
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.fillStyle = inSafe ? '#22c55e' : '#f59e0b';
        ctx.textAlign = 'center';
        ctx.fillText(inSafe ? '✂️ МОМЕНТ ДЛЯ СРЕЗА!' : '⚠️ СТРУНА НАТЯНУТА', w / 2, wireY - 24);

        // Кусачки над струной
        ctx.save();
        ctx.translate(w / 2, wireY);
        ctx.beginPath();
        ctx.moveTo(-12, -18);
        ctx.lineTo(0, -4);
        ctx.lineTo(12, -18);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      } else {
        // Перекусанная струна
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

    // 1. Центральное колесо храповика
    ctx.save();
    ctx.rotate(this.gears.angle);

    // Тело шестерни
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#78350f';
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Зубья (12 штук)
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

    // 2 стопорных паза
    this.gears.notches.forEach((notch) => {
      ctx.save();
      ctx.rotate(notch.angle);
      // Вырез паза
      ctx.fillStyle = notch.jammed ? '#22c55e' : '#111827';
      ctx.beginPath();
      ctx.roundRect(-12, -radius - 2, 24, 26, 4);
      ctx.fill();
      ctx.strokeStyle = notch.jammed ? '#4ade80' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (notch.jammed) {
        // Торчащий клин
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(-8, -radius - 14, 16, 20);
      }
      ctx.restore();
    });

    // Центральная ступица шестерни
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#1e1f24';
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore(); // Сброс вращения шестерни

    // 2. Верхний стопорный клин (падёт вниз при клике)
    const wedgeY = -radius - 36 + this.gears.wedgeDropY * 26;
    ctx.save();
    ctx.translate(0, wedgeY);

    // Стальной клин
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

    // Пружина над клином
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

  // --- МЕХАНИЗМ 3: ПЛИТА-ПРОТИВОВЕС ---
  drawPlateMechanism(ctx, w, h) {
    const cx = w / 2;

    // 1. Каменная нажимная плита
    const plateShiftY = (this.plate.weight - 50) * 0.45;
    const slabY = 55 + plateShiftY;

    ctx.fillStyle = '#374151';
    ctx.fillRect(cx - 160, slabY, 320, 24);
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 160, slabY, 320, 24);

    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'center';
    ctx.fillText('ГРАНИТНАЯ НАЖИМНАЯ ПЛИТА', cx, slabY + 16);

    // Пружины под плитой
    [-110, 0, 110].forEach(ox => {
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + ox, slabY + 24);
      ctx.lineTo(cx + ox, 105);
      ctx.stroke();
    });

    // 2. Стрелочный циферблат равновесия
    const dialY = 210;
    const dialRadius = 65;

    ctx.beginPath();
    ctx.arc(cx, dialY, dialRadius, Math.PI, 0);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Зелёный сектор равновесия
    const angleMin = Math.PI + (this.plate.safeMin / 100) * Math.PI;
    const angleMax = Math.PI + (this.plate.safeMax / 100) * Math.PI;

    ctx.beginPath();
    ctx.arc(cx, dialY, dialRadius - 4, angleMin, angleMax);
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.45)';
    ctx.stroke();

    // Стрелка циферблата
    const needleAngle = Math.PI + (this.plate.weight / 100) * Math.PI;
    ctx.save();
    ctx.translate(cx, dialY);
    ctx.rotate(needleAngle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(dialRadius - 10, 0);
    ctx.strokeStyle = this.plate.weight >= this.plate.safeMin && this.plate.weight <= this.plate.safeMax ? '#22c55e' : '#ed4245';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Центр стрелки
    ctx.beginPath();
    ctx.arc(cx, dialY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#d4af37';
    ctx.fill();

    // 3. Кожаный мешок с песком и чаша противовеса
    const pouchX = cx + 150;
    const pouchY = 160;

    // Мешок
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(pouchX, pouchY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    // Чаша противовеса снизу
    ctx.beginPath();
    ctx.arc(pouchX, pouchY + 70, 24, 0, Math.PI);
    ctx.fillStyle = '#4b5563';
    ctx.fill();
    ctx.strokeStyle = '#9ca3af';
    ctx.stroke();
  }

  // --- МЕХАНИЗМ 4: ЯДОВИТЫЙ РАСПЫЛИТЕЛЬ ---
  drawGasMechanism(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2 + 10;

    // 1. Бронзовый корпус распылителя
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 70, cy - 80, 140, 160);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 70, cy - 80, 140, 160);

    // Стеклянная смотровая колба в центре
    const vaporColor = this.gas.neutralizeProgress > 70 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(34, 197, 94, 0.5)';
    ctx.fillStyle = vaporColor;
    ctx.fillRect(cx - 45, cy - 55, 90, 110);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 45, cy - 55, 90, 110);

    // Вихри пара внутри
    for (let i = 0; i < 4; i++) {
      const vx = cx + Math.sin(this.animTime * 3 + i) * 25;
      const vy = cy + Math.cos(this.animTime * 2 + i) * 35;
      ctx.beginPath();
      ctx.arc(vx, vy, 12 + Math.sin(this.animTime * 4 + i) * 4, 0, Math.PI * 2);
      ctx.fillStyle = this.gas.neutralizeProgress > 70 ? 'rgba(147, 197, 253, 0.3)' : 'rgba(74, 222, 128, 0.35)';
      ctx.fill();
    }

    // 2. Манометр давления слева
    const gaugeX = cx - 130;
    const gaugeY = cy - 20;
    const gr = 38;

    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gr, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Красная зона давления
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gr - 4, -Math.PI / 4, Math.PI / 4);
    ctx.strokeStyle = '#ed4245';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Стрелка манометра
    const gAngle = -Math.PI * 0.75 + (this.gas.pressure / 100) * (Math.PI * 1.5);
    ctx.save();
    ctx.translate(gaugeX, gaugeY);
    ctx.rotate(gAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(gr - 8, 0);
    ctx.strokeStyle = this.gas.pressure > 75 ? '#ed4245' : '#f59e0b';
    ctx.lineWidth = 2.5;
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

    // 4. Игла нейтрализатора слева/снизу
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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
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
