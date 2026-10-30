/**
 * Модуль мини-игры: Магические руны (Arcane Runes: Arcane Circuit)
 * Древняя арканная печать со свободной процедурной генерацией магических элементов:
 * - Астральные Призмы (преломление и трансмутация спектров маны)
 * - Фазовые Порталы (мгновенная пространственная телепортация луча)
 * - Руны Резонанса (сверхзарядка и усиление маны)
 * - Глифы Энтропии (некротические ловушки, пожирающие ману)
 * - Дуговые и развилочные каналы-желоба
 * - Кинематическая/эфирная сцепка колец (Resonance Coupling)
 * - Шкала Эфирной Нестабильности (Arcane Instability Meter)
 * - Процедурный генератор головоломки с гарантией проходимости
 */

import { audio } from '../audio.js';
import { dnd } from '../dnd-engine.js';

// Типы элементов на секторах рунических колец
export const NODE_TYPES = {
  EMPTY: 'empty',          // Пустой сектор (рассеивание)
  STRAIGHT: 'straight',    // Прямой радиальный проводник
  TURN_CW: 'turn_cw',      // Дуговой мост по часовой стрелке (+45°)
  TURN_CCW: 'turn_ccw',    // Дуговой мост против часовой стрелки (-45°)
  FORK: 'fork',            // Развилка (прямо + вправо на 45°)
  PRISM: 'prism',          // Астральная Призма (меняет стихийный спектр)
  PORTAL: 'portal',        // Фазовый Разлом (мгновенный прыжок луча)
  RESONATOR: 'resonator',  // Руна Резонанса (наделяет луч сверхзарядом)
  ENTROPY: 'entropy'       // Глиф Энтропии (тёмная руна, нагнетающая нестабильность)
};

// Спектры маны
export const SPECTRA = {
  RAW: { id: 'RAW', name: 'Сырая мана', icon: '✧', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.7)' },
  FIRE: { id: 'FIRE', name: 'Огненный эфир', icon: '🔥', color: '#f97316', glow: 'rgba(249, 115, 22, 0.7)' },
  WATER: { id: 'WATER', name: 'Ледяной исток', icon: '💧', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.7)' },
  AIR: { id: 'AIR', name: 'Грозовой заряд', icon: '⚡', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.7)' },
  EARTH: { id: 'EARTH', name: 'Земной резонанс', icon: '🌿', color: '#10b981', glow: 'rgba(16, 185, 129, 0.7)' }
};

// Символы Старшей Футарки для аутентичной гравировки
const RUNIC_ALPHABET = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'];

