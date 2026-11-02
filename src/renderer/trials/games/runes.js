/**
 * Модуль мини-игры: Магические руны (Arcane Runes: Arcane Circuit)
 * Древняя арканная печать со свободной процедурной генерацией каналов маны:
 * - Прямые радиальные проводники
 * - Дуговые повороты (по часовой и против часовой стрелки)
 * - Развилочные каналы-желоба
 * - Кинематическая/эфирная сцепка колец (Resonance Coupling на высокой сложности)
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
  FORK: 'fork'             // Развилка (прямо + вправо на 45°)
};

// Спектры маны (цветовая палитра потоков)
export const SPECTRA = {
  RAW: { id: 'RAW', name: 'Чистая мана', icon: '✧', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.7)' },
  FIRE: { id: 'FIRE', name: 'Огненный эфир', icon: '🔥', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.7)' },
  WATER: { id: 'WATER', name: 'Ледяной исток', icon: '💧', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.7)' },
  AIR: { id: 'AIR', name: 'Грозовой заряд', icon: '⚡', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.7)' },
  EARTH: { id: 'EARTH', name: 'Земной резонанс', icon: '🌿', color: '#10b981', glow: 'rgba(16, 185, 129, 0.7)' }
};

// Символы Старшей Футарки для аутентичной гравировки
const RUNIC_ALPHABET = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'];

// Вспомогательные функции для плавной геометрии кубических кривых Безье в каналах
function getBezierPt(p0, cp1, cp2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x: mt2 * mt * p0.x + 3 * mt2 * t * cp1.x + 3 * mt * t2 * cp2.x + t2 * t * p3.x,
    y: mt2 * mt * p0.y + 3 * mt2 * t * cp1.y + 3 * mt * t2 * cp2.y + t2 * t * p3.y
  };
}

function getBezierTan(p0, cp1, cp2, p3, t) {
  const mt = 1 - t;
  return {
    x: -3 * mt * mt * p0.x + (3 * mt * mt - 6 * mt * t) * cp1.x + (6 * mt * t - 3 * t * t) * cp2.x + 3 * t * t * p3.x,
    y: -3 * mt * mt * p0.y + (3 * mt * mt - 6 * mt * t) * cp1.y + (6 * mt * t - 3 * t * t) * cp2.y + 3 * t * t * p3.y
  };
}

function drawFlowChevron(ctx, x, y, angle, size = 4.5, color = 'rgba(251, 191, 36, 0.85)') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(-size, -size * 0.75);
  ctx.lineTo(0, 0);
  ctx.lineTo(-size, size * 0.75);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.0;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.stroke();
  ctx.restore();
}

// Вспомогательная функция генерации всех возможных непересекающихся путей через кольца
function generateCandidatePaths(numRings, startSector, targetSector) {
  const paths = [];
  function backtrack(ringIdx, currentSector, currentSteps) {
    if (ringIdx === numRings) {
      if (currentSector === targetSector) {
        paths.push([...currentSteps]);
      }
      return;
    }
    // Прямой канал
    currentSteps.push({ r: ringIdx, s: currentSector, type: NODE_TYPES.STRAIGHT });
    backtrack(ringIdx + 1, currentSector, currentSteps);
    currentSteps.pop();

    // Поворот по часовой (+45°)
    currentSteps.push({ r: ringIdx, s: currentSector, type: NODE_TYPES.TURN_CW });
    backtrack(ringIdx + 1, (currentSector + 1) % 8, currentSteps);
    currentSteps.pop();

    // Поворот против часовой (-45°)
    currentSteps.push({ r: ringIdx, s: currentSector, type: NODE_TYPES.TURN_CCW });
    backtrack(ringIdx + 1, (currentSector + 7) % 8, currentSteps);
    currentSteps.pop();
  }
  backtrack(0, startSector, []);
  return paths;
}

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

    // Потоки маны и частицы
    this.activeBeams = [];
    this.impactPoints = [];
    this.particles = [];
    this.manaFlowTime = 0;

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
    this.boundWheel = this.onWheel.bind(this);
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
          <p class="stage-subtitle">Вращайте кольца печати, совмещая золотые желоба со светящимися лучами из ядра, чтобы замкнуть стихийные алтари.</p>
        </div>

        <!-- Подсказка для понимания правил -->
        <div class="runes-hint-banner">
          <span class="hint-icon">💡</span>
          <span class="hint-text">
            <strong>Как играть:</strong> Мана бьёт из центрального ядра по 4 направлениям. Поворачивайте кольца, чтобы золотые стрелочки-шевроны провели ток к цветным стихийным алтарям на внешнем ободе. Колёсико мыши или стрелки вращают выбранное кольцо.
          </span>
        </div>

        <div class="runes-layout">
          <!-- Холст арканного диска -->
          <div class="runes-canvas-wrapper">
            <canvas id="runesCanvas" class="game-canvas"></canvas>
          </div>

          <!-- Панель управления и статус печати -->
          <div class="runes-controls-panel">
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

            <!-- Статус стихийных алтарей -->
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
            <span class="guide-key">Колёсико мыши</span>
            <span>Быстрое вращение</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">ЛКМ / Свайп</span>
            <span>Вращение перетаскиванием</span>
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
    this.canvas.addEventListener('wheel', this.boundWheel, { passive: false });
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
  }

  onWheel(e) {
    if (this.isSolved || this.isFailed) return;
    e.preventDefault();
    const now = performance.now();
    if (this.lastWheelTime && now - this.lastWheelTime < 160) return;
    this.lastWheelTime = now;
    const dir = e.deltaY < 0 ? -45 : 45;
    this.rotateSelectedRing(dir);
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
      this.canvas.removeEventListener('wheel', this.boundWheel);
    }
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('resize', this.boundResize);
  }

  // =========================================================================
  // --- ПРОЦЕДУРНЫЙ ГЕНЕРАТОР ГОЛОВОЛОМКИ (100% ГАРАНТИЯ ПРОХОДИМОСТИ) ---
  // =========================================================================
  generateRunePuzzle() {
    this.isSolved = false;
    this.isFailed = false;
    this.particles = [];
    this.selectedRingIndex = 0;
    this.startTime = Date.now();

    const dc = dnd.dc || 15;

    // Градация сложности по DC:
    // DC <= 12: 2 кольца, 2 алтаря (быстрое и понятное введение)
    // DC 13-17: 3 кольца, 3 алтаря (умеренный вызов)
    // DC 18-22: 3 кольца, ВСЕ 4 алтаря (полная арканная печать)
    // DC >= 23: 4 кольца, ВСЕ 4 алтаря (легендарный архимагический замок)
    let numRings = 2;
    let activeCount = 2;

    if (dc >= 23) {
      numRings = 4;
      activeCount = 4;
    } else if (dc >= 18) {
      numRings = 3;
      activeCount = 4;
    } else if (dc >= 13) {
      numRings = 3;
      activeCount = 3;
    } else {
      numRings = 2;
      activeCount = 2;
    }

    // Все 4 стихийных алтаря строго в кардинальных точках: 0° (Огонь), 90° (Вода), 180° (Земля), 270° (Буря)
    const allAnchors = [
      { sector: 0, angle: 0, rune: '🔥', name: 'Алтарь Огня', defaultColor: '#ef4444', connected: false },
      { sector: 2, angle: 90, rune: '💧', name: 'Алтарь Вод', defaultColor: '#06b6d4', connected: false },
      { sector: 4, angle: 180, rune: '🌿', name: 'Алтарь Земли', defaultColor: '#10b981', connected: false },
      { sector: 6, angle: 270, rune: '⚡', name: 'Алтарь Бури', defaultColor: '#f59e0b', connected: false }
    ];

    if (activeCount === 4) {
      this.anchors = allAnchors.map(a => ({ ...a, connected: false }));
    } else {
      const shuffled = [...allAnchors].sort(() => Math.random() - 0.5);
      this.anchors = shuffled.slice(0, activeCount).sort((a, b) => a.sector - b.sector);
    }

    // Геометрия колец под размер холста
    const startR = 44;
    const endR = 172;
    const gap = numRings >= 4 ? 3 : 4;
    const totalAvailable = endR - startR - (numRings - 1) * gap;
    const ringThickness = Math.floor(totalAvailable / numRings);

    const ringNames = numRings === 2
      ? ['Внутреннее', 'Внешнее']
      : numRings === 3
        ? ['Внутреннее', 'Среднее', 'Внешнее']
        : ['Внутреннее', 'Среднее I', 'Среднее II', 'Внешнее'];

    this.rings = Array.from({ length: numRings }, (_, r) => {
      const innerR = startR + r * (ringThickness + gap);
      const outerR = innerR + ringThickness;
      const midR = (innerR + outerR) / 2;
      return {
        index: r,
        name: ringNames[r] || `Кольцо ${r + 1}`,
        innerR,
        outerR,
        midR,
        angle: 0,
        currentAngle: 0,
        sectors: Array.from({ length: 8 }, () => ({ type: NODE_TYPES.EMPTY })),
        runes: Array.from({ length: 8 }, (_, i) => RUNIC_ALPHABET[(r * 7 + i * 3) % RUNIC_ALPHABET.length]),
        coupledRing: null,
        coupledRatio: 0
      };
    });

    // Формирование пар эмиттер-алтарь без самопересечения в решенном состоянии
    const allowedShifts = (dc >= 16 && Math.random() > 0.4) ? [0, 2, 6] : [0];
    const netShift = allowedShifts[Math.floor(Math.random() * allowedShifts.length)];

    const pairs = this.anchors.map(a => ({
      emitter: (a.sector - netShift + 8) % 8,
      anchor: a.sector
    }));

    let success = false;
    let attempts = 0;
    while (!success && attempts < 150) {
      attempts++;
      this.rings.forEach(ring => {
        ring.sectors.forEach(s => { s.type = NODE_TYPES.EMPTY; });
      });

      let allPlaced = true;
      for (const pair of pairs) {
        const candidatePaths = generateCandidatePaths(numRings, pair.emitter, pair.anchor)
          .sort(() => Math.random() - 0.5);

        let placed = false;
        for (const path of candidatePaths) {
          const canPlace = path.every(step => this.rings[step.r].sectors[step.s].type === NODE_TYPES.EMPTY);
          if (canPlace) {
            path.forEach(step => {
              this.rings[step.r].sectors[step.s].type = step.type;
            });
            placed = true;
            break;
          }
        }
        if (!placed) {
          allPlaced = false;
          break;
        }
      }
      if (allPlaced) {
        success = true;
      }
    }

    // Запасной резервный fallback
    if (!success) {
      this.rings.forEach(ring => {
        ring.sectors.forEach(s => { s.type = NODE_TYPES.EMPTY; });
      });
      this.anchors.forEach(a => {
        for (let r = 0; r < numRings; r++) {
          this.rings[r].sectors[a.sector].type = NODE_TYPES.STRAIGHT;
        }
      });
    }

    // Добавляем богатый набор ложных каналов (STRAIGHT, TURN_CW, TURN_CCW)
    // Оставляем всего 1-2 пустых сектора на кольцо, чтобы диск выглядел целостно и требовал осмысленного решения
    this.rings.forEach(ring => {
      const empties = ring.sectors.map((s, idx) => idx).filter(idx => ring.sectors[idx].type === NODE_TYPES.EMPTY);
      empties.sort(() => Math.random() - 0.5);
      const keepEmpty = dc >= 18 ? (Math.random() > 0.5 ? 1 : 2) : 2;
      const decoysToAdd = Math.max(0, empties.length - keepEmpty);
      const decoyTypes = [NODE_TYPES.STRAIGHT, NODE_TYPES.TURN_CW, NODE_TYPES.TURN_CCW];

      for (let d = 0; d < decoysToAdd; d++) {
        const sec = empties[d];
        ring.sectors[sec].type = decoyTypes[Math.floor(Math.random() * decoyTypes.length)];
      }
    });

    // Перемешивание колец (Scramble) из гарантированно решенного состояния
    for (let r = 0; r < numRings; r++) {
      const shiftSteps = 1 + Math.floor(Math.random() * 7);
      this.applyRingRotation(r, shiftSteps * 45, false, true);
    }

    // Проверяем, чтобы головоломка не была случайно решена со старта
    this.traceManaBeams();
    let safetyTries = 0;
    while (this.checkWinCondition(false) && safetyTries < 10) {
      this.applyRingRotation(0, 45, false, true);
      this.traceManaBeams();
      safetyTries++;
    }

    this.renderRingSelectors();
    this.renderAnchorsHUD();
  }

  // Вращение кольца с плавной анимацией
  applyRingRotation(ringIdx, degDelta, playSound = true, snapImmediate = false) {
    const ring = this.rings[ringIdx];
    if (!ring) return;

    // Дискретный шаг 45 градусов
    ring.currentAngle = (Math.round((ring.currentAngle + degDelta) / 45) * 45 + 7200) % 360;

    if (snapImmediate) {
      ring.angle = ring.currentAngle;
    }

    if (playSound) {
      const pitch = 260 + ringIdx * 120;
      audio.playRuneHum(pitch, 0.22);
      audio.playTumblerClick(1.15);
    }
  }

  rotateSelectedRing(degDelta) {
    if (this.isSolved || this.isFailed) return;
    this.applyRingRotation(this.selectedRingIndex, degDelta, true, false);
    this.traceManaBeams();
    this.checkWinCondition(true);
  }

  // =========================================================================
  // --- ТРАССИРОВКА ЛУЧЕЙ МАНЫ (REAL-TIME CIRCUIT FLOW) ---
  // =========================================================================
  traceManaBeams() {
    this.activeBeams = [];
    this.impactPoints = [];
    this.activeEntropyHit = false;

    // Сбрасываем статус якорей
    this.anchors.forEach(a => { a.connected = false; });

    // Центр ядра
    const center = this.logicalSize / 2;
    const coreEmitters = [0, 2, 4, 6]; // 0°, 90°, 180°, 270°

    coreEmitters.forEach(emitterSector => {
      const startAngle = emitterSector * 45;
      const initialBeam = {
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

    if (!node || node.type === NODE_TYPES.EMPTY) {
      // Пустой сектор: луч упирается в камень и рассеивается
      const impactX = center + Math.cos(currentRad) * rIn;
      const impactY = center + Math.sin(currentRad) * rIn;

      beam.path.push({
        type: 'line',
        x1: center + Math.cos(currentRad) * (rIn - 2),
        y1: center + Math.sin(currentRad) * (rIn - 2),
        x2: impactX,
        y2: impactY
      });

      this.impactPoints.push({
        x: impactX,
        y: impactY,
        angle: currentRad,
        ringIdx: beam.ringIdx,
        color: '#38bdf8'
      });

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

    if (node.type === NODE_TYPES.TURN_CW) {
      // Плавный поворот по часовой стрелке (+45°)
      const nextSector = (beam.currentSector + 1) % 8;
      const nextRad = (nextSector * 45 * Math.PI) / 180;
      const dr = rOut - rIn;
      const k = dr * 0.45;

      const x0 = center + Math.cos(currentRad) * rIn;
      const y0 = center + Math.sin(currentRad) * rIn;
      const cp1x = x0 + Math.cos(currentRad) * k;
      const cp1y = y0 + Math.sin(currentRad) * k;

      const x1 = center + Math.cos(nextRad) * rOut;
      const y1 = center + Math.sin(nextRad) * rOut;
      const cp2x = x1 - Math.cos(nextRad) * k;
      const cp2y = y1 - Math.sin(nextRad) * k;

      beam.path.push({
        type: 'bezier',
        x0, y0, cp1x, cp1y, cp2x, cp2y, x1, y1
      });

      beam.currentSector = nextSector;
      beam.ringIdx++;
      this.propagateBeam(beam, center);
      return;
    }

    if (node.type === NODE_TYPES.TURN_CCW) {
      // Плавный поворот против часовой стрелки (-45°)
      const nextSector = (beam.currentSector - 1 + 8) % 8;
      const nextRad = (nextSector * 45 * Math.PI) / 180;
      const dr = rOut - rIn;
      const k = dr * 0.45;

      const x0 = center + Math.cos(currentRad) * rIn;
      const y0 = center + Math.sin(currentRad) * rIn;
      const cp1x = x0 + Math.cos(currentRad) * k;
      const cp1y = y0 + Math.sin(currentRad) * k;

      const x1 = center + Math.cos(nextRad) * rOut;
      const y1 = center + Math.sin(nextRad) * rOut;
      const cp2x = x1 - Math.cos(nextRad) * k;
      const cp2y = y1 - Math.sin(nextRad) * k;

      beam.path.push({
        type: 'bezier',
        x0, y0, cp1x, cp1y, cp2x, cp2y, x1, y1
      });

      beam.currentSector = nextSector;
      beam.ringIdx++;
      this.propagateBeam(beam, center);
      return;
    }

    if (node.type === NODE_TYPES.FORK) {
      // Развилка: один луч идет прямо, копия плавно ветвится вправо
      const branchSector = (beam.currentSector + 1) % 8;
      const branchRad = (branchSector * 45 * Math.PI) / 180;
      const dr = rOut - rIn;
      const k = dr * 0.45;

      const x0 = center + Math.cos(currentRad) * rIn;
      const y0 = center + Math.sin(currentRad) * rIn;
      const cp1x = x0 + Math.cos(currentRad) * k;
      const cp1y = y0 + Math.sin(currentRad) * k;

      const x1 = center + Math.cos(branchRad) * rOut;
      const y1 = center + Math.sin(branchRad) * rOut;
      const cp2x = x1 - Math.cos(branchRad) * k;
      const cp2y = y1 - Math.sin(branchRad) * k;

      const branchBeam = {
        currentSector: branchSector,
        ringIdx: beam.ringIdx + 1,
        path: [
          ...beam.path,
          {
            type: 'bezier',
            x0, y0, cp1x, cp1y, cp2x, cp2y, x1, y1
          }
        ]
      };
      this.propagateBeam(branchBeam, center);

      // Прямой ствол
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

    this.activeBeams.push(beam);
  }

  checkAnchorHit(beam, center) {
    const matchedAnchor = this.anchors.find(a => a.sector === beam.currentSector);
    if (!matchedAnchor) {
      // Луч вышел на периметр в секторе без алтаря
      const rad = (beam.currentSector * 45 * Math.PI) / 180;
      const lastRing = this.rings[this.rings.length - 1];
      const outX = center + Math.cos(rad) * lastRing.outerR;
      const outY = center + Math.sin(rad) * lastRing.outerR;
      this.impactPoints.push({
        x: outX,
        y: outY,
        angle: rad,
        ringIdx: this.rings.length - 1,
        color: '#38bdf8'
      });
      return;
    }

    // Луч дошел точно до сектора стихийного алтаря!
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

    beam.connectedAnchor = matchedAnchor;

    if (!matchedAnchor.connected) {
      matchedAnchor.connected = true;
      audio.playBalanceChime();
      this.spawnManaSparkles(matchedAnchor.angle, 25, matchedAnchor.defaultColor);
    } else {
      matchedAnchor.connected = true;
    }
  }

  // =========================================================================
  // --- ПРОВЕРКА УСЛОВИЯ ПОБЕДЫ ---
  // =========================================================================
  checkWinCondition(triggerSounds = true) {
    const allConnected = this.anchors.every(a => a.connected);

    if (!triggerSounds) {
      return allConnected;
    }

    if (allConnected && !this.isSolved) {
      this.isSolved = true;
      audio.playSuccess();
      audio.playResonanceSurge();

      for (let a = 0; a < 360; a += 30) {
        this.spawnManaSparkles(a, 15, '#e8c36a');
      }

      const timeSpent = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
      setTimeout(() => {
        this.app.finishGame(true, {
          timeSpent,
          mistakes: 0,
          noiseLevel: 0
        });
      }, 1300);
      return true;
    }
    return false;
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

    this.anchorsList.innerHTML = this.anchors.map(a => `
      <div class="anchor-status-item ${a.connected ? 'active' : ''}">
        <span class="anchor-rune" style="color: ${a.defaultColor}">${a.rune}</span>
        <div class="anchor-info-block">
          <span class="anchor-name">${a.name}</span>
          <span class="anchor-req">${a.connected ? 'Канал замкнут' : 'Ожидает поток маны'}</span>
        </div>
        <span class="anchor-badge">${a.connected ? '✓ Запитан' : '○ Нет связи'}</span>
      </div>
    `).join('');
  }

  // =========================================================================
  // --- МЫШЬ И СЕНСОРНОЕ ВРАЩЕНИЕ ---
  // =========================================================================
  onPointerDown(e) {
    if (this.isSolved || this.isFailed) return;
    const rect = this.canvas.getBoundingClientRect();
    const cx = this.logicalSize / 2;
    const cy = this.logicalSize / 2;
    const scaleX = this.logicalSize / rect.width;
    const scaleY = this.logicalSize / rect.height;
    const x = (e.clientX - rect.left) * scaleX - cx;
    const y = (e.clientY - rect.top) * scaleY - cy;
    const dist = Math.hypot(x, y);

    const foundRing = this.rings.find(r => dist >= r.innerR - 6 && dist <= r.outerR + 6);
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
    const cx = this.logicalSize / 2;
    const cy = this.logicalSize / 2;
    const scaleX = this.logicalSize / rect.width;
    const scaleY = this.logicalSize / rect.height;
    const x = (e.clientX - rect.left) * scaleX - cx;
    const y = (e.clientY - rect.top) * scaleY - cy;

    const currentAngle = Math.atan2(y, x) * (180 / Math.PI);
    let delta = currentAngle - this.dragStartAngle;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;

    // Плавное следование за курсором
    this.draggedRing.angle = (this.ringInitialAngle + delta + 7200) % 360;

    // Расчет ближайшего шага 45° для трассировки
    const discrete = (Math.round(this.draggedRing.angle / 45) * 45 + 7200) % 360;
    if (discrete !== this.draggedRing.currentAngle) {
      this.draggedRing.currentAngle = discrete;
      audio.playTumblerClick(1.0);
      this.traceManaBeams();
    }
  }

  onPointerUp() {
    if (!this.draggedRing) return;
    const snapped = (Math.round(this.draggedRing.angle / 45) * 45 + 7200) % 360;
    this.draggedRing.currentAngle = snapped;
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

    // Плавная и сочная анимация доводки колец к целевому углу
    if (!this.draggedRing) {
      this.rings.forEach(ring => {
        let diff = (ring.currentAngle - ring.angle + 7200) % 360;
        if (diff > 180) diff -= 360;
        if (Math.abs(diff) > 0.15) {
          ring.angle = (ring.angle + diff * 0.22 + 7200) % 360;
        } else {
          ring.angle = ring.currentAngle;
        }
      });
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

    // 2. Кольца, каналы и проводники
    this.rings.forEach(ring => this.drawRing(ctx, cx, cy, ring));

    // 3. Живые светящиеся потоки маны
    this.drawActiveBeams(ctx);

    // 3.1. Маяки точек удара маны (показывают, куда направить желоб)
    this.drawImpactBeacons(ctx);

    // 4. Пульсирующее арканное ядро
    this.drawCentralCore(ctx, cx, cy);

    // 5. Стихийные алтари по краям с направляющими рельсами
    this.drawAnchors(ctx, cx, cy);

    // 6. Магические искры
    this.drawParticles(ctx);

    ctx.restore();
  }

  drawBackground(ctx, cx, cy, size) {
    const bgGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, size / 2);
    bgGrad.addColorStop(0, '#0d111e');
    bgGrad.addColorStop(0.6, '#080a13');
    bgGrad.addColorStop(1, '#020306');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // Внешний декоративный арканный обод
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.44, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Тонкие кардинальные засечки 0°, 90°, 180°, 270°
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
    ctx.lineWidth = 1;
    [0, 90, 180, 270].forEach(deg => {
      const rad = (deg * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rad) * 38, cy + Math.sin(rad) * 38);
      ctx.lineTo(cx + Math.cos(rad) * (size * 0.44), cy + Math.sin(rad) * (size * 0.44));
      ctx.stroke();
    });
  }

  drawRing(ctx, cx, cy, ring) {
    ctx.save();
    const isSelected = (ring.index === this.selectedRingIndex);

    // 1. Тело кольца печати (глубокий обсидиан)
    ctx.beginPath();
    ctx.arc(cx, cy, ring.outerR, 0, Math.PI * 2);
    ctx.arc(cx, cy, ring.innerR, 0, Math.PI * 2, true);
    ctx.fillStyle = isSelected ? 'rgba(30, 41, 59, 0.78)' : 'rgba(15, 23, 42, 0.68)';
    ctx.fill();

    // 2. Металлические ободья кольца
    ctx.beginPath();
    ctx.arc(cx, cy, ring.outerR, 0, Math.PI * 2);
    ctx.arc(cx, cy, ring.innerR, 0, Math.PI * 2);
    ctx.strokeStyle = isSelected ? '#f59e0b' : 'rgba(212, 175, 55, 0.38)';
    ctx.lineWidth = isSelected ? 2.5 : 1.2;
    if (isSelected) {
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Вращаем холст под текущий угол поворота кольца
    ctx.translate(cx, cy);
    ctx.rotate((ring.angle * Math.PI) / 180);

    // 3. Аккуратные механические засечки 8 секторов (0°, 45°, 90°...)
    for (let s = 0; s < 8; s++) {
      const notchRad = (s * 45 * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(Math.cos(notchRad) * (ring.innerR - 1), Math.sin(notchRad) * (ring.innerR - 1));
      ctx.lineTo(Math.cos(notchRad) * (ring.innerR + 5), Math.sin(notchRad) * (ring.innerR + 5));
      ctx.moveTo(Math.cos(notchRad) * (ring.outerR - 5), Math.sin(notchRad) * (ring.outerR - 5));
      ctx.lineTo(Math.cos(notchRad) * (ring.outerR + 1), Math.sin(notchRad) * (ring.outerR + 1));
      ctx.strokeStyle = isSelected ? 'rgba(251, 191, 36, 0.6)' : 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // 4. Отрисовка желобов каналов и магических элементов
    ring.sectors.forEach((node, s) => {
      this.drawNodeElement(ctx, ring, node, s, isSelected);
    });

    ctx.restore();
  }

  drawNodeElement(ctx, ring, node, s, isSelected) {
    if (node.type === NODE_TYPES.EMPTY) return;

    const rad = (s * 45 * Math.PI) / 180;
    const rIn = ring.innerR;
    const rOut = ring.outerR;
    const rMid = ring.midR;
    const dr = rOut - rIn;
    const k = dr * 0.45;

    // Масштабирование толщины линий и стрелок под ширину обода кольца
    const chevronSize = Math.max(2.8, Math.min(4.2, dr * 0.09));
    const bedWidth = Math.max(9, Math.min(14, dr * 0.32));
    const rimWidth = Math.max(6.5, Math.min(10, dr * 0.23));
    const innerWidth = Math.max(3.8, Math.min(6, dr * 0.14));
    const tubeWidth = Math.max(1.6, Math.min(2.5, dr * 0.06));

    // Геометрия Безье для поворотов
    let p0, cp1, cp2, p3;
    if (node.type === NODE_TYPES.TURN_CW) {
      const nextRad = ((s + 1) * 45 * Math.PI) / 180;
      p0 = { x: Math.cos(rad) * rIn, y: Math.sin(rad) * rIn };
      cp1 = { x: p0.x + Math.cos(rad) * k, y: p0.y + Math.sin(rad) * k };
      p3 = { x: Math.cos(nextRad) * rOut, y: Math.sin(nextRad) * rOut };
      cp2 = { x: p3.x - Math.cos(nextRad) * k, y: p3.y - Math.sin(nextRad) * k };
    } else if (node.type === NODE_TYPES.TURN_CCW) {
      const nextRad = ((s - 1) * 45 * Math.PI) / 180;
      p0 = { x: Math.cos(rad) * rIn, y: Math.sin(rad) * rIn };
      cp1 = { x: p0.x + Math.cos(rad) * k, y: p0.y + Math.sin(rad) * k };
      p3 = { x: Math.cos(nextRad) * rOut, y: Math.sin(nextRad) * rOut };
      cp2 = { x: p3.x - Math.cos(nextRad) * k, y: p3.y - Math.sin(nextRad) * k };
    } else if (node.type === NODE_TYPES.FORK) {
      const nextRad = ((s + 1) * 45 * Math.PI) / 180;
      p0 = { x: Math.cos(rad) * rIn, y: Math.sin(rad) * rIn };
      cp1 = { x: p0.x + Math.cos(rad) * k, y: p0.y + Math.sin(rad) * k };
      p3 = { x: Math.cos(nextRad) * rOut, y: Math.sin(nextRad) * rOut };
      cp2 = { x: p3.x - Math.cos(nextRad) * k, y: p3.y - Math.sin(nextRad) * k };
    }

    const renderPath = () => {
      ctx.beginPath();
      if (node.type === NODE_TYPES.STRAIGHT) {
        ctx.moveTo(Math.cos(rad) * rIn, Math.sin(rad) * rIn);
        ctx.lineTo(Math.cos(rad) * rOut, Math.sin(rad) * rOut);
      } else if (node.type === NODE_TYPES.TURN_CW || node.type === NODE_TYPES.TURN_CCW) {
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p3.x, p3.y);
      } else if (node.type === NODE_TYPES.FORK) {
        // Прямой ствол
        ctx.moveTo(Math.cos(rad) * rIn, Math.sin(rad) * rIn);
        ctx.lineTo(Math.cos(rad) * rOut, Math.sin(rad) * rOut);
        // Ветвление вправо
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p3.x, p3.y);
      }
    };

    // --- СЛОИ ЖЕЛОБА-ПРОВОДНИКА ---
    // 1. Внешняя глубокая тёмная постель желоба
    renderPath();
    ctx.strokeStyle = 'rgba(7, 9, 15, 0.95)';
    ctx.lineWidth = bedWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 2. Металлические латунные бортики
    renderPath();
    ctx.strokeStyle = isSelected ? 'rgba(245, 158, 11, 0.85)' : 'rgba(212, 175, 55, 0.65)';
    ctx.lineWidth = rimWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 3. Внутренняя полость канала
    renderPath();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.lineWidth = innerWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 4. Светящаяся кристаллическая трубка (хорошо заметна даже без запитки маной!)
    renderPath();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = tubeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // --- ШЕВРОНЫ НАПРАВЛЕНИЯ ПОТОКА (УКАЗЫВАЮТ КУДА ТЕЧЕТ ТОК) ---
    const chevronColor = isSelected ? 'rgba(251, 191, 36, 0.9)' : 'rgba(212, 175, 55, 0.75)';

    if (node.type === NODE_TYPES.STRAIGHT) {
      const r1 = rIn + dr * 0.35;
      const r2 = rIn + dr * 0.7;
      drawFlowChevron(ctx, Math.cos(rad) * r1, Math.sin(rad) * r1, rad, chevronSize, chevronColor);
      drawFlowChevron(ctx, Math.cos(rad) * r2, Math.sin(rad) * r2, rad, chevronSize, chevronColor);
    } else if (node.type === NODE_TYPES.TURN_CW || node.type === NODE_TYPES.TURN_CCW) {
      [0.35, 0.7].forEach(t => {
        const pt = getBezierPt(p0, cp1, cp2, p3, t);
        const tan = getBezierTan(p0, cp1, cp2, p3, t);
        const ang = Math.atan2(tan.y, tan.x);
        drawFlowChevron(ctx, pt.x, pt.y, ang, chevronSize, chevronColor);
      });
    } else if (node.type === NODE_TYPES.FORK) {
      // Прямой ствол
      const r1 = rIn + dr * 0.4;
      const r2 = rIn + dr * 0.75;
      drawFlowChevron(ctx, Math.cos(rad) * r1, Math.sin(rad) * r1, rad, chevronSize * 0.9, chevronColor);
      drawFlowChevron(ctx, Math.cos(rad) * r2, Math.sin(rad) * r2, rad, chevronSize * 0.9, chevronColor);
      // Ветвь
      const pt = getBezierPt(p0, cp1, cp2, p3, 0.65);
      const tan = getBezierTan(p0, cp1, cp2, p3, 0.65);
      drawFlowChevron(ctx, pt.x, pt.y, Math.atan2(tan.y, tan.x), chevronSize * 0.9, chevronColor);
    }

    // --- КОНТАКТНЫЕ ПОРТЫ НА ОБОДЬЯХ КОЛЬЦА ---
    const portR = Math.max(3.2, Math.min(4.5, dr * 0.11));
    const innerPortR = portR * 0.5;

    const drawPort = (radius, angle) => {
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(px, py, portR, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = isSelected ? '#fbbf24' : '#d4af37';
      ctx.lineWidth = 1.6;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, py, innerPortR, 0, Math.PI * 2);
      ctx.fillStyle = '#fde047';
      ctx.fill();
    };

    if (node.type === NODE_TYPES.STRAIGHT) {
      drawPort(rIn, rad);
      drawPort(rOut, rad);
    } else if (node.type === NODE_TYPES.TURN_CW) {
      drawPort(rIn, rad);
      drawPort(rOut, ((s + 1) * 45 * Math.PI) / 180);
    } else if (node.type === NODE_TYPES.TURN_CCW) {
      drawPort(rIn, rad);
      drawPort(rOut, ((s - 1) * 45 * Math.PI) / 180);
    } else if (node.type === NODE_TYPES.FORK) {
      drawPort(rIn, rad);
      drawPort(rOut, rad);
      drawPort(rOut, ((s + 1) * 45 * Math.PI) / 180);
    }
  }

  // Отрисовка маяков точек удара маны (куда бьёт луч)
  drawImpactBeacons(ctx) {
    if (!this.impactPoints || this.impactPoints.length === 0) return;
    const pulse = Math.sin(this.manaFlowTime * 6) * 2.5;

    this.impactPoints.forEach(pt => {
      ctx.save();

      // 1. Пульсирующий внешний ореол точки рассеивания маны
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = pt.color;
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = 16;
      ctx.globalAlpha = 0.6;
      ctx.fill();

      // 2. Яркое горячее белое ядро удара
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 1.0;
      ctx.fill();

      // 3. Расходящиеся искры
      const sparkAng = pt.angle + Math.PI;
      ctx.strokeStyle = pt.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6 + pulse * 0.5, sparkAng - 0.7, sparkAng + 0.7);
      ctx.stroke();

      ctx.restore();
    });
  }

  drawActiveBeams(ctx) {
    if (!this.activeBeams || this.activeBeams.length === 0) return;

    this.activeBeams.forEach(beam => {
      const isConnected = !!beam.connectedAnchor;
      const beamColor = isConnected ? beam.connectedAnchor.defaultColor : '#38bdf8';

      beam.path.forEach(seg => {
        ctx.save();
        ctx.beginPath();

        if (seg.type === 'line') {
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        } else if (seg.type === 'bezier') {
          ctx.moveTo(seg.x0, seg.y0);
          ctx.bezierCurveTo(seg.cp1x, seg.cp1y, seg.cp2x, seg.cp2y, seg.x1, seg.y1);
        } else if (seg.type === 'arc') {
          ctx.arc(seg.cx, seg.cy, seg.r, seg.startA, seg.endA, seg.ccw);
        }

        // 1. Внешнее неоновое свечение
        ctx.strokeStyle = beamColor;
        ctx.shadowColor = beamColor;
        ctx.shadowBlur = isConnected ? 18 : 10;
        ctx.lineWidth = isConnected ? 6.5 : 4.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 2. Белое горячее ядро луча
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = isConnected ? 2.8 : 1.8;
        ctx.stroke();

        // 3. Бегущие искры тока маны
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([8, 14]);
        ctx.lineDashOffset = -this.manaFlowTime * 40;
        ctx.stroke();

        ctx.restore();
      });
    });
  }

  drawCentralCore(ctx, cx, cy) {
    ctx.save();
    const pulse = Math.sin(this.manaFlowTime * 2.5) * 3.5;
    const r = 26 + pulse;

    // 4 Направленных фокусирующих сопла эмиттеров маны
    [0, 90, 180, 270].forEach(deg => {
      const rad = (deg * Math.PI) / 180;
      const ex = cx + Math.cos(rad) * (r + 4);
      const ey = cy + Math.sin(rad) * (r + 4);

      // Оправа сопла
      ctx.beginPath();
      ctx.arc(ex, ey, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.6;
      ctx.fill();
      ctx.stroke();

      // Светящаяся линза эмиттера
      ctx.beginPath();
      ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fill();
    });

    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 24;

    const coreGrad = ctx.createRadialGradient(cx, cy, 3, cx, cy, r);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, '#38bdf8');
    coreGrad.addColorStop(0.7, '#8b5cf6');
    coreGrad.addColorStop(1, '#1e0840');

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Оправа ядра
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Центральный глиф источника
    ctx.font = '18px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.fillText('✧', cx, cy);

    ctx.restore();
  }

  drawAnchors(ctx, cx, cy) {
    const endR = this.logicalSize * 0.44;
    const lastRing = this.rings[this.rings.length - 1];

    this.anchors.forEach(anchor => {
      const rad = (anchor.angle * Math.PI) / 180;
      const ax = cx + Math.cos(rad) * endR;
      const ay = cy + Math.sin(rad) * endR;

      ctx.save();

      // 1. Направляющий энергетический рельс от внешнего кольца к алтарю
      if (lastRing) {
        const rStart = lastRing.outerR + 3;
        const rEnd = endR - 22;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(rad) * rStart, cy + Math.sin(rad) * rStart);
        ctx.lineTo(cx + Math.cos(rad) * rEnd, cy + Math.sin(rad) * rEnd);
        if (anchor.connected) {
          ctx.strokeStyle = anchor.defaultColor;
          ctx.lineWidth = 3.5;
          ctx.shadowColor = anchor.defaultColor;
          ctx.shadowBlur = 16;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 4]);
        }
        ctx.stroke();
      }

      // 2. Постамент алтаря
      ctx.beginPath();
      ctx.arc(ax, ay, 20, 0, Math.PI * 2);
      ctx.globalAlpha = 1.0;

      if (anchor.connected) {
        ctx.shadowColor = anchor.defaultColor;
        ctx.shadowBlur = 24;
        ctx.fillStyle = anchor.defaultColor;
      } else {
        ctx.fillStyle = '#0f172a';
      }
      ctx.fill();

      ctx.strokeStyle = anchor.defaultColor;
      ctx.lineWidth = anchor.connected ? 3.5 : 2;
      ctx.stroke();

      // Внутреннее светящееся кольцо при активности
      if (anchor.connected) {
        ctx.beginPath();
        ctx.arc(ax, ay, 15, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Стихийный символ
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(anchor.rune, ax, ay);

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