/**
 * Модуль мини-игры: Обезвреживание ловушки (Trap Disarming)
 * Аутентичная D&D механика: натянутые стальные тросы, медные струны-растяжки,
 * трубки ядовитого газа, противовесы лезвий и переключаемый стопорный клин (шплинт).
 */

import { audio } from '../audio.js';
import { dnd } from '../dnd-engine.js';

export class TrapGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;

    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;

    // Параметры механизма ловушки
    this.wires = []; // массив спусковых жил / тросов
    this.rules = []; // текстовые правила обезвреживания
    this.disarmedWiresCount = 0;
    this.targetCutsRequired = 3;
    this.pressure = 65; // Натяжение / давление 0..100%
    this.pressureTarget = 65;
    this.isBypassActive = false; // Установлен ли стопорный клин (Toggle)
    this.isDisarmed = false;
    this.isDetonated = false;

    // Взаимодействие и визуальные эффекты
    this.hoveredWire = null;
    this.particles = [];
    this.shakeAmount = 0;
    this.corePulse = 0;

    // Привязанные события
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseDown = this.onMouseDown.bind(this);
    this.boundMouseLeave = this.onMouseLeave.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundResize = this.setupCanvas.bind(this);
  }

  init() {
    this.renderDOM();
    this.setupCanvas();
    this.bindEvents();
    this.generateTrapPuzzle();
    this.startAnimationLoop();
  }

  renderDOM() {
    this.container.innerHTML = `
      <div class="stage-container trap-stage">
        <div class="stage-header">
          <h2 class="stage-title">💣 Обезвреживание ловушки</h2>
          <p class="stage-subtitle">Изучите спусковой механизм и перекусите натянутые жилы в верной последовательности.</p>
        </div>

        <div class="trap-layout">
          <!-- Левая панель: Свиток с описанием механизма и правилами -->
          <div class="trap-scroll-panel" id="trapRulesPanel">
            <div class="scroll-header">
              <span class="scroll-icon">📜</span>
              <h3 class="scroll-title">Памятка вора: Схема механизма</h3>
            </div>
            <div class="scroll-clues" id="trapCluesList">
              <!-- Генерируется динамически -->
            </div>
            <div class="thief-intuition" id="thiefIntuitionBox">
              <span class="intuition-icon">💡</span>
              <span class="intuition-text" id="intuitionText">Воровское чутье: оцениваем натяжение...</span>
            </div>
          </div>

          <!-- Центральный холст механизма ловушки -->
          <div class="trap-canvas-wrapper">
            <div class="trap-manometer-hud">
              <div class="manometer-label-row">
                <span>Индикатор натяжения / давления:</span>
                <span class="manometer-val" id="pressureVal">65% (Взведено)</span>
              </div>
              <div class="pressure-track">
                <div class="pressure-fill" id="pressureBar" style="width: 65%;"></div>
                <div class="pressure-safe-zone" title="Безопасная зона со стопорным клином"></div>
              </div>
            </div>

            <canvas id="trapCanvas" class="game-canvas"></canvas>

            <!-- Переключаемый стопорный клин (Toggle) -->
            <div class="trap-controls-row">
              <button type="button" class="btn fantasy-btn secondary" id="btnPressureBypass" style="min-width: 320px; padding: 10px 18px;">
                <span id="bypassIcon">🔓</span>
                <span id="bypassText">Вставить стопорный клин (ПРОБЕЛ)</span>
              </button>
            </div>
          </div>
        </div>

        <div class="lock-controls-guide" style="margin-top: 14px;">
          <div class="guide-pill">
            <span class="guide-key">ЛКМ по жиле</span>
            <span>Перекусить кусачками</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">Клик по кнопке / ПРОБЕЛ</span>
            <span>Вставить/вынуть стопорный клин</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">Зелёная зона</span>
            <span>Безопасный срез ядовитых трубок</span>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#trapCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.cluesList = this.container.querySelector('#trapCluesList');
    this.intuitionBox = this.container.querySelector('#thiefIntuitionBox');
    this.intuitionText = this.container.querySelector('#intuitionText');
    this.pressureVal = this.container.querySelector('#pressureVal');
    this.pressureBar = this.container.querySelector('#pressureBar');
    this.btnPressureBypass = this.container.querySelector('#btnPressureBypass');
    this.bypassIcon = this.container.querySelector('#bypassIcon');
    this.bypassText = this.container.querySelector('#bypassText');
  }

  setupCanvas() {
    if (!this.canvas) return;
    const width = Math.min(520, Math.min(window.innerWidth - 48, 520));
    const height = 360;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.logicalWidth = width;
    this.logicalHeight = height;

    this.recalculateWireGeometry();
  }

  bindEvents() {
    this.canvas.addEventListener('mousemove', this.boundMouseMove);
    this.canvas.addEventListener('click', this.boundMouseDown);
    this.canvas.addEventListener('mouseleave', this.boundMouseLeave);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('resize', this.boundResize);

    // Клик по кнопке стопорного клина (Toggle)
    if (this.btnPressureBypass) {
      this.btnPressureBypass.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleBypass();
      });
    }
  }

  toggleBypass() {
    if (this.isDisarmed || this.isDetonated) return;
    this.isBypassActive = !this.isBypassActive;

    if (this.isBypassActive) {
      audio.playSteamHiss(0.35);
      audio.playTumblerClick(0.9);
    } else {
      audio.playTumblerClick(1.2);
    }

    this.updateBypassButtonUI();
  }

  updateBypassButtonUI() {
    if (!this.btnPressureBypass || !this.bypassIcon || !this.bypassText) return;

    if (this.isBypassActive) {
      this.btnPressureBypass.classList.add('active');
      this.bypassIcon.textContent = '🔒';
      this.bypassText.textContent = 'Стопорный клин ЗАФИКСИРОВАН (Клик для снятия)';
    } else {
      this.btnPressureBypass.classList.remove('active');
      this.bypassIcon.textContent = '🔓';
      this.bypassText.textContent = 'Вставить стопорный клин (ПРОБЕЛ)';
    }
  }

  onKeyDown(e) {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    if (e.code === 'Space') {
      this.toggleBypass();
      e.preventDefault();
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.boundMouseMove);
      this.canvas.removeEventListener('click', this.boundMouseDown);
      this.canvas.removeEventListener('mouseleave', this.boundMouseLeave);
    }
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('resize', this.boundResize);
  }

  // --- ГЕНЕРАЦИЯ ГОЛОВОЛОМКИ ЛОВУШКИ ---
  generateTrapPuzzle() {
    this.isDisarmed = false;
    this.isDetonated = false;
    this.disarmedWiresCount = 0;
    this.particles = [];
    this.hoveredWire = null;
    this.pressure = 65;
    this.pressureTarget = 65;
    this.isBypassActive = false;
    this.updateBypassButtonUI();

    // Аутентичные компоненты ловушек D&D
    const availableLines = [
      { id: 'steel_tension', name: 'Стальной натяжной трос (Пружина бойка)', hex: '#ef4444', rune: '⚙️', typeName: 'Натяжитель' },
      { id: 'copper_trip', name: 'Медная струна-растяжка (Сенсор пола)', hex: '#3b82f6', rune: '💧', typeName: 'Растяжка' },
      { id: 'gas_siphon', name: 'Трубка ядовитого газа (Клапан давления)', hex: '#10b981', rune: '🌿', typeName: 'Газовый сифон' },
      { id: 'counterweight', name: 'Балансировочная жила (Противовес лезвия)', hex: '#f59e0b', rune: '⚡', typeName: 'Противовес' },
      { id: 'arcane_thread', name: 'Руническая нить эфира (Магический взрыватель)', hex: '#a855f7', rune: '🔮', typeName: 'Арканный контур' },
      { id: 'death_core', name: 'Детонационная нить Смерти (Критический капсюль)', hex: '#475569', rune: '💀', typeName: 'Капсюль' }
    ];

    // Число компонентов зависит от DC (от 4 до 6)
    const count = dnd.dc <= 13 ? 4 : dnd.dc <= 18 ? 5 : 6;
    const shuffled = [...availableLines].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    this.wires = selected.map((line, index) => ({
      index,
      ...line,
      isCut: false,
      isCorrectNext: false,
      requiresLowPressure: false
    }));

    this.createRulesAndSolution();
    this.recalculateWireGeometry();
    this.renderRulesDOM();
    this.updateIntuition();
  }

  createRulesAndSolution() {
    this.rules = [];
    const ids = this.wires.map(w => w.id);
    const cutOrder = [];

    // Правило 1: Первичная деактивация
    if (ids.includes('copper_trip')) {
      this.rules.push({
        text: 'Сперва обезопасьте напольный триггер: перекусите <strong>Медную струну-растяжку (💧)</strong>.',
        targetId: 'copper_trip'
      });
      cutOrder.push('copper_trip');
    } else if (ids.includes('counterweight')) {
      this.rules.push({
        text: 'Ослабьте подвес качающегося лезвия: первым снимите <strong>Балансировочную жилу (⚡)</strong>.',
        targetId: 'counterweight'
      });
      cutOrder.push('counterweight');
    } else {
      const first = this.wires[0].id;
      this.rules.push({
        text: `Начните с разблокировки левого затвора: <strong>${this.wires[0].name} (${this.wires[0].rune})</strong>.`,
        targetId: first
      });
      cutOrder.push(first);
    }

    // Правило 2: Опасный компонент под давлением (требует стопорного клина!)
    if (ids.includes('death_core')) {
      const deathWire = this.wires.find(w => w.id === 'death_core');
      deathWire.requiresLowPressure = true;
      this.rules.push({
        text: 'ОПАСНО: Капсюль Смерти (💀) сдетонирует при натяжении! Режьте Детонационную нить <strong>СТРОГО со вставленным стопорным клином [🔒]</strong> (натяжение ниже 35%).',
        targetId: 'death_core'
      });
      cutOrder.push('death_core');
    } else if (ids.includes('gas_siphon')) {
      const gasWire = this.wires.find(w => w.id === 'gas_siphon');
      gasWire.requiresLowPressure = true;
      this.rules.push({
        text: 'Газовый сифон (🌿) удерживает удушающий яд под давлением: <strong>вставьте стопорный клин [🔒]</strong> перед перекусыванием трубки.',
        targetId: 'gas_siphon'
      });
      cutOrder.push('gas_siphon');
    } else if (ids.includes('steel_tension')) {
      this.rules.push({
        text: 'Сбросьте натяжение боевой пружины: перекусите <strong>Стальной трос (⚙️)</strong> вторым шагом.',
        targetId: 'steel_tension'
      });
      cutOrder.push('steel_tension');
    }

    // Правило 3: Финальный заземляющий контур
    const remaining = this.wires.filter(w => !cutOrder.includes(w.id));
    if (remaining.length > 0) {
      const finalWire = remaining[remaining.length - 1];
      this.rules.push({
        text: `Финальный фиксатор: завершите обезвреживание, перекусив <strong>${finalWire.name} (${finalWire.rune})</strong>.`,
        targetId: finalWire.id
      });
      cutOrder.push(finalWire.id);
    }

    this.solutionOrder = cutOrder;
    this.targetCutsRequired = cutOrder.length;
    this.updateNextExpectedWire();
  }

  updateNextExpectedWire() {
    const nextTargetId = this.solutionOrder[this.disarmedWiresCount];
    this.wires.forEach(w => {
      w.isCorrectNext = (w.id === nextTargetId && !w.isCut);
    });
  }

  renderRulesDOM() {
    if (!this.cluesList) return;
    this.cluesList.innerHTML = this.rules.map((rule, idx) => `
      <div class="clue-item" id="clue-item-${idx}">
        <span class="clue-num">${idx + 1}</span>
        <p class="clue-text" style="margin:0;">${rule.text}</p>
      </div>
    `).join('');
  }

  updateIntuition() {
    if (!this.intuitionBox || !this.intuitionText) return;

    if (dnd.bonus >= 4) {
      const nextTargetId = this.solutionOrder[this.disarmedWiresCount];
      const nextWire = this.wires.find(w => w.id === nextTargetId);
      if (nextWire) {
        let hint = `Ваш острый слух улавливает щелчок храповика: безопасен для среза <strong>${nextWire.name}</strong>.`;
        if (nextWire.requiresLowPressure && !this.isBypassActive) {
          hint += ` <em>(Не забудьте вставить стопорный клин!)</em>`;
        }
        this.intuitionText.innerHTML = hint;
        this.intuitionBox.style.display = 'flex';
      }
    } else if (dnd.bonus >= 2) {
      this.intuitionText.textContent = 'Опыт подсказывает проверять манометр перед каждым перекусыванием.';
      this.intuitionBox.style.display = 'flex';
    } else {
      this.intuitionBox.style.display = 'none';
    }
  }

  recalculateWireGeometry() {
    if (!this.logicalWidth || !this.logicalHeight) return;
    const topY = 65;
    const bottomY = this.logicalHeight - 65;
    const count = this.wires.length;
    const margin = 48;
    const step = (this.logicalWidth - margin * 2) / Math.max(1, count - 1);

    this.wires.forEach((wire, i) => {
      const x1 = margin + i * step;
      const x2 = margin + i * step + (Math.sin(i * 1.4) * 22);
      wire.x1 = x1;
      wire.y1 = topY;
      wire.x2 = x2;
      wire.y2 = bottomY;
      wire.cp1x = x1 + (i % 2 === 0 ? 28 : -28);
      wire.cp1y = topY + 75;
      wire.cp2x = x2 + (i % 2 === 0 ? -28 : 28);
      wire.cp2y = bottomY - 75;
    });
  }

  // --- ВЗАИМОДЕЙСТВИЕ ---
  onMouseMove(e) {
    if (this.isDisarmed || this.isDetonated) return;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let found = null;
    for (const wire of this.wires) {
      if (wire.isCut) continue;
      if (this.isPointNearWire(mouseX, mouseY, wire, 15)) {
        found = wire;
        break;
      }
    }

    if (found !== this.hoveredWire) {
      this.hoveredWire = found;
      if (found) {
        audio.playTumblerClick(1.4);
      }
    }
  }

  onMouseLeave() {
    this.hoveredWire = null;
  }

  onMouseDown(e) {
    if (this.isDisarmed || this.isDetonated) return;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (const wire of this.wires) {
      if (wire.isCut) continue;
      if (this.isPointNearWire(mouseX, mouseY, wire, 18)) {
        this.cutWire(wire, mouseX, mouseY);
        break;
      }
    }
  }

  isPointNearWire(px, py, wire, threshold = 16) {
    for (let t = 0.12; t <= 0.88; t += 0.05) {
      const it = 1 - t;
      const bx = it * it * it * wire.x1 + 3 * it * it * t * wire.cp1x + 3 * it * t * t * wire.cp2x + t * t * t * wire.x2;
      const by = it * it * it * wire.y1 + 3 * it * it * t * wire.cp1y + 3 * it * t * t * wire.cp2y + t * t * t * wire.y2;
      const dist = Math.hypot(px - bx, py - by);
      if (dist <= threshold) {
        return true;
      }
    }
    return false;
  }

  cutWire(wire, atX, atY) {
    wire.isCut = true;
    const isCorrect = wire.isCorrectNext;
    const pressureViolated = wire.requiresLowPressure && this.pressure > 38;

    if (isCorrect && !pressureViolated) {
      // Верный перерез троса!
      audio.playWireCut(false);
      audio.playMagicChime(1.1);
      this.spawnSparks(atX, atY, '#22c55e', 25);
      this.disarmedWiresCount++;

      const completedIndex = this.disarmedWiresCount - 1;
      const clueEl = this.container.querySelector(`#clue-item-${completedIndex}`);
      if (clueEl) clueEl.classList.add('completed');

      if (this.disarmedWiresCount >= this.targetCutsRequired) {
        this.triggerDisarmSuccess();
      } else {
        this.updateNextExpectedWire();
        this.updateIntuition();
      }
    } else {
      // Ошибка! Срабатывание бойка или выброс газа
      audio.playWireCut(true);
      audio.playExplosion();
      this.shakeAmount = 14;
      this.spawnSparks(atX, atY, '#ed4245', 45);
      this.spawnSmoke(atX, atY, 20);

      this.app.recordMistake();
      this.app.addNoise(30);

      this.pressure = Math.min(100, this.pressure + 25);

      if (this.app.mistakesCount >= dnd.maxAttempts) {
        this.triggerDetonation();
      } else {
        this.updateNextExpectedWire();
        this.updateIntuition();
      }
    }
  }

  triggerDisarmSuccess() {
    this.isDisarmed = true;
    this.hoveredWire = null;
    audio.playSuccess();
    setTimeout(() => {
      this.app.finishGame(true);
    }, 900);
  }

  triggerDetonation() {
    this.isDetonated = true;
    this.hoveredWire = null;
    audio.playFailure();
    this.shakeAmount = 25;
    setTimeout(() => {
      this.app.finishGame(false, { reason: 'trap_triggered' });
    }, 1000);
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
    // Давление / натяжение
    if (this.isBypassActive) {
      this.pressureTarget = 18; // безопасное сброшенное натяжение со шплинтом
    } else {
      this.pressureTarget = 62 + Math.sin(timestamp * 0.002) * 12;
    }
    this.pressure += (this.pressureTarget - this.pressure) * 0.08;

    if (this.pressureBar && this.pressureVal) {
      const rounded = Math.round(this.pressure);
      this.pressureBar.style.width = `${rounded}%`;
      let desc = rounded <= 35 ? 'Безопасно (Шплинт зафиксирован)' : rounded <= 70 ? 'Взведено' : 'ОПАСНОСТЬ СРАБАТЫВАНИЯ!';
      this.pressureVal.textContent = `${rounded}% (${desc})`;
      this.pressureVal.style.color = rounded <= 35 ? '#22c55e' : rounded <= 70 ? '#f59e0b' : '#ed4245';
    }

    if (this.shakeAmount > 0) {
      this.shakeAmount *= 0.9;
      if (this.shakeAmount < 0.2) this.shakeAmount = 0;
    }

    this.corePulse += 0.05;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity || 0.1;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

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

    // 1. Кованая стальная плита ловушки
    this.drawChassis(ctx, w, h);

    // 2. Верхняя и нижняя балки фиксации тросов
    this.drawTerminalRails(ctx, w, h);

    // 3. Тросы, жилы и трубки
    this.wires.forEach(wire => this.drawWire(ctx, wire));

    // 4. Центральный спусковой механизм / капсюль
    this.drawDetonatorCore(ctx, w / 2, h / 2);

    // 5. Искры и дым
    this.drawParticles(ctx);

    ctx.restore();
  }

  drawChassis(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#15171e');
    grad.addColorStop(0.5, '#1e212b');
    grad.addColorStop(1, '#111218');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Заклёпки
    ctx.fillStyle = '#64748b';
    const rivets = [
      [14, 14], [w - 14, 14], [14, h - 14], [w - 14, h - 14],
      [w / 2, 14], [w / 2, h - 14]
    ];
    rivets.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawTerminalRails(ctx, w, h) {
    ctx.fillStyle = '#262936';
    ctx.fillRect(18, 16, w - 36, 48);
    ctx.strokeStyle = '#3f4147';
    ctx.strokeRect(18, 16, w - 36, 48);

    ctx.fillRect(18, h - 64, w - 36, 48);
    ctx.strokeRect(18, h - 64, w - 36, 48);

    this.wires.forEach(wire => {
      this.drawTerminal(ctx, wire.x1, 40, wire);
      this.drawTerminal(ctx, wire.x2, h - 40, wire);
    });
  }

  drawTerminal(ctx, x, y, wire) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#1c1f28';
    ctx.fill();
    ctx.strokeStyle = wire.hex;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(wire.rune, x, y + 1);
    ctx.restore();
  }

  drawWire(ctx, wire) {
    ctx.save();
    const isHovered = (this.hoveredWire === wire && !wire.isCut);

    if (wire.isCut) {
      // Перекусанная жила: концы обвисли
      this.drawCutSegment(ctx, wire, wire.x1, wire.y1, wire.cp1x, wire.cp1y);
      this.drawCutSegment(ctx, wire, wire.x2, wire.y2, wire.cp2x, wire.cp2y);
    } else {
      ctx.beginPath();
      ctx.moveTo(wire.x1, wire.y1);
      ctx.bezierCurveTo(wire.cp1x, wire.cp1y, wire.cp2x, wire.cp2y, wire.x2, wire.y2);

      if (isHovered) {
        ctx.shadowColor = wire.hex;
        ctx.shadowBlur = 14;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.stroke();
      }

      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = '#0e1017';
      ctx.lineWidth = 6.5;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = wire.hex;
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Тонкая текстура витого троса
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawCutSegment(ctx, wire, xEnd, yEnd, cpx, cpy) {
    ctx.beginPath();
    ctx.moveTo(xEnd, yEnd);
    ctx.quadraticCurveTo(cpx, cpy, (xEnd + cpx) / 2, (yEnd + cpy) / 2);
    ctx.strokeStyle = wire.hex;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  drawDetonatorCore(ctx, cx, cy) {
    ctx.save();
    const pulse = Math.sin(this.corePulse) * 3;
    const radius = 36 + pulse;

    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#14161f';
    ctx.fill();
    ctx.strokeStyle = this.isBypassActive ? '#22c55e' : 'rgba(207, 168, 50, 0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();

    const coreGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);
    if (this.isDisarmed) {
      coreGrad.addColorStop(0, '#334155');
      coreGrad.addColorStop(1, '#0f172a');
    } else if (this.isDetonated) {
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.5, '#ef4444');
      coreGrad.addColorStop(1, '#7f1d1d');
    } else {
      const isDangerous = this.pressure > 70;
      coreGrad.addColorStop(0, isDangerous ? '#fee2e2' : '#e0e7ff');
      coreGrad.addColorStop(0.4, isDangerous ? '#ef4444' : '#6366f1');
      coreGrad.addColorStop(1, isDangerous ? '#7f1d1d' : '#312e81');
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.isDisarmed ? '🔒' : this.isDetonated ? '💥' : this.isBypassActive ? '🛡️' : '⚙️', cx, cy);

    ctx.restore();
  }

  spawnSparks(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 3,
        life: 1,
        decay: 0.03 + Math.random() * 0.04,
        gravity: 0.12
      });
    }
  }

  spawnSmoke(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -1 - Math.random() * 2,
        color: 'rgba(148, 163, 184, 0.4)',
        size: 10 + Math.random() * 15,
        life: 1,
        decay: 0.02
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

  reset() {
    this.generateTrapPuzzle();
  }

  onParametersChanged() {
    this.generateTrapPuzzle();
  }
}
