/**
 * Модуль мини-игры: Магические руны (Arcane Runes)
 * Концентрический рунический диск с вращающимися кольцами, световыми каналами маны,
 * элементальными якорями и процедурным магическим свечением.
 */

import { audio } from '../audio.js';
import { dnd } from '../dnd-engine.js';

export class RunesGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;

    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;

    // Параметры колец
    this.rings = [];
    this.anchors = [];
    this.selectedRingIndex = 0;
    this.isSolved = false;
    this.particles = [];
    this.manaFlowTime = 0;

    // Взаимодействие
    this.draggedRing = null;
    this.dragStartAngle = 0;
    this.ringInitialAngle = 0;

    // Привязанные события
    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
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
          <h2 class="stage-title">🔮 Магические руны</h2>
          <p class="stage-subtitle">Вращайте кольца арканной печати, чтобы замкнуть поток маны от ядра к стихийным якорям.</p>
        </div>

        <div class="runes-layout">
          <!-- Холст рунического диска -->
          <div class="runes-canvas-wrapper">
            <canvas id="runesCanvas" class="game-canvas"></canvas>
          </div>

          <!-- Панель управления кольцами -->
          <div class="runes-controls-panel">
            <div class="ring-selector-hud">
              <span class="hud-label">Управление кольцами:</span>
              <div class="ring-buttons" id="ringSelectorBtns">
                <!-- Генерируется динамически под число колец -->
              </div>
            </div>

            <div class="ring-turn-actions">
              <button type="button" class="btn fantasy-btn secondary turn-btn" id="btnRotateCCW">
                <span>↺</span> Влево (45°)
              </button>
              <button type="button" class="btn fantasy-btn primary turn-btn" id="btnRotateCW">
                <span>↻</span> Вправо (45°)
              </button>
            </div>

            <!-- Статус соединения стихийных узлов -->
            <div class="anchors-status-card" id="anchorsStatusBox">
              <h4 class="anchors-title">Стихийные якоря печати:</h4>
              <div class="anchors-list" id="anchorsList">
                <!-- Якоря: Огонь, Вода, Воздух, Земля -->
              </div>
            </div>
          </div>
        </div>

        <div class="lock-controls-guide" style="margin-top: 14px;">
          <div class="guide-pill">
            <span class="guide-key">Клик / Перетаскивание</span>
            <span>Вращать кольцо пальцем или мыraw</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">Кнопки ↺ / ↻</span>
            <span>Точный поворот на шаг</span>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#runesCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.ringSelectorBtns = this.container.querySelector('#ringSelectorBtns');
    this.anchorsList = this.container.querySelector('#anchorsList');
    this.btnRotateCCW = this.container.querySelector('#btnRotateCCW');
    this.btnRotateCW = this.container.querySelector('#btnRotateCW');
  }

  setupCanvas() {
    if (!this.canvas) return;
    const size = Math.min(460, Math.min(window.innerWidth - 48, 460));
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
    window.addEventListener('resize', this.boundResize);

    if (this.btnRotateCCW) {
      this.btnRotateCCW.addEventListener('click', () => this.rotateSelectedRing(-45));
    }
    if (this.btnRotateCW) {
      this.btnRotateCW.addEventListener('click', () => this.rotateSelectedRing(45));
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
    window.removeEventListener('resize', this.boundResize);
  }

  // --- ГЕНЕРАЦИЯ ГОЛОВОЛОМКИ РУНИЧЕСКОГО КОЛЬЦА ---
  generateRunePuzzle() {
    this.isSolved = false;
    this.particles = [];
    this.selectedRingIndex = 0;

    // Сложность определяет число колец и форму каналов
    const numRings = dnd.dc <= 13 ? 2 : dnd.dc <= 20 ? 3 : 4;
    const availableRunes = ['ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᛃ', 'ᛈ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛞ', 'ᛟ'];

    // 4 Стихийных якоря по периметру (0°, 90°, 180°, 270°)
    const anchorData = [
      { angle: 0, rune: '🔥', name: 'Огонь', color: '#ef4444', connected: false },
      { angle: 90, rune: '💧', name: 'Вода', color: '#3b82f6', connected: false },
      { angle: 180, rune: '🌿', name: 'Земля', color: '#10b981', connected: false },
      { angle: 270, rune: '⚡', name: 'Воздух', color: '#f59e0b', connected: false }
    ];

    // При легком DC активны 2-3 якоря, при высоком — все 4
    const activeAnchorsCount = dnd.dc <= 12 ? 2 : dnd.dc <= 17 ? 3 : 4;
    this.anchors = anchorData.slice(0, activeAnchorsCount);

    // Создаем кольца
    this.rings = [];
    const baseRadius = 55;
    const ringThickness = 42;

    for (let i = 0; i < numRings; i++) {
      const innerR = baseRadius + i * ringThickness;
      const outerR = innerR + ringThickness - 4;

      // Генерируем 8 возможных сегментов (шаг 45 градусов: 0, 45, 90... 315)
      // В целевом состоянии (targetAngle = 0) каналы совмещены с якорями!
      const targetSegments = this.anchors.map(a => a.angle);
      // Добавляем пару случайных ответвлений для разнообразия
      if (Math.random() > 0.4) targetSegments.push((targetSegments[0] + 135) % 360);

      // Стартовый угол поворота сдвинут случайно на несколько шагов по 45 градусов
      const randomSteps = Math.floor(Math.random() * 6) + 1;
      const startAngle = (randomSteps * 45) % 360;

      // Рунические символы на кольце
      const runes = [];
      for (let s = 0; s < 8; s++) {
        runes.push(availableRunes[(i * 5 + s) % availableRunes.length]);
      }

      this.rings.push({
        index: i,
        name: i === 0 ? 'Внутреннее' : i === 1 ? 'Среднее' : i === 2 ? 'Внешнее' : 'Эфирное',
        innerR,
        outerR,
        currentAngle: startAngle,
        targetAngle: 0, // Угол верного совмещения
        angle: startAngle, // Текущий угол отображения
        conduits: targetSegments,
        runes
      });
    }

    this.renderRingSelectors();
    this.checkConnections();
    this.renderAnchorsHUD();
  }

  renderRingSelectors() {
    if (!this.ringSelectorBtns) return;
    this.ringSelectorBtns.innerHTML = this.rings.map((ring, idx) => `
      <button type="button" class="ring-btn ${idx === this.selectedRingIndex ? 'active' : ''}" data-ring="${idx}">
        ${ring.name}
      </button>
    `).join('');

    this.ringSelectorBtns.querySelectorAll('.ring-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedRingIndex = parseInt(btn.dataset.ring, 10);
        this.updateRingSelectionUI();
        audio.playTumblerClick(1.2);
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
    this.anchorsList.innerHTML = this.anchors.map((a, i) => `
      <div class="anchor-status-item ${a.connected ? 'active' : ''}" id="anchor-item-${i}">
        <span class="anchor-rune" style="color: ${a.color}">${a.rune}</span>
        <span class="anchor-name">${a.name}</span>
        <span class="anchor-badge">${a.connected ? '✓ Замкнут' : '○ Разомкнут'}</span>
      </div>
    `).join('');
  }

  rotateSelectedRing(degDelta) {
    if (this.isSolved) return;
    const ring = this.rings[this.selectedRingIndex];
    if (!ring) return;

    ring.angle = (ring.angle + degDelta + 360) % 360;
    ring.currentAngle = Math.round(ring.angle / 45) * 45;

    // Звук рунического гула
    const pitch = 300 + this.selectedRingIndex * 140;
    audio.playRuneHum(pitch, 0.22);

    this.checkConnections();
  }

  // --- ВЗАИМОДЕЙСТВИЕ МЫШЬЮ И ПАЛЬЦЕМ ---
  onPointerDown(e) {
    if (this.isSolved) return;
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    const dist = Math.hypot(x, y);

    // Находим, по какому кольцу кликнули
    const foundRing = this.rings.find(r => dist >= r.innerR && dist <= r.outerR);
    if (foundRing) {
      this.draggedRing = foundRing;
      this.selectedRingIndex = foundRing.index;
      this.updateRingSelectionUI();

      this.dragStartAngle = Math.atan2(y, x) * (180 / Math.PI);
      this.ringInitialAngle = foundRing.angle;
      audio.playTumblerClick(1.3);
    }
  }

  onPointerMove(e) {
    if (!this.draggedRing || this.isSolved) return;
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
    // Привязка к ближайшим 45 градусам (snap to 45 deg)
    const snapped = Math.round(this.draggedRing.angle / 45) * 45;
    this.draggedRing.angle = (snapped + 360) % 360;
    this.draggedRing.currentAngle = this.draggedRing.angle;

    const pitch = 300 + this.draggedRing.index * 140;
    audio.playRuneHum(pitch, 0.18);

    this.draggedRing = null;
    this.checkConnections();
  }

  // --- ПРОВЕРКА СОЕДИНЕНИЯ КАНАЛОВ И ПОБЕДЫ ---
  checkConnections() {
    let allConnected = true;

    this.anchors.forEach(anchor => {
      // Луч идет от центра наружу по углу anchor.angle
      // На каждом кольце в этот угол должен попадать один из conduits с учетом угла поворота кольца
      let connectedThroughAll = true;

      for (const ring of this.rings) {
        // Угол сегмента на кольце относительно нулевого меридиана
        let hasChannel = false;
        for (const conduit of ring.conduits) {
          const worldConduitAngle = (conduit + ring.currentAngle + 360) % 360;
          const diff = Math.abs(worldConduitAngle - anchor.angle);
          if (diff <= 10 || diff >= 350) {
            hasChannel = true;
            break;
          }
        }
        if (!hasChannel) {
          connectedThroughAll = false;
          break;
        }
      }

      const wasConnected = anchor.connected;
      anchor.connected = connectedThroughAll;

      if (!wasConnected && connectedThroughAll) {
        // Якорь только что активировался!
        audio.playMagicChime(1.2);
        this.spawnManaSparkles(anchor.angle);
      }

      if (!connectedThroughAll) {
        allConnected = false;
      }
    });

    this.renderAnchorsHUD();

    if (allConnected && !this.isSolved) {
      this.triggerSolveSuccess();
    }
  }

  triggerSolveSuccess() {
    this.isSolved = true;
    audio.playSuccess();
    audio.playMagicChime(1.5);

    // Взрыв магических искр
    for (let a = 0; a < 360; a += 30) {
      this.spawnManaSparkles(a, 15);
    }

    setTimeout(() => {
      this.app.finishGame(true);
    }, 1200);
  }

  spawnManaSparkles(angleDeg, count = 20) {
    const rad = (angleDeg * Math.PI) / 180;
    const center = this.logicalSize / 2;
    const targetR = this.logicalSize * 0.44;
    const originX = center + Math.cos(rad) * targetR;
    const originY = center + Math.sin(rad) * targetR;

    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        color: Math.random() > 0.5 ? '#e8c36a' : '#8b5cf6',
        size: 2.5 + Math.random() * 3,
        life: 1,
        decay: 0.025 + Math.random() * 0.03
      });
    }
  }

  // --- АНИМАЦИОННЫЙ ЦИКЛ ---
  startAnimationLoop() {
    const loop = (timestamp) => {
      this.update(timestamp);
      this.draw();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  update(timestamp) {
    this.manaFlowTime += 0.04;

    // Плавная доводка колец до дискретного угла, если не перетаскиваются
    if (!this.draggedRing) {
      this.rings.forEach(ring => {
        let diff = ring.currentAngle - ring.angle;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        ring.angle += diff * 0.25;
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

    // 1. Космический/мистический фон печати
    this.drawBackground(ctx, cx, cy, size);

    // 2. Отрисовка концентрических колец и рун
    this.rings.forEach(ring => this.drawRing(ctx, cx, cy, ring));

    // 3. Линии потока маны
    this.drawManaChannels(ctx, cx, cy);

    // 4. Центральное пульсирующее арканное ядро
    this.drawCentralCore(ctx, cx, cy);

    // 5. Внешние стихийные якоря
    this.drawAnchors(ctx, cx, cy);

    // 6. Магические искры
    this.drawParticles(ctx);

    ctx.restore();
  }

  drawBackground(ctx, cx, cy, size) {
    // Темная каменная плита
    const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, size / 2);
    bgGrad.addColorStop(0, '#121420');
    bgGrad.addColorStop(0.7, '#0b0c14');
    bgGrad.addColorStop(1, '#05060a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // Тонкие астрологические контуры
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.lineWidth = 1;
    for (let r = 80; r < size / 2 - 20; r += 45) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  drawRing(ctx, cx, cy, ring) {
    ctx.save();
    const isSelected = (ring.index === this.selectedRingIndex);

    // Обод кольца
    ctx.beginPath();
    ctx.arc(cx, cy, ring.outerR, 0, Math.PI * 2);
    ctx.arc(cx, cy, ring.innerR, 0, Math.PI * 2, true);
    ctx.fillStyle = isSelected ? 'rgba(40, 44, 65, 0.7)' : 'rgba(25, 28, 42, 0.55)';
    ctx.fill();

    ctx.strokeStyle = isSelected ? 'rgba(212, 175, 55, 0.8)' : 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.stroke();

    // Вращение кольца для рун и каналов
    ctx.translate(cx, cy);
    ctx.rotate((ring.angle * Math.PI) / 180);

    // Руны на кольце
    ctx.font = '13px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isSelected ? '#ffd666' : 'rgba(220, 225, 240, 0.6)';

    const midR = (ring.innerR + ring.outerR) / 2;
    for (let s = 0; s < 8; s++) {
      const segAngle = (s * 45 * Math.PI) / 180;
      const rx = Math.cos(segAngle) * midR;
      const ry = Math.sin(segAngle) * midR;
      ctx.fillText(ring.runes[s], rx, ry);
    }

    // Радиальные пазы каналов маны
    ring.conduits.forEach(cAngle => {
      const rad = (cAngle * Math.PI) / 180;
      const x1 = Math.cos(rad) * ring.innerR;
      const y1 = Math.sin(rad) * ring.innerR;
      const x2 = Math.cos(rad) * ring.outerR;
      const y2 = Math.sin(rad) * ring.outerR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Светящийся центр канала
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.restore();
  }

  drawManaChannels(ctx, cx, cy) {
    // Если якорь соединен, рисуем непрерывный сияющий луч маны от ядра к якорю
    this.anchors.forEach(anchor => {
      if (!anchor.connected) return;

      const rad = (anchor.angle * Math.PI) / 180;
      const endR = this.logicalSize * 0.44;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(rad) * endR, cy + Math.sin(rad) * endR);

      // Неоновое свечение
      ctx.shadowColor = anchor.color;
      ctx.shadowBlur = 18;
      ctx.strokeStyle = anchor.color;
      ctx.lineWidth = 6;
      ctx.stroke();

      // Белое ядро луча
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.restore();
    });
  }

  drawCentralCore(ctx, cx, cy) {
    ctx.save();
    const pulse = Math.sin(this.manaFlowTime * 2) * 3;
    const r = 32 + pulse;

    // Внешнее свечение ядра
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 20;

    const coreGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, r);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, '#c084fc');
    coreGrad.addColorStop(0.8, '#7e22ce');
    coreGrad.addColorStop(1, '#3b0764');

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Магический символ в центре
    ctx.font = '20px serif';
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
        ctx.shadowColor = anchor.color;
        ctx.shadowBlur = 16;
        ctx.fillStyle = anchor.color;
      } else {
        ctx.fillStyle = '#1e2230';
      }
      ctx.fill();

      ctx.strokeStyle = anchor.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Иконка стихии
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

  reset() {
    this.generateRunePuzzle();
  }

  onParametersChanged() {
    this.generateRunePuzzle();
  }
}