export class RunesGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;

    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;

    // Состояние печати
    this.rings = [];
    this.anchors = [];
    this.selectedRingIndex = 0;
    this.isSolved = false;
    this.isFailed = false;
    this.mistakes = 0;

    // Шкала эфирной нестабильности (0..100%)
    this.instability = 0;
    this.activeBeams = [];
    this.particles = [];
    this.manaFlowTime = 0;
    this.activeEntropyHit = false;

    // Способность "Арканный фокус" (стабилизация маны)
    this.focusCooldown = 0;
    this.focusMaxCooldown = 18;

    // Взаимодействие
    this.draggedRing = null;
    this.dragStartAngle = 0;
    this.ringInitialAngle = 0;

    // Время для расчета исхода
    this.startTime = Date.now();

    // Привязанные события
    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundResize = this.setupCanvas.bind(this);
  }

  init() {
    this.renderDOM();
    this.setupCanvas();
    this.bindEvents();
    this.generateRunePuzzle();
    this.startAnimationLoop();
  }

  renderDOM() {
    this.container.innerHTML = `
      <div class="stage-container runes-stage">
        <div class="stage-header">
          <h2 class="stage-title">🔮 Магические руны: Арканная Цепь</h2>
          <p class="stage-subtitle">Направьте живой поток маны из центрального ядра к стихийным алтарям, используя призмы, порталы и руны резонанса.</p>
        </div>

        <div class="runes-layout">
          <!-- Холст арканного диска -->
          <div class="runes-canvas-wrapper">
            <canvas id="runesCanvas" class="game-canvas"></canvas>
          </div>

          <!-- Панель управления и статус печати -->
          <div class="runes-controls-panel">
            <!-- Шкала эфирной нестабильности -->
            <div class="instability-hud-card">
              <div class="hud-header-row">
                <span class="hud-label">⚡ Эфирная нестабильность:</span>
                <span class="instability-value" id="instabilityValue">0%</span>
              </div>
              <div class="instability-bar-track">
                <div class="instability-bar-fill" id="instabilityBarFill"></div>
              </div>
              <div class="instability-warning-text" id="instabilityWarn">Печать стабильна</div>
            </div>

            <!-- Способность персонажа: Арканный фокус -->
            <button type="button" class="btn fantasy-btn secondary focus-btn" id="btnArcaneFocus">
              <span>✦</span> Арканная стабилизация
            </button>

            <!-- Селектор колец -->
            <div class="ring-selector-hud">
              <span class="hud-label">Выбор кольца печати:</span>
              <div class="ring-buttons" id="ringSelectorBtns"></div>
            </div>

            <div class="ring-turn-actions">
              <button type="button" class="btn fantasy-btn secondary turn-btn" id="btnRotateCCW">
                <span>↺</span> Влево (45°)
              </button>
              <button type="button" class="btn fantasy-btn primary turn-btn" id="btnRotateCW">
                <span>↻</span> Вправо (45°)
              </button>
            </div>

            <!-- Статус стихийных якорей -->
            <div class="anchors-status-card" id="anchorsStatusBox">
              <div class="hud-header-row" style="margin-bottom: 6px;">
                <span class="anchors-title">Стихийные алтари печати:</span>
                <span class="anchors-count-badge" id="anchorsCountBadge">0 / 0</span>
              </div>
              <div class="anchors-list" id="anchorsList"></div>
            </div>
          </div>
        </div>

        <div class="lock-controls-guide" style="margin-top: 14px;">
          <div class="guide-pill">
            <span class="guide-key">1, 2, 3, 4</span>
            <span>Выбор кольца</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">A / D или ← / →</span>
            <span>Поворот кольца</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">Пробел</span>
            <span>Стабилизация маны</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">ЛКМ перетаскивание</span>
            <span>Плавное вращение</span>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#runesCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.ringSelectorBtns = this.container.querySelector('#ringSelectorBtns');
    this.anchorsList = this.container.querySelector('#anchorsList');
    this.anchorsCountBadge = this.container.querySelector('#anchorsCountBadge');
    this.btnRotateCCW = this.container.querySelector('#btnRotateCCW');
    this.btnRotateCW = this.container.querySelector('#btnRotateCW');
    this.btnArcaneFocus = this.container.querySelector('#btnArcaneFocus');
    this.instabilityValue = this.container.querySelector('#instabilityValue');
    this.instabilityBarFill = this.container.querySelector('#instabilityBarFill');
    this.instabilityWarn = this.container.querySelector('#instabilityWarn');
  }

  setupCanvas() {
    if (!this.canvas) return;
    const size = Math.min(480, Math.min(window.innerWidth - 48, 480));
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.logicalSize = size;
  }

  bindEvents() {
    this.canvas.addEventListener('pointerdown', this.boundPointerDown);
    window.addEventListener('pointermove', this.boundPointerMove);
    window.addEventListener('pointerup', this.boundPointerUp);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('resize', this.boundResize);

    if (this.btnRotateCCW) {
      this.btnRotateCCW.addEventListener('click', () => this.rotateSelectedRing(-45));
    }
    if (this.btnRotateCW) {
      this.btnRotateCW.addEventListener('click', () => this.rotateSelectedRing(45));
    }
    if (this.btnArcaneFocus) {
      this.btnArcaneFocus.addEventListener('click', () => this.activateArcaneFocus());
    }
  }

  onKeyDown(e) {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.rotateSelectedRing(-45);
      e.preventDefault();
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.rotateSelectedRing(45);
      e.preventDefault();
    } else if (e.code === 'Digit1') {
      this.selectRing(0);
      e.preventDefault();
    } else if (e.code === 'Digit2') {
      this.selectRing(1);
      e.preventDefault();
    } else if (e.code === 'Digit3') {
      this.selectRing(2);
      e.preventDefault();
    } else if (e.code === 'Digit4') {
      this.selectRing(3);
      e.preventDefault();
    } else if (e.code === 'Space') {
      this.activateArcaneFocus();
      e.preventDefault();
    }
  }

  selectRing(idx) {
    if (idx >= 0 && idx < this.rings.length) {
      this.selectedRingIndex = idx;
      this.updateRingSelectionUI();
      audio.playTumblerClick(1.2);
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
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('resize', this.boundResize);
  }

  // =========================================================================
  // --- ПРОЦЕДУРНЫЙ ГЕНЕРАТОР ГОЛОВОЛОМКИ (С ГАРАНТИЕЙ РЕШАЕМОСТИ) ---
  // =========================================================================
  generateRunePuzzle() {
    this.isSolved = false;
    this.isFailed = false;
    this.particles = [];
    this.selectedRingIndex = 0;
    this.instability = 0;
    this.mistakes = 0;
    this.startTime = Date.now();
    this.focusCooldown = 0;

    const dc = dnd.dc || 15;

    // Число колец: 2..4 в зависимости от сложности
    const numRings = dc <= 13 ? 2 : dc <= 19 ? 3 : 4;

    // Все 4 стихийных якоря на внешнем периметре (сектора 0, 2, 4, 6 -> 0°, 90°, 180°, 270°)
    const allAnchors = [
      { sector: 0, angle: 0, rune: '🔥', name: 'Алтарь Огня', defaultColor: '#ef4444', targetSpectrum: 'FIRE', connected: false, requiresOvercharge: false },
      { sector: 2, angle: 90, rune: '💧', name: 'Алтарь Вод', defaultColor: '#06b6d4', targetSpectrum: 'WATER', connected: false, requiresOvercharge: false },
      { sector: 4, angle: 180, rune: '🌿', name: 'Алтарь Земли', defaultColor: '#10b981', targetSpectrum: 'EARTH', connected: false, requiresOvercharge: false },
      { sector: 6, angle: 270, rune: '⚡', name: 'Алтарь Бури', defaultColor: '#f59e0b', targetSpectrum: 'AIR', connected: false, requiresOvercharge: false }
    ];

    // Число активных якорей в задаче (от 2 до 4)
    const activeCount = dc <= 12 ? 2 : dc <= 17 ? 3 : 4;
    // Перемешиваем и берем activeCount
    const shuffledAnchors = [...allAnchors].sort(() => Math.random() - 0.5);
    this.anchors = shuffledAnchors.slice(0, activeCount).sort((a, b) => a.sector - b.sector);

    // Дополнительные требования к алтарям при высокой сложности
    this.anchors.forEach(a => {
      // С шансом 35% алтарь требует сверхрезонанс (Resonator)
      if (dc >= 18 && Math.random() > 0.4) {
        a.requiresOvercharge = true;
      }
    });

    // Создаем структуру колец
    this.rings = [];
    const baseRadius = 52;
    const ringThickness = numRings === 4 ? 36 : numRings === 3 ? 42 : 48;

    for (let r = 0; r < numRings; r++) {
      const innerR = baseRadius + r * ringThickness;
      const outerR = innerR + ringThickness - 3;
      const midR = (innerR + outerR) / 2;

      // 8 секторов: изначально пустые
      const sectors = Array.from({ length: 8 }, () => ({
        type: NODE_TYPES.EMPTY,
        spectrum: null,
        portalId: null,
        isOvercharged: false
      }));

      // Случайные руны для эстетики
      const runes = Array.from({ length: 8 }, (_, i) => RUNIC_ALPHABET[(r * 7 + i * 3) % RUNIC_ALPHABET.length]);

      this.rings.push({
        index: r,
        name: r === 0 ? 'Внутреннее' : r === 1 ? 'Среднее' : r === 2 ? (numRings === 3 ? 'Внешнее' : 'Эфирное') : 'Внешнее',
        innerR,
        outerR,
        midR,
        angle: 0,
        currentAngle: 0,
        sectors,
        runes,
        coupledRing: null,
        coupledRatio: 0
      });
    }

    // --- ПОСТРОЕНИЕ ГАРАНТИРОВАННОГО РЕШЕНИЯ ---
    // Центральное ядро испускает ману из секторов: 0, 2, 4, 6
    const coreEmitters = [0, 2, 4, 6].sort(() => Math.random() - 0.5);

    this.anchors.forEach((anchor, aIdx) => {
      let currentSector = coreEmitters[aIdx % coreEmitters.length];
      const targetSector = anchor.sector;
      const neededSpectrum = anchor.targetSpectrum;
      const needsOvercharge = anchor.requiresOvercharge;

      let hasSpectrumApplied = false;
      let hasOverchargeApplied = false;

      // Проводим луч сквозь каждое кольцо от 0 до numRings - 1
      for (let r = 0; r < numRings; r++) {
        const ring = this.rings[r];
        const isLastRing = (r === numRings - 1);
        let sectorObj = ring.sectors[currentSector];

        // Разница секторов до целевого
        let diff = (targetSector - currentSector + 8) % 8;
        if (diff > 4) diff -= 8;

        // Если это последнее кольцо, выход ОБЯЗАН попасть точно в targetSector
        if (isLastRing) {
          if (diff === 0) {
            // Прямо в цель
            if (!hasSpectrumApplied && neededSpectrum) {
              sectorObj.type = NODE_TYPES.PRISM;
              sectorObj.spectrum = neededSpectrum;
              hasSpectrumApplied = true;
            } else if (!hasOverchargeApplied && needsOvercharge) {
              sectorObj.type = NODE_TYPES.RESONATOR;
              hasOverchargeApplied = true;
            } else {
              sectorObj.type = NODE_TYPES.STRAIGHT;
            }
          } else if (diff === 1 || diff === -7) {
            // Поворот по часовой
            sectorObj.type = NODE_TYPES.TURN_CW;
            currentSector = (currentSector + 1) % 8;
          } else if (diff === -1 || diff === 7) {
            // Поворот против часовой
            sectorObj.type = NODE_TYPES.TURN_CCW;
            currentSector = (currentSector - 1 + 8) % 8;
          } else {
            // Если слишком далеко на последнем кольце — ставим прямой и переносим целевой якорь на currentSector
            sectorObj.type = NODE_TYPES.STRAIGHT;
            anchor.sector = currentSector;
            anchor.angle = currentSector * 45;
          }
          continue;
        }

        // Для промежуточных колец: случайный выбор элемента с пользой для сближения
        const rnd = Math.random();

        if (!hasSpectrumApplied && rnd < 0.45) {
          // Ставим призму!
          sectorObj.type = NODE_TYPES.PRISM;
          sectorObj.spectrum = neededSpectrum;
          hasSpectrumApplied = true;
        } else if (!hasOverchargeApplied && needsOvercharge && rnd < 0.4) {
          // Ставим резонатор!
          sectorObj.type = NODE_TYPES.RESONATOR;
          hasOverchargeApplied = true;
        } else if (diff !== 0 && Math.random() > 0.3) {
          // Сближаем луч с целевым сектором
          if (diff > 0) {
            sectorObj.type = NODE_TYPES.TURN_CW;
            currentSector = (currentSector + 1) % 8;
          } else {
            sectorObj.type = NODE_TYPES.TURN_CCW;
            currentSector = (currentSector - 1 + 8) % 8;
          }
        } else {
          // Прямой проводник или развилка
          sectorObj.type = Math.random() > 0.6 ? NODE_TYPES.FORK : NODE_TYPES.STRAIGHT;
        }
      }
    });

    // --- ЗАПОЛНЕНИЕ СВОБОДНЫХ СЕКТОРОВ ПРОЦЕДУРНЫМ МИКСИРОВАНИЕМ ---
    // Добавляем порталы, глифы энтропии и альтернативные пути
    let portalCreated = false;
    this.rings.forEach((ring, rIdx) => {
      ring.sectors.forEach((sec, sIdx) => {
        if (sec.type !== NODE_TYPES.EMPTY) return;

        const roll = Math.random();
        if (!portalCreated && roll < 0.15 && rIdx < numRings - 1) {
          // Создаем пару связанных порталов
          const targetRing = this.rings[rIdx + 1];
          const emptySectors = targetRing.sectors
            .map((s, idx) => ({ s, idx }))
            .filter(item => item.s.type === NODE_TYPES.EMPTY);

          if (emptySectors.length > 0) {
            const partner = emptySectors[Math.floor(Math.random() * emptySectors.length)];
            sec.type = NODE_TYPES.PORTAL;
            sec.portalId = 'portal_alpha';
            sec.targetRing = rIdx + 1;
            sec.targetSector = partner.idx;

            partner.s.type = NODE_TYPES.PORTAL;
            partner.s.portalId = 'portal_alpha';
            partner.s.targetRing = rIdx;
            partner.s.targetSector = sIdx;
            portalCreated = true;
            return;
          }
        }

        if (roll < 0.22) {
          // Глиф Энтропии (ловушка)
          sec.type = NODE_TYPES.ENTROPY;
        } else if (roll < 0.45) {
          sec.type = NODE_TYPES.TURN_CW;
        } else if (roll < 0.68) {
          sec.type = NODE_TYPES.TURN_CCW;
        } else if (roll < 0.88) {
          sec.type = NODE_TYPES.STRAIGHT;
        } else {
          // Случайная декоративная призма
          sec.type = NODE_TYPES.PRISM;
          sec.spectrum = ['FIRE', 'WATER', 'AIR', 'EARTH'][Math.floor(Math.random() * 4)];
        }
      });
    });

    // --- КИНЕМАТИЧЕСКАЯ / РЕЗОНАНСНАЯ СЦЕПКА КОЛЕЦ ---
    // При DC >= 15 включается сцепка двух соседних колец
    if (dc >= 15 && numRings >= 3) {
      const ringA = 1;
      const ringB = 2;
      this.rings[ringA].coupledRing = ringB;
      this.rings[ringA].coupledRatio = -1; // При вращении A на +45°, B крутится на -45°
    }

    // --- ПЕРЕМЕШИВАНИЕ (SCRAMBLE) ИЗ РЕШЕНИЯ ---
    // Поворачиваем кольца серией случайных валидных шагов, чтобы гарантировать проходимость!
    const scrambleMoves = 4 + Math.floor(Math.random() * 5);
    for (let m = 0; m < scrambleMoves; m++) {
      const randRing = Math.floor(Math.random() * numRings);
      const randDir = Math.random() > 0.5 ? 45 : -45;
      this.applyRingRotation(randRing, randDir, false);
    }

    // Проверяем, чтобы сразу не было решено
    this.traceManaBeams();
    if (this.checkWinCondition(false)) {
      // Сдвигаем первое кольцо еще на 90°
      this.applyRingRotation(0, 90, false);
      this.traceManaBeams();
    }

    this.renderRingSelectors();
    this.renderAnchorsHUD();
    this.updateInstabilityUI();
  }

  // Вращение кольца с учетом сцепки
  applyRingRotation(ringIdx, degDelta, playSound = true) {
    const ring = this.rings[ringIdx];
    if (!ring) return;

    ring.angle = (ring.angle + degDelta + 720) % 360;
    ring.currentAngle = Math.round(ring.angle / 45) * 45;

    // Кинематическая сцепка с другим кольцом
    if (ring.coupledRing !== null && this.rings[ring.coupledRing]) {
      const coupled = this.rings[ring.coupledRing];
      const coupledDelta = degDelta * ring.coupledRatio;
      coupled.angle = (coupled.angle + coupledDelta + 720) % 360;
      coupled.currentAngle = Math.round(coupled.angle / 45) * 45;
    }

    // Эфирный шум от вращения (+к нестабильности)
    if (playSound) {
      const bonusAdv = dnd.getEffectiveAdvantage();
      const heatGain = Math.max(1.2, 3.4 - (dnd.bonus || 0) * 0.2);
      this.addInstability(heatGain);

      const pitch = 260 + ringIdx * 110;
      audio.playRuneHum(pitch, 0.24);
      audio.playTumblerClick(1.15);
    }
  }

  rotateSelectedRing(degDelta) {
    if (this.isSolved || this.isFailed) return;
    this.applyRingRotation(this.selectedRingIndex, degDelta, true);
    this.traceManaBeams();
    this.checkWinCondition(true);
  }

  // =========================================================================
  // --- СПОСОБНОСТЬ: АРКАННАЯ СТАБИЛИЗАЦИЯ (ФОКУС) ---
  // =========================================================================
  activateArcaneFocus() {
    if (this.focusCooldown > 0 || this.isSolved || this.isFailed) return;

    // Снимает 35% нестабильности
    this.instability = Math.max(0, this.instability - 35);
    this.focusCooldown = this.focusMaxCooldown;
    this.updateInstabilityUI();

    audio.playResonanceSurge();
    this.spawnManaSparkles(0, 25, '#c084fc');

    if (this.instabilityWarn) {
      this.instabilityWarn.textContent = '✨ Эфирный поток стабилизирован!';
      this.instabilityWarn.style.color = '#c084fc';
    }
  }

  // =========================================================================
  // --- ТРАССИРОВКА ЛУЧЕЙ МАНЫ (REAL-TIME CIRCUIT FLOW) ---
  // =========================================================================
  traceManaBeams() {
    this.activeBeams = [];
    this.activeEntropyHit = false;

    // Сбрасываем статус якорей
    this.anchors.forEach(a => { a.connected = false; });

    // Центр ядра
    const center = this.logicalSize / 2;
    const coreEmitters = [0, 2, 4, 6]; // 0°, 90°, 180°, 270°

    coreEmitters.forEach(emitterSector => {
      const startAngle = emitterSector * 45;
      const initialBeam = {
        spectrum: 'RAW',
        isOvercharged: false,
        currentSector: emitterSector,
        ringIdx: 0,
        path: []
      };

      // Начальный отрезок из центра к внутреннему радиусу 1-го кольца
      const rad0 = (startAngle * Math.PI) / 180;
      const rInner0 = this.rings[0].innerR;
      initialBeam.path.push({
        type: 'line',
        x1: center,
        y1: center,
        x2: center + Math.cos(rad0) * rInner0,
        y2: center + Math.sin(rad0) * rInner0
      });

      this.propagateBeam(initialBeam, center);
    });

    this.renderAnchorsHUD();
  }

  propagateBeam(beam, center) {
    if (beam.ringIdx >= this.rings.length) {
      // Луч вышел за внешнее кольцо! Проверяем, попал ли в стихийный алтарь
      this.checkAnchorHit(beam, center);
      this.activeBeams.push(beam);
      return;
    }

    const ring = this.rings[beam.ringIdx];
    const discreteRingOffset = Math.round(ring.currentAngle / 45);
    // Локальный сектор элемента внутри кольца
    const localSector = (beam.currentSector - discreteRingOffset + 80) % 8;
    const node = ring.sectors[localSector];

    const currentRad = (beam.currentSector * 45 * Math.PI) / 180;
    const rIn = ring.innerR;
    const rOut = ring.outerR;
    const rMid = ring.midR;

    if (!node || node.type === NODE_TYPES.EMPTY) {
      // Пустой сектор: луч упирается в камень и рассеивается
      beam.path.push({
        type: 'line',
        x1: center + Math.cos(currentRad) * rIn,
        y1: center + Math.sin(currentRad) * rIn,
        x2: center + Math.cos(currentRad) * (rIn + 8),
        y2: center + Math.sin(currentRad) * (rIn + 8)
      });
      this.activeBeams.push(beam);
      return;
    }

    if (node.type === NODE_TYPES.ENTROPY) {
      // Попадание в Глиф Энтропии (Тёмная руна)
      beam.path.push({
        type: 'line',
        x1: center + Math.cos(currentRad) * rIn,
        y1: center + Math.sin(currentRad) * rIn,
        x2: center + Math.cos(currentRad) * rMid,
        y2: center + Math.sin(currentRad) * rMid
      });
      this.activeEntropyHit = true;
      this.activeBeams.push(beam);
      return;
    }

    if (node.type === NODE_TYPES.STRAIGHT) {
      // Прямой сквозной радиальный канал
      beam.path.push({
        type: 'line',
        x1: center + Math.cos(currentRad) * rIn,
        y1: center + Math.sin(currentRad) * rIn,
        x2: center + Math.cos(currentRad) * rOut,
        y2: center + Math.sin(currentRad) * rOut
      });
      // Идем на следующее кольцо
      beam.ringIdx++;
      this.propagateBeam(beam, center);
      return;
    }

    if (node.type === NODE_TYPES.PRISM) {
      // Астральная Призма: меняет спектр
      beam.spectrum = node.spectrum || 'FIRE';
      beam.path.push({
        type: 'line',
        x1: center + Math.cos(currentRad) * rIn,
        y1: center + Math.sin(currentRad) * rIn,
        x2: center + Math.cos(currentRad) * rOut,
        y2: center + Math.sin(currentRad) * rOut
      });
      beam.ringIdx++;
      this.propagateBeam(beam, center);
      return;
    }

    if (node.type === NODE_TYPES.RESONATOR) {
      // Руна Резонанса: сверхзарядка
      beam.isOvercharged = true;
      beam.path.push({
        type: 'line',
        x1: center + Math.cos(currentRad) * rIn,
        y1: center + Math.sin(currentRad) * rIn,
        x2: center + Math.cos(currentRad) * rOut,
        y2: center + Math.sin(currentRad) * rOut
      });
      beam.ringIdx++;
      this.propagateBeam(beam, center);
      return;
    }

    if (node.type === NODE_TYPES.TURN_CW) {
      // Дуговой поворот по часовой стрелке (+45°)
      const nextSector = (beam.currentSector + 1) % 8;
      const nextRad = (nextSector * 45 * Math.PI) / 180;

      // Отрезок входа до rMid
      beam.path.push({
        type: 'line',
        x1: center + Math.cos(currentRad) * rIn,
        y1: center + Math.sin(currentRad) * rIn,
        x2: center + Math.cos(currentRad) * rMid,
        y2: center + Math.sin(currentRad) * rMid
      });
      // Дуга по rMid
      beam.path.push({
        type: 'arc',
        cx: center,
        cy: center,
        r: rMid,
        startA: currentRad,
        endA: currentRad + (Math.PI / 4),
        ccw: false
      });
      // Отрезок выхода от rMid до rOut
      beam.path.push({
        type: 'line',
        x1: center + Math.cos(nextRad) * rMid,
        y1: center + Math.sin(nextRad) * rMid,
        x2: center + Math.cos(nextRad) * rOut,
        y2: center + Math.sin(nextRad) * rOut
      });

      beam.currentSector = nextSector;
      beam.ringIdx++;
      this.propagateBeam(beam, center);
      return;
    }

    if (node.type === NODE_TYPES.TURN_CCW) {
      // Дуговой поворот против часовой стрелки (-45°)
      const nextSector = (beam.currentSector - 1 + 8) % 8;
      const nextRad = (nextSector * 45 * Math.PI) / 180;

      beam.path.push({
        type: 'line',
        x1: center + Math.cos(currentRad) * rIn,
        y1: center + Math.sin(currentRad) * rIn,
        x2: center + Math.cos(currentRad) * rMid,
        y2: center + Math.sin(currentRad) * rMid
      });
      beam.path.push({
        type: 'arc',
        cx: center,
        cy: center,
        r: rMid,
        startA: currentRad,
        endA: currentRad - (Math.PI / 4),
        ccw: true
      });
      beam.path.push({
        type: 'line',
        x1: center + Math.cos(nextRad) * rMid,
        y1: center + Math.sin(nextRad) * rMid,
        x2: center + Math.cos(nextRad) * rOut,
        y2: center + Math.sin(nextRad) * rOut
      });

      beam.currentSector = nextSector;
      beam.ringIdx++;
      this.propagateBeam(beam, center);
      return;
    }

    if (node.type === NODE_TYPES.FORK) {
      // Развилка: один луч идет прямо, копия луча поворачивает
      beam.path.push({
        type: 'line',
        x1: center + Math.cos(currentRad) * rIn,
        y1: center + Math.sin(currentRad) * rIn,
        x2: center + Math.cos(currentRad) * rOut,
        y2: center + Math.sin(currentRad) * rOut
      });

      // Ответвление
      const branchSector = (beam.currentSector + 1) % 8;
      const branchRad = (branchSector * 45 * Math.PI) / 180;
      const branchBeam = {
        spectrum: beam.spectrum,
        isOvercharged: beam.isOvercharged,
        currentSector: branchSector,
        ringIdx: beam.ringIdx + 1,
        path: [...beam.path]
      };
      branchBeam.path.push({
        type: 'arc',
        cx: center,
        cy: center,
        r: rMid,
        startA: currentRad,
        endA: currentRad + (Math.PI / 4),
        ccw: false
      });
      branchBeam.path.push({
        type: 'line',
        x1: center + Math.cos(branchRad) * rMid,
        y1: center + Math.sin(branchRad) * rMid,
        x2: center + Math.cos(branchRad) * rOut,
        y2: center + Math.sin(branchRad) * rOut
      });

      this.propagateBeam(branchBeam, center);

      beam.ringIdx++;
      this.propagateBeam(beam, center);
      return;
    }

    if (node.type === NODE_TYPES.PORTAL) {
      // Портал: прыжок в связанный сектор
      const targetRingIdx = node.targetRing;
      const targetSectorLocal = node.targetSector;
      if (targetRingIdx !== undefined && this.rings[targetRingIdx]) {
        const destRing = this.rings[targetRingIdx];
        const destWorldSector = (targetSectorLocal + Math.round(destRing.currentAngle / 45)) % 8;
        const destRad = (destWorldSector * 45 * Math.PI) / 180;

        // Вход в портал
        beam.path.push({
          type: 'line',
          x1: center + Math.cos(currentRad) * rIn,
          y1: center + Math.sin(currentRad) * rIn,
          x2: center + Math.cos(currentRad) * rMid,
          y2: center + Math.sin(currentRad) * rMid
        });

        // Выход из портала на целевом кольце
        beam.ringIdx = targetRingIdx + 1;
        beam.currentSector = destWorldSector;
        beam.path.push({
          type: 'line',
          x1: center + Math.cos(destRad) * destRing.midR,
          y1: center + Math.sin(destRad) * destRing.midR,
          x2: center + Math.cos(destRad) * destRing.outerR,
          y2: center + Math.sin(destRad) * destRing.outerR
        });

        this.propagateBeam(beam, center);
        return;
      }
    }

    this.activeBeams.push(beam);
  }

  checkAnchorHit(beam, center) {
    const matchedAnchor = this.anchors.find(a => a.sector === beam.currentSector);
    if (!matchedAnchor) return;

    // Луч дошел до сектора алтаря!
    const targetR = this.logicalSize * 0.44;
    const rad = (matchedAnchor.angle * Math.PI) / 180;

    // Продлеваем луч от внешнего кольца до алтаря
    const lastRing = this.rings[this.rings.length - 1];
    beam.path.push({
      type: 'line',
      x1: center + Math.cos(rad) * lastRing.outerR,
      y1: center + Math.sin(rad) * lastRing.outerR,
      x2: center + Math.cos(rad) * targetR,
      y2: center + Math.sin(rad) * targetR
    });

    // Проверяем соответствие спектра и резонанса
    const spectrumMatch = (!matchedAnchor.targetSpectrum || beam.spectrum === matchedAnchor.targetSpectrum || beam.spectrum === 'RAW');
    const overchargeMatch = (!matchedAnchor.requiresOvercharge || beam.isOvercharged);

    if (spectrumMatch && overchargeMatch) {
      if (!matchedAnchor.connected) {
        // Алтарь только что зажегся!
        matchedAnchor.connected = true;
        audio.playBalanceChime();
        this.spawnManaSparkles(matchedAnchor.angle, 25, matchedAnchor.defaultColor);
        // Замыкание стабилизирует печать (-20% нестабильности)
        this.addInstability(-20);
      } else {
        matchedAnchor.connected = true;
      }
    }
  }

  // =========================================================================
  // --- ПРОВЕРКА УСЛОВИЯ ПОБЕДЫ ИЛИ НЕСТАБИЛЬНОСТИ ---
  // =========================================================================
  checkWinCondition(triggerSounds = true) {
    const allConnected = this.anchors.every(a => a.connected);

    if (allConnected && !this.isSolved) {
      this.isSolved = true;
      if (triggerSounds) {
        audio.playSuccess();
        audio.playResonanceSurge();
      }

      for (let a = 0; a < 360; a += 30) {
        this.spawnManaSparkles(a, 15, '#e8c36a');
      }

      const timeSpent = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
      setTimeout(() => {
        this.app.finishGame(true, {
          timeSpent,
          mistakes: this.mistakes,
          noiseLevel: Math.round(this.instability * 0.5)
        });
      }, 1300);
      return true;
    }
    return false;
  }

  addInstability(amount) {
    if (this.isSolved || this.isFailed) return;
    this.instability = Math.max(0, Math.min(100, this.instability + amount));
    this.updateInstabilityUI();

    if (this.instability >= 100) {
      this.triggerBacklash();
    }
  }

  triggerBacklash() {
    this.mistakes++;
    audio.playBacklash();
    this.instability = 55; // Сброс до половины
    this.updateInstabilityUI();

    if (this.instabilityWarn) {
      this.instabilityWarn.textContent = '💥 ЭФИРНЫЙ СРЫВ! Ошибка резонанса!';
      this.instabilityWarn.style.color = '#ef4444';
    }

    // Проверяем лимит попыток D&D
    if (this.mistakes >= dnd.maxAttempts) {
      this.isFailed = true;
      audio.playFailure();
      const timeSpent = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
      setTimeout(() => {
        this.app.finishGame(false, {
          timeSpent,
          mistakes: this.mistakes,
          noiseLevel: 95
        });
      }, 1200);
    }
  }

  updateInstabilityUI() {
    if (!this.instabilityValue || !this.instabilityBarFill) return;
    const rounded = Math.round(this.instability);
    this.instabilityValue.textContent = `${rounded}%`;
    this.instabilityBarFill.style.width = `${rounded}%`;

    if (rounded < 40) {
      this.instabilityBarFill.style.background = 'linear-gradient(90deg, #38bdf8, #06b6d4)';
      if (this.instabilityWarn) {
        this.instabilityWarn.textContent = 'Поток маны устойчив';
        this.instabilityWarn.style.color = '#38bdf8';
      }
    } else if (rounded < 75) {
      this.instabilityBarFill.style.background = 'linear-gradient(90deg, #f59e0b, #f97316)';
      if (this.instabilityWarn) {
        this.instabilityWarn.textContent = '⚠ Нарастает эфирное напряжение';
        this.instabilityWarn.style.color = '#f59e0b';
      }
    } else {
      this.instabilityBarFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
      if (this.instabilityWarn) {
        this.instabilityWarn.textContent = '⚡ КРИТИЧЕСКАЯ НЕСТАБИЛЬНОСТЬ!';
        this.instabilityWarn.style.color = '#ef4444';
      }
    }

    // Обновляем кнопку фокуса
    if (this.btnArcaneFocus) {
      if (this.focusCooldown > 0) {
        this.btnArcaneFocus.disabled = true;
        this.btnArcaneFocus.innerHTML = `<span>⏳</span> Фокус (${Math.ceil(this.focusCooldown)}с)`;
      } else {
        this.btnArcaneFocus.disabled = false;
        this.btnArcaneFocus.innerHTML = `<span>✦</span> Арканная стабилизация`;
      }
    }
  }

  renderRingSelectors() {
    if (!this.ringSelectorBtns) return;
    this.ringSelectorBtns.innerHTML = this.rings.map((ring, idx) => `
      <button type="button" class="ring-btn ${idx === this.selectedRingIndex ? 'active' : ''}" data-ring="${idx}">
        ${ring.name} ${ring.coupledRing !== null ? '🔗' : ''}
      </button>
    `).join('');

    this.ringSelectorBtns.querySelectorAll('.ring-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectRing(parseInt(btn.dataset.ring, 10));
      });
    });
  }

  updateRingSelectionUI() {
    if (!this.ringSelectorBtns) return;
    this.ringSelectorBtns.querySelectorAll('.ring-btn').forEach((btn, idx) => {
      btn.classList.toggle('active', idx === this.selectedRingIndex);
    });
  }

  renderAnchorsHUD() {
    if (!this.anchorsList) return;
    const connectedCount = this.anchors.filter(a => a.connected).length;
    if (this.anchorsCountBadge) {
      this.anchorsCountBadge.textContent = `${connectedCount} / ${this.anchors.length}`;
      this.anchorsCountBadge.style.color = connectedCount === this.anchors.length ? '#10b981' : '#e8c36a';
    }

    this.anchorsList.innerHTML = this.anchors.map(a => {
      const spec = SPECTRA[a.targetSpectrum] || SPECTRA.RAW;
      const overchargeLabel = a.requiresOvercharge ? ' • ☀️ Сверхзаряд' : '';
      return `
        <div class="anchor-status-item ${a.connected ? 'active' : ''}">
          <span class="anchor-rune" style="color: ${a.defaultColor}">${a.rune}</span>
          <div class="anchor-info-block">
            <span class="anchor-name">${a.name}</span>
            <span class="anchor-req">${spec.name}${overchargeLabel}</span>
          </div>
          <span class="anchor-badge">${a.connected ? '✓ Замкнут' : '○ Ищет луч'}</span>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // --- МЫШЬ И СЕНСОРНОЕ ВРАЩЕНИЕ ---
  // =========================================================================
  onPointerDown(e) {
    if (this.isSolved || this.isFailed) return;
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    const dist = Math.hypot(x, y);

    const foundRing = this.rings.find(r => dist >= r.innerR && dist <= r.outerR);
    if (foundRing) {
      this.draggedRing = foundRing;
      this.selectedRingIndex = foundRing.index;
      this.updateRingSelectionUI();

      this.dragStartAngle = Math.atan2(y, x) * (180 / Math.PI);
      this.ringInitialAngle = foundRing.angle;
      audio.playTumblerClick(1.2);
    }
  }

  onPointerMove(e) {
    if (!this.draggedRing || this.isSolved || this.isFailed) return;
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;

    const currentAngle = Math.atan2(y, x) * (180 / Math.PI);
    const delta = currentAngle - this.dragStartAngle;

    this.draggedRing.angle = (this.ringInitialAngle + delta + 720) % 360;
  }

  onPointerUp() {
    if (!this.draggedRing) return;
    // Привязка к 45 градусам
    const snapped = Math.round(this.draggedRing.angle / 45) * 45;
    const prevDiscrete = this.draggedRing.currentAngle;
    this.draggedRing.angle = (snapped + 360) % 360;
    this.draggedRing.currentAngle = this.draggedRing.angle;

    const delta = (this.draggedRing.currentAngle - prevDiscrete + 360) % 360;
    if (delta !== 0) {
      // Применяем сцепку, если была
      if (this.draggedRing.coupledRing !== null && this.rings[this.draggedRing.coupledRing]) {
        const coupled = this.rings[this.draggedRing.coupledRing];
        const coupledDelta = (delta > 180 ? delta - 360 : delta) * this.draggedRing.coupledRatio;
        coupled.angle = (coupled.angle + coupledDelta + 720) % 360;
        coupled.currentAngle = Math.round(coupled.angle / 45) * 45;
      }
      this.addInstability(2.5);
      audio.playRuneHum(300 + this.draggedRing.index * 120, 0.2);
    }

    this.draggedRing = null;
    this.traceManaBeams();
    this.checkWinCondition(true);
  }

  // =========================================================================
  // --- АНИМАЦИОННЫЙ ЦИКЛ И ОТРИСОВКА ---
  // =========================================================================
  startAnimationLoop() {
    let lastTime = performance.now();
    const loop = (timestamp) => {
      const dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      this.update(dt);
      this.draw();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  update(dt) {
    this.manaFlowTime += dt;

    // Плавная доводка колец
    if (!this.draggedRing) {
      this.rings.forEach(ring => {
        let diff = ring.currentAngle - ring.angle;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        ring.angle += diff * 0.25;
      });
    }

    // Кулдаун способности
    if (this.focusCooldown > 0) {
      this.focusCooldown = Math.max(0, this.focusCooldown - dt);
      this.updateInstabilityUI();
    }

    // Если луч попадает в Глиф Энтропии — нагнетаем нестабильность непрерывно
    if (this.activeEntropyHit && !this.isSolved && !this.isFailed) {
      this.addInstability(8 * dt);
      if (Math.random() < 0.1) {
        audio.playEntropyHiss();
      }
    } else if (this.instability > 0 && !this.isSolved && !this.isFailed) {
      // Медленное естественное рассеивание тепла
      this.instability = Math.max(0, this.instability - 1.2 * dt);
      this.updateInstabilityUI();
    }

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

  draw() {
    if (!this.ctx || !this.logicalSize) return;
    const ctx = this.ctx;
    const size = this.logicalSize;
    const cx = size / 2;
    const cy = size / 2;

    ctx.save();
    ctx.clearRect(0, 0, size, size);

    // 1. Древняя обсидиановая каменная плита
    this.drawBackground(ctx, cx, cy, size);

    // 2. Кольца, каналы и магические элементы
    this.rings.forEach(ring => this.drawRing(ctx, cx, cy, ring));

    // 3. Живые светящиеся потоки маны
    this.drawActiveBeams(ctx);

    // 4. Пульсирующее арканное ядро
    this.drawCentralCore(ctx, cx, cy);

    // 5. Стихийные алтари по краям
    this.drawAnchors(ctx, cx, cy);

    // 6. Магические искры
    this.drawParticles(ctx);

    ctx.restore();
  }

  drawBackground(ctx, cx, cy, size) {
    const bgGrad = ctx.createRadialGradient(cx, cy, 25, cx, cy, size / 2);
    bgGrad.addColorStop(0, '#10131f');
    bgGrad.addColorStop(0.65, '#090a12');
    bgGrad.addColorStop(1, '#030408');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // Золотисто-аметистовые астрологические круги
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.12)';
    ctx.lineWidth = 1;
    for (let r = 75; r < size / 2 - 25; r += 40) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Тонкие перекрестные направляющие
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    for (let a = 0; a < 360; a += 45) {
      const rad = (a * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(rad) * (size * 0.44), cy + Math.sin(rad) * (size * 0.44));
      ctx.stroke();
    }
  }

  drawRing(ctx, cx, cy, ring) {
    ctx.save();
    const isSelected = (ring.index === this.selectedRingIndex);

    // Тело кольца
    ctx.beginPath();
    ctx.arc(cx, cy, ring.outerR, 0, Math.PI * 2);
    ctx.arc(cx, cy, ring.innerR, 0, Math.PI * 2, true);
    ctx.fillStyle = isSelected ? 'rgba(38, 44, 68, 0.65)' : 'rgba(20, 24, 38, 0.55)';
    ctx.fill();

    // Обод
    ctx.strokeStyle = isSelected ? '#d4af37' : 'rgba(212, 175, 55, 0.25)';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.stroke();

    // Вращаем контекст под угол кольца для отрисовки элементов и рун
    ctx.translate(cx, cy);
    ctx.rotate((ring.angle * Math.PI) / 180);

    // 1. Руны футарки на фоне
    ctx.font = '12px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isSelected ? 'rgba(255, 214, 102, 0.65)' : 'rgba(200, 210, 230, 0.25)';

    for (let s = 0; s < 8; s++) {
      const segAngle = (s * 45 * Math.PI) / 180;
      const rx = Math.cos(segAngle) * ring.midR;
      const ry = Math.sin(segAngle) * ring.midR;
      ctx.fillText(ring.runes[s], rx, ry);
    }

    // 2. Отрисовка желобов каналов и магических элементов
    ring.sectors.forEach((node, s) => {
      this.drawNodeElement(ctx, ring, node, s);
    });

    ctx.restore();
  }

  drawNodeElement(ctx, ring, node, s) {
    const rad = (s * 45 * Math.PI) / 180;
    const rIn = ring.innerR;
    const rOut = ring.outerR;
    const rMid = ring.midR;

    if (node.type === NODE_TYPES.EMPTY) return;

    // Базовый цвет желоба (медь/латунь)
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    if (node.type === NODE_TYPES.STRAIGHT) {
      ctx.beginPath();
      ctx.moveTo(Math.cos(rad) * rIn, Math.sin(rad) * rIn);
      ctx.lineTo(Math.cos(rad) * rOut, Math.sin(rad) * rOut);
      ctx.stroke();
    } else if (node.type === NODE_TYPES.TURN_CW) {
      const nextRad = ((s + 1) * 45 * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(Math.cos(rad) * rIn, Math.sin(rad) * rIn);
      ctx.lineTo(Math.cos(rad) * rMid, Math.sin(rad) * rMid);
      ctx.arc(0, 0, rMid, rad, rad + (Math.PI / 4), false);
      ctx.lineTo(Math.cos(nextRad) * rOut, Math.sin(nextRad) * rOut);
      ctx.stroke();
    } else if (node.type === NODE_TYPES.TURN_CCW) {
      const nextRad = ((s - 1) * 45 * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(Math.cos(rad) * rIn, Math.sin(rad) * rIn);
      ctx.lineTo(Math.cos(rad) * rMid, Math.sin(rad) * rMid);
      ctx.arc(0, 0, rMid, rad, rad - (Math.PI / 4), true);
      ctx.lineTo(Math.cos(nextRad) * rOut, Math.sin(nextRad) * rOut);
      ctx.stroke();
    } else if (node.type === NODE_TYPES.FORK) {
      const nextRad = ((s + 1) * 45 * Math.PI) / 180;
      // Прямой канал
      ctx.beginPath();
      ctx.moveTo(Math.cos(rad) * rIn, Math.sin(rad) * rIn);
      ctx.lineTo(Math.cos(rad) * rOut, Math.sin(rad) * rOut);
      ctx.stroke();
      // Дуговое ответвление
      ctx.beginPath();
      ctx.arc(0, 0, rMid, rad, rad + (Math.PI / 4), false);
      ctx.lineTo(Math.cos(nextRad) * rOut, Math.sin(nextRad) * rOut);
      ctx.stroke();
    } else if (node.type === NODE_TYPES.PRISM) {
      // Астральная Призма: граненый кристалл
      ctx.beginPath();
      ctx.moveTo(Math.cos(rad) * rIn, Math.sin(rad) * rIn);
      ctx.lineTo(Math.cos(rad) * rOut, Math.sin(rad) * rOut);
      ctx.stroke();

      const px = Math.cos(rad) * rMid;
      const py = Math.sin(rad) * rMid;
      const spec = SPECTRA[node.spectrum] || SPECTRA.FIRE;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rad);
      ctx.fillStyle = spec.color;
      ctx.shadowColor = spec.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(6, 0);
      ctx.lineTo(0, 6);
      ctx.lineTo(-6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (node.type === NODE_TYPES.RESONATOR) {
      // Руна Резонанса: солярный символ
      ctx.beginPath();
      ctx.moveTo(Math.cos(rad) * rIn, Math.sin(rad) * rIn);
      ctx.lineTo(Math.cos(rad) * rOut, Math.sin(rad) * rOut);
      ctx.stroke();

      const rx = Math.cos(rad) * rMid;
      const ry = Math.sin(rad) * rMid;
      ctx.save();
      ctx.beginPath();
      ctx.arc(rx, ry, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd666';
      ctx.shadowColor = '#ffd666';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    } else if (node.type === NODE_TYPES.ENTROPY) {
      // Глиф Энтропии: тёмное фиолетовое око
      const ex = Math.cos(rad) * rMid;
      const ey = Math.sin(rad) * rMid;
      ctx.save();
      ctx.beginPath();
      ctx.arc(ex, ey, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#4a044e';
      ctx.strokeStyle = '#c026d3';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#c026d3';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fdf4ff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💀', ex, ey);
      ctx.restore();
    } else if (node.type === NODE_TYPES.PORTAL) {
      // Фазовый Разлом: спираль воронки
      const pox = Math.cos(rad) * rMid;
      const poy = Math.sin(rad) * rMid;
      ctx.save();
      ctx.beginPath();
      ctx.arc(pox, poy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#312e81';
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌀', pox, poy);
      ctx.restore();
    }
  }

  drawActiveBeams(ctx) {
    if (!this.activeBeams || this.activeBeams.length === 0) return;

    this.activeBeams.forEach(beam => {
      const spec = SPECTRA[beam.spectrum] || SPECTRA.RAW;
      const beamColor = beam.isOvercharged ? '#e879f9' : spec.color;

      beam.path.forEach(seg => {
        ctx.save();
        ctx.beginPath();

        if (seg.type === 'line') {
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        } else if (seg.type === 'arc') {
          ctx.arc(seg.cx, seg.cy, seg.r, seg.startA, seg.endA, seg.ccw);
        }

        // 1. Внешнее неоновое свечение
        ctx.strokeStyle = beamColor;
        ctx.shadowColor = beamColor;
        ctx.shadowBlur = beam.isOvercharged ? 20 : 12;
        ctx.lineWidth = beam.isOvercharged ? 6.5 : 4.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 2. Белое горячее ядро луча
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = beam.isOvercharged ? 2.5 : 1.5;
        ctx.stroke();

        // 3. Бегущие искры тока маны
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 12]);
        ctx.lineDashOffset = -this.manaFlowTime * 35;
        ctx.stroke();

        ctx.restore();
      });
    });
  }

  drawCentralCore(ctx, cx, cy) {
    ctx.save();
    const pulse = Math.sin(this.manaFlowTime * 2.5) * 3.5;
    const r = 26 + pulse;

    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 22;

    const coreGrad = ctx.createRadialGradient(cx, cy, 3, cx, cy, r);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, '#38bdf8');
    coreGrad.addColorStop(0.7, '#8b5cf6');
    coreGrad.addColorStop(1, '#2e1065');

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Центральный глиф источника
    ctx.font = '18px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('✧', cx, cy);

    ctx.restore();
  }

  drawAnchors(ctx, cx, cy) {
    const endR = this.logicalSize * 0.44;

    this.anchors.forEach(anchor => {
      const rad = (anchor.angle * Math.PI) / 180;
      const ax = cx + Math.cos(rad) * endR;
      const ay = cy + Math.sin(rad) * endR;

      ctx.save();
      ctx.beginPath();
      ctx.arc(ax, ay, 20, 0, Math.PI * 2);

      if (anchor.connected) {
        ctx.shadowColor = anchor.defaultColor;
        ctx.shadowBlur = 20;
        ctx.fillStyle = anchor.defaultColor;
      } else {
        ctx.fillStyle = '#171a26';
      }
      ctx.fill();

      ctx.strokeStyle = anchor.defaultColor;
      ctx.lineWidth = anchor.connected ? 3 : 2;
      ctx.stroke();

      // Стихийный символ
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(anchor.rune, ax, ay);

      // Маленькая метка сверхрезонанса
      if (anchor.requiresOvercharge && !anchor.connected) {
        ctx.font = '10px sans-serif';
        ctx.fillText('☀️', ax + 12, ay - 12);
      }

      ctx.restore();
    });
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

  spawnManaSparkles(angleDeg, count = 20, color = '#38bdf8') {
    const rad = (angleDeg * Math.PI) / 180;
    const center = this.logicalSize / 2;
    const targetR = this.logicalSize * 0.44;
    const originX = center + Math.cos(rad) * targetR;
    const originY = center + Math.sin(rad) * targetR;

    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 3.8;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        color,
        size: 2 + Math.random() * 3,
        life: 1,
        decay: 0.02 + Math.random() * 0.03
      });
    }
  }

  reset() {
    this.generateRunePuzzle();
  }

  onParametersChanged() {
    this.generateRunePuzzle();
  }
}